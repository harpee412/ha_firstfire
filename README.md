# FirstFire 🔥

**AI-Powered Home Assistant Control & Analytics**

FirstFire transforms Home Assistant setup with an intelligent multi-agent system, beautiful dashboard, and time-series analytics. Control your lights, switches, and automations through natural language, with full conversation context and historical insights powered by InfluxDB.

## Features

🤖 **Multi-Agent System** - Specialized agents for lights, switches, automations, and analytics  
💬 **Natural Language Control** - "Turn off basement desk lights" → Executes immediately  
📊 **Dashboard Interface** - System status cards and quick action buttons  
📈 **Analytics** - Historical trends and patterns with InfluxDB integration  
🔐 **Secure Configuration** - OpenAI token via Home Assistant options  
🎨 **Cyberpunk Aesthetic** - Dark theme with cyan/magenta accents and scanlines  
⚡ **State Verification** - Confirms actions actually worked  
🐳 **Docker Ready** - Runs as a Home Assistant add-on  

## Quick Start

### 1. Get OpenAI Token
Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys), create a new key.

### 2. Local Development
```bash
cd react_python_boilerplate

# Backend
pip install -r requirements.txt
cd backend && python -m uvicorn main:app --reload --port 8099

# Frontend (in another terminal)
cd frontend
npm install
npm run build
```

Visit: http://localhost:8099

### 3. Home Assistant Deployment
```bash
docker build -t firstfire .
docker run -p 8099:8099 firstfire
```

Then add FirstFire to your Home Assistant add-ons via the directory.

## Architecture

```
Frontend (React)
├── Sidebar (sticky navigation)
├── Dashboard (home page)
│   ├── Status cards (lights, switches, automations, analytics)
│   └── Quick actions
├── Chat (conversation with context)
└── Settings (InfluxDB configuration)
    │
    ├→ AgentRouter
    │  ├→ LightAgent → Home Assistant API
    │  ├→ SwitchAgent → Home Assistant API
    │  ├→ AutomationAgent → Home Assistant API
    │  ├→ SystemAgent → Home Assistant API
    │  ├→ AnalyticsAgent → InfluxDB
    │  └→ OpenAI API (for reasoning)
    │
    └→ Backend (FastAPI)
       ├─ Chat endpoints with multi-turn context
       ├─ Configuration management (options.json, env vars)
       ├─ InfluxDB auto-detection & configuration
       └─ Home Assistant supervisor integration
```

## Project Structure

```
ha_firstfire/
├── README.md                      ← You are here
├── QUICKSTART.md                  ← Quick reference
├── IMPLEMENTATION_SUMMARY.md      ← Technical details
├── VERSIONING.md                  ← Version management
│
└── react_python_boilerplate/      (v0.1.0)
    ├── config.yaml                ← Home Assistant config
    ├── Dockerfile                 ← Docker build
    ├── requirements.txt           ← Python deps
    ├── run.sh                     ← Startup script
    │
    ├── backend/
    │   ├── main.py               ← FastAPI app
    │   ├── config.py             ← Config management
    │   ├── .env.example          ← Env template
    │   └── api/
    │       └── routes.py         ← Chat + config endpoints
    │
    └── frontend/
        ├── package.json          ← Node.js deps
        ├── vite.config.ts        ← Vite configuration
        ├── src/
        │   ├── App.tsx           ← Main component
        │   ├── OnboardingFlow.tsx ← Onboarding logic
        │   ├── types.ts          ← TypeScript definitions
        │   ├── api.ts            ← API client
        │   └── components/       ← UI screens
        │
        └── dist/                 ← Built frontend
```

## Configuration

Users configure FirstFire in Home Assistant settings:

```yaml
# Home Assistant Add-on Config
openai_token: "sk-..."           # User's OpenAI API key
max_tokens: 500                   # Response length
model: "gpt-4-turbo"              # GPT model selection
system_prompt: "..."              # Custom AI behavior
```

Or via environment variables (backend/.env):
```bash
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4-turbo
OPENAI_MAX_TOKENS=500
```

## API Endpoints

### Chat
- `POST /api/chat` - Send message to OpenAI

### Configuration
- `GET /api/config/status` - Get current config
- `POST /api/config/init` - Save new config
- `POST /api/validate-token` - Verify token works

