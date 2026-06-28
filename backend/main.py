from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import documents, patterns, copilot, compliance, dashboard, demo

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Universal Knowledge Intelligence Platform for Economic Times Hackathon 2026"
)

# Enable CORS for frontend web application (Vercel & localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under both /api/v1 AND root for maximum client compatibility
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(documents.router)

app.include_router(patterns.router, prefix=settings.API_V1_STR)
app.include_router(patterns.router)

app.include_router(copilot.router, prefix=settings.API_V1_STR)
app.include_router(copilot.router)

app.include_router(compliance.router, prefix=settings.API_V1_STR)
app.include_router(compliance.router)

app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router)

app.include_router(demo.router, prefix=settings.API_V1_STR)
app.include_router(demo.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to KnowledgeBrain API",
        "platform": "Universal Knowledge Intelligence Engine",
        "hackathon": "Economic Times Hackathon 2026",
        "status": "online",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
