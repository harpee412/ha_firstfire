from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from .config import get_config_manager
from .api.routes import router as api_router

# Initialize configuration
config_manager = get_config_manager()

app = FastAPI(
    title="FirstFire",
    description="AI-Powered Home Assistant Onboarding",
    version="0.1.0"
)

# Register API routes
app.include_router(api_router, prefix="/api")

BASE_DIR = Path(__file__).resolve().parent.parent

FRONTEND_DIST = BASE_DIR / "frontend" / "dist"


@app.get("/api/health")
async def health() -> dict[str, bool]:
    """Health check endpoint"""
    return {
        "healthy": True,
        "configured": config_manager.get_config().is_configured()
    }


@app.get("/api/hello")
async def hello() -> dict[str, str]:
    return {
        "message": "Hello from Home Assistant Python backend!"
    }


# Serve built React assets
assets_dir = FRONTEND_DIST / "assets"

if assets_dir.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(assets_dir)),
        name="assets",
    )


# Catch-all route for React SPA
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_file = FRONTEND_DIST / "index.html"

    if index_file.exists():
        return FileResponse(index_file)

    return {
        "error": "Frontend build not found. Run npm run build in frontend."
    }