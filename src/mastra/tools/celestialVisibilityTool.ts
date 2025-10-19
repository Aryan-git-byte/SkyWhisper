import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as Astronomy from "astronomy-engine";

/**
 * Celestial Visibility Tool
 * 
 * Calculates which celestial bodies (Sun, Moon, planets) are visible
 * from a given location at a given time, including rise/set times
 * and visibility windows.
 */

interface CelestialBodyInfo {
  name: string;
  isVisible: boolean;
  altitude: number; // degrees above horizon
  azimuth: number; // degrees from north
  riseTime: string | null;
  setTime: string | null;
  transitTime: string | null; // when it's highest in sky
  magnitude: number | null; // visual brightness
  illumination: number | null; // percentage illuminated (for Moon)
  visibilityWindow: string; // human-readable description
}

function formatTime(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

function calculateVisibilityWindow(rise: Date | null, set: Date | null, now: Date): string {
  if (!rise || !set) return "Not visible today";
  
  const riseTime = rise.getTime();
  const setTime = set.getTime();
  const nowTime = now.getTime();
  
  if (nowTime < riseTime) {
    const hoursUntil = (riseTime - nowTime) / (1000 * 60 * 60);
    return `Rises in ${hoursUntil.toFixed(1)} hours`;
  } else if (nowTime > setTime) {
    return "Already set today";
  } else {
    const hoursRemaining = (setTime - nowTime) / (1000 * 60 * 60);
    return `Visible now, sets in ${hoursRemaining.toFixed(1)} hours`;
  }
}

async function getCelestialBodyInfo(
  body: Astronomy.Body,
  observer: Astronomy.Observer,
  date: Date,
  logger?: any
): Promise<CelestialBodyInfo> {
  const name = Astronomy.Body[body];
  
  logger?.info(`🔭 [CelestialVisibility] Calculating info for ${name}`, { body: name });
  
  // Get equatorial coordinates (RA/Dec) for the body
  const equatorial = Astronomy.Equator(body, date, observer, true, true);
  
  // Convert to horizontal coordinates (azimuth/altitude)
  const horizon = Astronomy.Horizon(
    date,
    observer,
    equatorial.ra,
    equatorial.dec,
    'normal'
  );
  const isVisible = horizon.altitude > 0;
  
  // Get rise/set times for today
  let riseDate: Date | null = null;
  let setDate: Date | null = null;
  let transitDate: Date | null = null;
  
  try {
    const todayStart = new Date(date);
    todayStart.setHours(0, 0, 0, 0);
    
    // Search for rise time (direction = +1)
    const rise = Astronomy.SearchRiseSet(
      body,
      observer,
      +1,
      todayStart,
      1
    );
    if (rise) riseDate = rise.date;
    
    // Search for set time (direction = -1)
    const set = Astronomy.SearchRiseSet(
      body,
      observer,
      -1,
      todayStart,
      1
    );
    if (set) setDate = set.date;
    
    // Calculate transit (highest point in sky) - approximately halfway between rise and set
    if (riseDate && setDate) {
      const transitTime = (riseDate.getTime() + setDate.getTime()) / 2;
      transitDate = new Date(transitTime);
    }
  } catch (error) {
    logger?.error(`❌ [CelestialVisibility] Error calculating rise/set for ${name}`, { error });
  }
  
  // Get magnitude (brightness)
  let magnitude: number | null = null;
  let illumination: number | null = null;
  
  try {
    const illum = Astronomy.Illumination(body, date);
    magnitude = illum.mag;
    
    if (body === Astronomy.Body.Moon) {
      illumination = illum.phase_fraction * 100;
    }
  } catch (error) {
    logger?.error(`❌ [CelestialVisibility] Error calculating illumination for ${name}`, { error });
  }
  
  const visibilityWindow = calculateVisibilityWindow(riseDate, setDate, date);
  
  return {
    name,
    isVisible,
    altitude: horizon.altitude,
    azimuth: horizon.azimuth,
    riseTime: formatTime(riseDate),
    setTime: formatTime(setDate),
    transitTime: formatTime(transitDate),
    magnitude,
    illumination,
    visibilityWindow,
  };
}

export const celestialVisibilityTool = createTool({
  id: "celestial-visibility-tool",
  
  description: `Calculates which celestial bodies (Sun, Moon, planets) are visible from a specific location at a given time. 
  Returns detailed information about visibility windows, rise/set times, and current positions for major celestial objects.`,
  
  inputSchema: z.object({
    latitude: z.number().min(-90).max(90).describe("Observer's latitude in degrees (-90 to 90)"),
    longitude: z.number().min(-180).max(180).describe("Observer's longitude in degrees (-180 to 180)"),
    elevation: z.number().optional().default(0).describe("Observer's elevation above sea level in meters (default: 0)"),
    time: z.string().optional().describe("ISO timestamp for observation time (default: current time)"),
  }),
  
  outputSchema: z.object({
    observationTime: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
      elevation: z.number(),
    }),
    celestialBodies: z.array(z.object({
      name: z.string(),
      isVisible: z.boolean(),
      altitude: z.number(),
      azimuth: z.number(),
      riseTime: z.string().nullable(),
      setTime: z.string().nullable(),
      transitTime: z.string().nullable(),
      magnitude: z.number().nullable(),
      illumination: z.number().nullable(),
      visibilityWindow: z.string(),
    })),
    summary: z.string(),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    
    logger?.info('🔧 [CelestialVisibility] Starting calculation', {
      latitude: context.latitude,
      longitude: context.longitude,
      elevation: context.elevation,
      time: context.time,
    });
    
    // Create observer
    const observer = new Astronomy.Observer(
      context.latitude,
      context.longitude,
      context.elevation || 0
    );
    
    // Parse observation time
    const observationDate = context.time ? new Date(context.time) : new Date();
    
    logger?.info('📝 [CelestialVisibility] Observer created', {
      observer,
      date: observationDate.toISOString(),
    });
    
    // Calculate info for all major celestial bodies
    const bodies = [
      Astronomy.Body.Sun,
      Astronomy.Body.Moon,
      Astronomy.Body.Mercury,
      Astronomy.Body.Venus,
      Astronomy.Body.Mars,
      Astronomy.Body.Jupiter,
      Astronomy.Body.Saturn,
      Astronomy.Body.Uranus,
      Astronomy.Body.Neptune,
    ];
    
    const celestialBodies: CelestialBodyInfo[] = [];
    
    for (const body of bodies) {
      const info = await getCelestialBodyInfo(body, observer, observationDate, logger);
      celestialBodies.push(info);
    }
    
    // Sort by visibility and altitude (highest visible objects first)
    celestialBodies.sort((a, b) => {
      if (a.isVisible && !b.isVisible) return -1;
      if (!a.isVisible && b.isVisible) return 1;
      return b.altitude - a.altitude;
    });
    
    // Create summary
    const visibleCount = celestialBodies.filter(b => b.isVisible).length;
    const visibleNames = celestialBodies
      .filter(b => b.isVisible)
      .map(b => b.name)
      .join(', ');
    
    const summary = visibleCount > 0
      ? `Currently ${visibleCount} celestial bodies visible: ${visibleNames}`
      : "No major celestial bodies currently visible from this location";
    
    logger?.info('✅ [CelestialVisibility] Calculation complete', {
      visibleCount,
      summary,
    });
    
    return {
      observationTime: observationDate.toISOString(),
      location: {
        latitude: context.latitude,
        longitude: context.longitude,
        elevation: context.elevation || 0,
      },
      celestialBodies,
      summary,
    };
  },
});