### Utilities
- `GET /api/health` - Health check
- `GET /api/models` - List available models

See `IMPLEMENTATION_SUMMARY.md` for full API documentation.

## Development

### Tech Stack
- **Frontend**: React 18.3 + TypeScript 5.6 + Vite 5.4
- **Backend**: FastAPI 0.136 + Uvicorn 0.47 + Python 3.11
- **AI**: OpenAI API (GPT-4 Turbo, GPT-4, GPT-3.5-turbo)
- **Deployment**: Docker + Home Assistant Ingress

### Running Locally

**Backend:**
```bash
cd react_python_boilerplate
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8099
```

**Frontend:**
```bash
cd react_python_boilerplate/frontend
npm install
npm run build
# Served by FastAPI at /
```

**Test:**
```bash
curl http://localhost:8099/api/health
curl http://localhost:8099/api/config/status
```

### Making Changes

1. Update code
2. Bump version in `config.yaml` and `backend/main.py`
3. Commit with message: `bump: version X.Y.Z → X.Y.Z`
4. Tag release: `git tag vX.Y.Z`

See `VERSIONING.md` for detailed guide.

## Roadmap

### ✅ v0.1.0 (Current)
- Multi-agent system (Light, Switch, Automation, Analytics, System)
- Dashboard-first UI with status cards
- Natural language control with state verification
- Multi-turn conversation context preservation
- InfluxDB integration with auto-detection
- OpenAI token configuration
- Cyberpunk aesthetic (Noto Sans, dark theme, scanlines)
- Markdown response formatting

### 📋 v0.2.0 (Planned)
- Energy consumption analytics with InfluxDB
- Anomaly detection in historical data
- Automation recommendations based on patterns
- Custom quick actions per home/user
- Streaming responses for faster feedback

### 📋 v0.3.0 (Planned)
- Multi-user support with permissions
- Conversation history in InfluxDB
- Voice control integration
- Rate limiting & usage stats

### 📋 v1.0.0 (Planned)
- Production hardening
- Mobile app version
- AI-powered home setup wizard
- Community shared automations

## Security

### Implemented ✅
- Token format validation
- Token masking in UI
- API error handling
- HTTPS via Home Assistant Ingress

### Future 📋
- Backend session storage
- Token expiry handling
- Rate limiting

## Troubleshooting

### "Token validation failed"
- Check token starts with `sk-`
- Verify token at platform.openai.com

### "Failed to connect to backend"
- Check port 8099 is accessible
- Verify FastAPI is running
- Check browser console

### "Empty responses from AI"
- Check OpenAI quota/billing
- Verify max_tokens setting

## New in v0.1.0

### Dashboard
Configured instances now land on a beautiful dashboard showing:
- **Lights Card**: Count of on/off lights
- **Switches Card**: Count of on/off switches  
- **Automations Card**: Total number of automations
- **Analytics Card**: InfluxDB connection status
- **Quick Actions**: Configurable button commands

### Multi-Agent System
Messages are intelligently routed to specialized agents:
- **Light/Switch Control**: Direct API calls with state verification
- **Automation Queries**: Information about existing automations
- **System Status**: Overview of entities, integrations, and metrics
- **Analytics**: Historical trends and patterns from InfluxDB

### InfluxDB Integration
Optional time-series database integration:
- Auto-detection on startup
- Manual configuration via Settings UI
- Historical trend queries
- Usage pattern analysis
- Energy consumption tracking (coming soon)

### Conversation Context
Multi-turn conversations that remember state:
```
User: "How many lights are on?"
Bot: "You have 12 lights on"

User: "Turn off the kitchen lights"
Bot: "Kitchen lights are now off"

User: "How many now?"
Bot: "You have 11 lights on now" ← Remembers previous context
```

## Documentation

- **Quick Reference**: See `QUICK_REFERENCE.md` - API endpoints and commands
- **Testing Guide**: See `TESTING_GUIDE.md` - Complete test scenarios
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md` - Technical architecture
- **Complete Status**: See `COMPLETE_STATUS.md` - What's implemented

## License

MIT - See LICENSE file

---

Built with ❤️ to make Home Assistant onboarding **simple, fun, and easy**. 🔥