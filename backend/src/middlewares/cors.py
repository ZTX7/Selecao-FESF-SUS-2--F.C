from fastapi.middleware.cors import CORSMiddleware
from core.settings import settings

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware, 
        allow_origins=settings.ALLOW_ORIGINS,
        allow_credentials=True,
        allow_methods=["POST", "GET", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"])