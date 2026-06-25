from fastapi import FastAPI

from api.v1.router import api_router
from middlewares.cors import setup_cors
from models.models import Base
from core.database import engine 
from core.settings import settings
from seed import run_seed



Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

run_seed(settings.MOCK_ENABLED)

setup_cors(app)

app.include_router(api_router, prefix=settings.BASE_PREFIX)


