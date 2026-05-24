from fastapi import APIRouter

router = APIRouter()


@router.get("/status")
async def status() -> dict[str, str]:
    return {
        "status": "online"
    }


@router.get("/hello")
async def hello() -> dict[str, str]:
    return {
        "message": "Hello from API routes!"
    }