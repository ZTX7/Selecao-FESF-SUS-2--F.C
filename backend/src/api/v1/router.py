from fastapi import APIRouter
from api.v1.routes import auth
from api.v1.routes import activities

api_router = APIRouter()

#inclusão de rotas para atividades e autenticação.
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(activities.router, prefix="/activities", tags=["Atividades"])
