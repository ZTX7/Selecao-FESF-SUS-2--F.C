from fastapi import FastAPI

from api.v1.router import api_router
from middlewares.cors import setup_cors
from models.models import Base
from core.database import engine 


if Base.metadata.create_all(bind=engine):
    print("Criando Banco de Dados...")

app = FastAPI(title="API resiSUS-MVP")
setup_cors(app)
app.include_router(api_router, prefix="/api/v1")


