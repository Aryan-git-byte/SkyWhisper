import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as Astronomy from "astronomy-engine";

/**
 * Celestial Visibility Tool - FIXED VERSION
 * 
 * Calculates which celestial bodies (Sun, Moon, planets) are visible
 * from a given location at a given time, including rise/set times
 * and visibility windows.
 */

interface CelestialBodyInfo {
  name: string;
  isVisible: boolean;
  altitude: number;
  azimuth: number;
  riseTime: string | null;
  setTime: string | null;
  transitTime: string | null;
  magnitude: number | null;
  illumination: number | null;
  visibilityWindow: string;
  bestViewingTime: string; // NEW: When to actually observe this object
  phaseDescription: string | null; // NEW: For Moon phases
}

function formatTime(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

function getMoonPhaseDescription(illumination: number): string {
  if (illumination < 1) return "New Moon";
  if (illumination < 25) return "Waxing Crescent";
  if (illumination < 35) return "First Quarter";
  if (illumination < 65) return "Waxing Gibbous";
  if (illumination < 75) return "Full Moon";
  if (illumination < 85) return "Waning Gibbous";
  if (illumination < 99) return "Waning Crescent";
  return "Full Moon";
}

function getBestViewingTime(
  body: Astronomy.Body,
  rise: Date | null,
  set: Date | null,
  transit: Date | null,
  now: Date,
  altitude: number,
  bodyName: string
): string {
  if (!rise || !set) return "Not visible in the next 24 hours";
  
  const riseTime = rise.getTime();
  const setTime = set.getTime();
  const nowTime = now.getTime();
  
  // Sun is special - we don't recommend viewing it directly
  if (body === Astronomy.Body.Sun) {
    return "⚠️ NEVER view the Sun directly through a telescope without proper solar filters!";
  }
  
  // Moon can be viewed anytime it's up
  if (body === Astronomy.Body.Moon) {
    if (nowTime >= riseTime && nowTime <= setTime) {
      return `Currently visible! Best viewing: ${formatTime(transit)} (when highest in sky)`;
    } else if (nowTime < riseTime) {
      const hoursUntil = (riseTime - nowTime) / (1000 * 60 * 60);
      return `Will rise in ${hoursUntil.toFixed(1)} hours at ${formatTime(rise)}`;
    } else {
      return `Already set. Next rise: ${formatTime(rise)} tomorrow`;
    }
  }
  
  // For planets, determine if they're evening or morning objects
  const sunRise = rise; // Approximate - we'd need actual sun times
  const sunSet = set;
  
  // If the object sets after sunset, it's an evening object
  // If it rises before sunrise, it's a morning object
  
  if (nowTime >= riseTime && nowTime <= setTime && altitude > 0) {
    const hoursRemaining = (setTime - nowTime) / (1000 * 60 * 60);
    if (hoursRemaining > 2) {
      return `Currently visible! Observe within the next ${hoursRemaining.toFixed(1)} hours. Best: ${formatTime(transit)}`;
    } else {
      return `Currently visible but setting soon (in ${hoursRemaining.toFixed(1)} hours)`;
    }
  } else if (nowTime < riseTime) {
    const hoursUntil = (riseTime - nowTime) / (1000 * 60 * 60);
    
    // Determine if it's a morning or evening object based on rise time
    const riseHour = rise.getHours();
    if (riseHour >= 20 || riseHour <= 4) {
      return `Morning object: Rises at ${formatTime(rise)} (${hoursUntil.toFixed(1)} hours from now). Best viewing: 1-2 hours after rise.`;
    } else if (riseHour >= 5 && riseHour <= 12) {
      return `Not visible tonight. Rises during daytime at ${formatTime(rise)}.`;
    } else {
      return `Evening object: Rises at ${formatTime(rise)} (${hoursUntil.toFixed(1)} hours from now). Best viewing: around ${formatTime(transit)}.`;
    }
  } else {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `Already set for today. Next visible: ${formatTime(rise)} tomorrow`;
  }
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
  
  // An object is visible if it's above the horizon AND
  // for planets/moon: the Sun must be down (or twilight)
  const isVisible = horizon.altitude > 0;
  
  // Get rise/set times - search forward from current time
  let riseDate: Date | null = null;
  let setDate: Date | null = null;
  let transitDate: Date | null = null;
  
  try {
    // Search for NEXT rise (forward in time)
    const riseSearch = Astronomy.SearchRiseSet(
      body,
      observer,
      +1, // direction: rising
      date,
      2 // search 2 days ahead
    );
    if (riseSearch) riseDate = riseSearch.date;
    
    // Search for NEXT set (forward in time)
    const setSearch = Astronomy.SearchRiseSet(
      body,
      observer,
      -1, // direction: setting
      date,
      2 // search 2 days ahead
    );
    if (setSearch) setDate = setSearch.date;
    
    // Calculate transit (highest point) - search forward
    const hourAngleSearch = Astronomy.SearchHourAngle(
      body,
      observer,
      0, // hour angle = 0 means transit
      date,
      +1 // search forward
    );
    if (hourAngleSearch) transitDate = hourAngleSearch.time.date;
    
  } catch (error) {
    logger?.error(`❌ [CelestialVisibility] Error calculating rise/set for ${name}`, { error });
  }
  
  // Get magnitude (brightness) and illumination
  let magnitude: number | null = null;
  let illumination: number | null = null;
  let phaseDescription: string | null = null;
  
  try {
    const illum = Astronomy.Illumination(body, date);
    magnitude = illum.mag;
    
    if (body === Astronomy.Body.Moon) {
      illumination = illum.phase_fraction * 100;
      phaseDescription = getMoonPhaseDescription(illumination);
    }
  } catch (error) {
    logger?.error(`❌ [CelestialVisibility] Error calculating illumination for ${name}`, { error });
  }
  
  const visibilityWindow = calculateVisibilityWindow(riseDate, setDate, date);
  const bestViewingTime = getBestViewingTime(
    body,
    riseDate,
    setDate,
    transitDate,
    date,
    horizon.altitude,
    name
  );
  
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
    bestViewingTime,
    phaseDescription,
  };
}

export const celestialVisibilityTool = createTool({
  id: "celestial-visibility-tool",
  
  description: `Calculates which celestial bodies (Sun, Moon, planets) are visible from a specific location at a given time. 
  Returns detailed information about visibility windows, rise/set times, current positions, and BEST VIEWING TIMES for major celestial objects.`,
  
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
      bestViewingTime: z.string(),
      phaseDescription: z.string().nullable(),
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
    
    // Create summary with better context
    const currentlyVisible = celestialBodies.filter(b => b.isVisible && b.name !== 'Sun');
    const visibleCount = currentlyVisible.length;
    const visibleNames = currentlyVisible.map(b => b.name).join(', ');
    
    const summary = visibleCount > 0
      ? `Currently ${visibleCount} celestial bodies visible: ${visibleNames}. Check 'bestViewingTime' for optimal observation times.`
      : "No major celestial bodies currently visible from this location. Check individual objects for their next rise times.";
    
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