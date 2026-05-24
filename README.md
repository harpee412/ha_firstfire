# FirstFire 🔥

**AI-Powered Home Assistant Onboarding & Setup Guide**

FirstFire is a friendly, intelligent chatbot that helps new Home Assistant users get started quickly. It's powered by OpenAI and built on a production-ready React + FastAPI template.

## Features

🤖 **AI-Powered Help** - Ask questions, get real-time answers about Home Assistant  
🔐 **Secure Token Input** - Easy setup with your own OpenAI API key  
🎨 **Beautiful UI** - Dark theme with a clean, modern design  
⚡ **Fast & Responsive** - Built with React, TypeScript, and FastAPI  
🐳 **Docker Ready** - Runs as a Home Assistant add-on  
🔥 **Caveman Simple** - 4-step setup, no complexity  

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
┌─────────────────────────────────────────┐
│       FirstFire Web Interface            │
│   (React + TypeScript + Vite)            │
│                                         │
│  ▸ Welcome → Setup → Confirm → Chat     │
└────────────────┬────────────────────────┘
                 │ HTTP/JSON
                 ▼
┌─────────────────────────────────────────┐
│      FastAPI Backend (Python)            │
│                                         │
│  ▸ /api/chat                            │
│  ▸ /api/config/*                        │
│  ▸ /api/validate-token                  │
└────────────────┬────────────────────────┘
                 │
                 ▼
            OpenAI API
         (GPT-4 Turbo, etc)
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
- OpenAI integration
- Token configuration
- Basic chat
- 4-step onboarding

### 📋 v0.2.0 (Planned)
- Streaming responses
- Conversation history
- Better error messages

### 📋 v0.3.0 (Planned)
- Backend sessions (security)
- Rate limiting
- Usage stats

### 📋 v1.0.0 (Planned)
- Production hardening
- Full documentation

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

## Documentation

- **Quick Start**: See `QUICKSTART.md`
- **Technical Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Versioning**: See `VERSIONING.md`

## License

MIT - See LICENSE file

---

Built with ❤️ to make Home Assistant onboarding **simple, fun, and easy**. 🔥