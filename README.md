# 🌟 SkyWhisper - Your Personal Astronomy Assistant

<div align="center">

![SkyWhisper Banner](https://img.shields.io/badge/SkyWhisper-Astronomy%20Bot-blue?style=for-the-badge&logo=telegram)

**Discover what's visible in the night sky, right from your Telegram messenger** 🔭

[![Live Demo](https://img.shields.io/badge/Try%20It-Live%20on%20Telegram-0088cc?style=for-the-badge&logo=telegram)](https://t.me/Sky_WhisperBot)
[![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render)](https://skywhisper-0fxg.onrender.com)

[![GitHub Stars](https://img.shields.io/github/stars/Aryan-git-byte/SkyWhisper?style=social)](https://github.com/Aryan-git-byte/SkyWhisper/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/Aryan-git-byte/SkyWhisper?style=social)](https://github.com/Aryan-git-byte/SkyWhisper/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/Aryan-git-byte/SkyWhisper)](https://github.com/Aryan-git-byte/SkyWhisper/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### 🚀 Quick Links

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## 📖 About

**SkyWhisper** is an intelligent Telegram bot that brings the wonders of astronomy to your fingertips. Simply message the bot with your location, and it will tell you exactly which celestial bodies are visible in your night sky right now!

Using advanced astronomical calculations and AI-powered natural language understanding, SkyWhisper provides:
- 🪐 Real-time planetary visibility from your location
- 🌙 Moon phase information and viewing times
- ⭐ Rise, set, and transit times for celestial objects
- 🌅 Best viewing recommendations for each object
- 🔭 Telescope observing tips

---

## ✨ Features

### 🌍 Location-Based Astronomy
- Calculate celestial visibility from any coordinates on Earth
- Support for latitude, longitude, and elevation
- Automatic timezone handling

### 🤖 AI-Powered Responses
- Natural language understanding powered by DeepSeek via OpenRouter
- Conversational interface - just chat naturally!
- Context-aware recommendations

### 🔭 Comprehensive Celestial Data
- **Planets**: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune
- **Moon**: Phase information, illumination percentage, viewing times
- **Sun**: Position tracking (with safety warnings!)
- Rise/set times and transit calculations
- Altitude, azimuth, and magnitude data

### ⚡ Real-Time Processing
- Instant calculations using the astronomy-engine library
- Workflow-based architecture with Inngest
- Memory persistence for conversation context

### 💬 Telegram Integration
- Simple, intuitive chat interface
- Works on all Telegram platforms (mobile, desktop, web)
- No app installation required!

---

## 🎬 Demo

<div align="center">

### 💬 Example Conversations

```
You: Hi! What can I see tonight?

Bot: Hello! I'd be happy to help you discover what's visible in 
the night sky! To provide accurate information, I'll need your 
location. Could you please share your approximate latitude and 
longitude, or just tell me your city?

You: I'm in Patna

Bot: Great! Let me check what's visible from Patna tonight...

Currently 4 celestial bodies are visible: Saturn, Neptune, Mars, 
and Mercury!

🪐 Saturn - Currently visible! Best viewing around 8:45 PM when 
it's highest in the sky. Perfect for telescope viewing - don't 
miss those spectacular rings!

♂️ Mars - Visible now! Sets in about 3.2 hours. The Red Planet 
is showing well tonight.

☿️ Mercury - Morning object: Rises at 5:23 AM. Best viewing 1-2 
hours after rise, just before sunrise.

🔵 Neptune - Currently visible but very faint (magnitude 7.8). 
You'll need a telescope to spot this one!

Would you like detailed information about any specific object?
```

</div>

---

## 🛠️ Tech Stack

<div align="center">

### Core Technologies

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Mastra](https://img.shields.io/badge/Mastra-Framework-purple?style=for-the-badge)](https://mastra.ai/)

### AI & APIs

[![OpenRouter](https://img.shields.io/badge/OpenRouter-DeepSeek-FF6B6B?style=for-the-badge)](https://openrouter.ai/)
[![Telegram Bot API](https://img.shields.io/badge/Telegram-Bot%20API-26A5E4?style=for-the-badge&logo=telegram)](https://core.telegram.org/bots/api)

### Infrastructure

[![Inngest](https://img.shields.io/badge/Inngest-Workflows-6C47FF?style=for-the-badge)](https://www.inngest.com/)
[![Render](https://img.shields.io/badge/Render-Deployment-46E3B7?style=for-the-badge&logo=render)](https://render.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

</div>

### Key Libraries

- **astronomy-engine** - Precise astronomical calculations
- **@mastra/core** - Agent and workflow framework
- **@mastra/inngest** - Workflow orchestration
- **@openrouter/ai-sdk-provider** - AI model integration
- **ai** (Vercel AI SDK) - LLM streaming and tool calling

---

## 📦 Installation

### Prerequisites

- Node.js >= 20.9.0
- npm or yarn
- A Telegram Bot Token ([Get one from @BotFather](https://t.me/botfather))
- OpenRouter API Key ([Get one here](https://openrouter.ai/))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aryan-git-byte/SkyWhisper.git
   cd SkyWhisper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   OPENROUTER_API_KEY=your_openrouter_api_key
   PORT=5000
   ```

4. **Start the Inngest dev server**
   ```bash
   npm run dev:inngest
   # Or manually:
   ./scripts/inngest.sh
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

6. **Set up Telegram webhook** (for local testing, use ngrok)
   ```bash
   # In a new terminal
   ngrok http 5000
   
   # Then set webhook
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-ngrok-url.ngrok.io/webhooks/telegram/action"}'
   ```

---

## 🚀 Deployment

### Deploy to Render

1. **Fork this repository**

2. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Use the following settings:
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `node scripts/start-render.js`
     - **Environment**: Node

3. **Set environment variables** in Render Dashboard:
   ```
   TELEGRAM_BOT_TOKEN=your_token
   OPENROUTER_API_KEY=your_key
   PORT=10000
   NODE_ENV=production
   MASTRA_HIDE_CLOUD_CTA=true
   ```

4. **Deploy!** Render will automatically build and deploy your bot

5. **Set Telegram webhook** to your Render URL:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.onrender.com/webhooks/telegram/action"}'
   ```

### Deploy to Other Platforms

The bot can be deployed to any Node.js hosting platform. Key requirements:
- Node.js 20.9.0 or higher
- Persistent file system for SQLite (or configure PostgreSQL)
- Support for long-running processes (for Inngest server)

---

## 💡 Usage

### Basic Commands

1. **Start a conversation**
   ```
   /start
   ```
   or simply say "Hi!"

2. **Ask about visibility**
   ```
   What can I see in the sky tonight?
   What planets are visible?
   I'm in [your city]
   ```

3. **Get specific information**
   ```
   When does Jupiter rise?
   Tell me about Saturn
   What phase is the Moon?
   ```

### Tips for Best Results

- 📍 Provide your location for accurate calculations
- 🌃 Ask about specific celestial objects for detailed info
- 🔭 Mention if you have a telescope for specialized tips
- 🌙 Check Moon phase for best stargazing nights

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Telegram User                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│            Telegram Bot API (Webhook)                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Mastra Server (Hono)                    │
│  ┌──────────────────────────────────────────────┐  │
│  │   Telegram Trigger Handler                    │  │
│  └────────────────┬─────────────────────────────┘  │
└──────────────────┼────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│           Inngest Workflow Engine                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  celestialTelegramWorkflow                    │  │
│  │                                                │  │
│  │  Step 1: useCelestialAgent                   │  │
│  │  ├─ Call Celestial Agent                     │  │
│  │  ├─ Use celestialVisibilityTool              │  │
│  │  └─ Generate AI response                     │  │
│  │                                                │  │
│  │  Step 2: sendTelegramReply                   │  │
│  │  └─ Send message back to user                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Celestial Agent                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  DeepSeek LLM (via OpenRouter)               │  │
│  │  + celestialVisibilityTool                    │  │
│  │  + Conversation Memory (SQLite)               │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         Astronomy Engine Library                     │
│  (Planetary calculations & ephemeris data)           │
└─────────────────────────────────────────────────────┘
```

### Key Components

1. **Telegram Trigger**: Receives webhook events from Telegram
2. **Mastra Workflow**: Orchestrates the bot's response pipeline
3. **Celestial Agent**: AI-powered assistant with astronomy knowledge
4. **Visibility Tool**: Performs astronomical calculations
5. **Memory System**: Maintains conversation context

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather | ✅ Yes | - |
| `OPENROUTER_API_KEY` | API key for OpenRouter (DeepSeek) | ✅ Yes | - |
| `PORT` | Port for the web server | ❌ No | `5000` |
| `NODE_ENV` | Environment (development/production) | ❌ No | `development` |
| `MASTRA_HIDE_CLOUD_CTA` | Hide Mastra cloud promotions | ❌ No | `false` |

### Customization

#### Change AI Model

Edit `src/mastra/agents/celestialAgent.ts`:
```typescript
model: openrouter("deepseek/deepseek-chat"), // Change this
```

Available models on OpenRouter:
- `openai/gpt-4-turbo`
- `anthropic/claude-3-opus`
- `google/gemini-pro`

#### Modify Agent Instructions

Customize the agent's personality and behavior in `src/mastra/agents/celestialAgent.ts`:
```typescript
instructions: `Your custom instructions here...`
```

#### Add New Tools

Create tools in `src/mastra/tools/` and register them with the agent.

---

## 🧪 Testing

### Run Type Checking
```bash
npm run check
```

### Format Code
```bash
npm run format
```

### Test Telegram Webhook (Local)
```bash
curl -X POST http://localhost:5000/webhooks/telegram/action \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "message_id": 1,
      "from": {"id": 123456789, "first_name": "Test"},
      "chat": {"id": 123456789, "type": "private"},
      "date": 1234567890,
      "text": "Hi"
    }
  }'
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use Prettier for formatting: `npm run format`
- Add comments for complex logic
- Write descriptive commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Mastra](https://mastra.ai/)** - Powerful AI agent framework
- **[astronomy-engine](https://github.com/cosinekitty/astronomy)** - Accurate astronomical calculations
- **[OpenRouter](https://openrouter.ai/)** - Access to DeepSeek AI
- **[Telegram](https://telegram.org/)** - Excellent bot platform
- **[Render](https://render.com/)** - Free hosting for the bot

---

## 📧 Contact

**Aryan Kumar**

- GitHub: [@Aryan-git-byte](https://github.com/Aryan-git-byte)
- Email: aryan17550@gmail.com

---

## 🌟 Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with others

---

<div align="center">

### Made with ❤️ and ☕ by Aryan Kumar

**SkyWhisper** - *Bringing the cosmos to your conversations*

[![Star History Chart](https://api.star-history.com/svg?repos=Aryan-git-byte/SkyWhisper&type=Date)](https://star-history.com/#Aryan-git-byte/SkyWhisper&Date)

</div>
