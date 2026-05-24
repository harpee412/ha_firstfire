# React Python Home Assistant Add-on Boilerplate

A working Home Assistant add-on boilerplate using React, Vite, TypeScript, FastAPI, and Docker with Home Assistant Ingress support.

## Features

- Home Assistant add-on compatible
- FastAPI backend
- React frontend with TypeScript
- Vite build system
- Docker containerized
- Ingress-compatible UI
- API-ready structure
- Expandable architecture

## Project Structure

```
react_python_boilerplate/
├── backend/
│   ├── api/
│   │   └── routes.py
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── build.yaml
├── config.yaml
├── Dockerfile
├── requirements.txt
└── run.sh
```

## Requirements

- Home Assistant OS
- Home Assistant Supervisor
- GitHub repository
- Docker support

## Installation

### Add Repository to Home Assistant

1. Navigate to **Settings → Add-ons → Add-on Store → Repositories**
2. Add the repository URL:
   ```
   https://github.com/harpee412/home_boiler
   ```

### Install Add-on

1. Install **React Python Boilerplate**
2. Start the add-on
3. Open the Web UI

## Local Development

### Frontend Setup

```bash
cd react_python_boilerplate/frontend

npm install

npm run dev
```

The development server runs at:
```
http://localhost:5173
```

### Backend Setup

Create and activate a virtual environment:

```bash
cd react_python_boilerplate

python -m venv .venv

source .venv/bin/activate
```

On Windows PowerShell:
```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the backend:
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8099
```

The API is available at:
```
http://localhost:8099/api/hello
```

## API Examples

### Backend Endpoint

```python
@app.get("/api/hello")
async def hello():
    return {
        "message": "Hello from backend!"
    }
```

### Frontend API Call

```typescript
const response = await fetch("./api/hello");
const data = await response.json();
```

## Build Process

The Docker build for the add-on performs the following steps:

1. Install Python dependencies
2. Install frontend dependencies
3. Build React frontend with Vite
4. Serve frontend through FastAPI

## Home Assistant Ingress Configuration

Vite requires relative asset paths for Home Assistant Ingress compatibility.

Configure in `frontend/vite.config.ts`:
```typescript
base: "./"
```

## Future Expansion Ideas

- Zustand state management
- TailwindCSS
- WebSockets
- MQTT
- Home Assistant Supervisor API
- Camera streaming
- Object detection
- PostgreSQL
- Grafana dashboards

## Troubleshooting

### Blank White Screen

Usually caused by incorrect Vite asset paths.

**Verify:** `base: "./"` is configured in `vite.config.ts`

### Docker Build Fails

Verify the following:
- `Dockerfile` is not empty
- `build.yaml` exists
- `requirements.txt` is valid

### Frontend Dependency Issues

Delete the node modules and lock file:
```bash
rm -rf node_modules/
rm package-lock.json
```

Then reinstall:
```bash
npm install
```

## License

MIT