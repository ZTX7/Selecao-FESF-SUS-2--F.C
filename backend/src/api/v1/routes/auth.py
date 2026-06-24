from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from schema.auth_schema import LoginRequest, LoginResponse
from core.security import create_access_token
from core.settings import settings
from core.database import get_db
from schema.db_schema import Usuario
from crud.users import criar_usuario
from service.verificators import verify_user


router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login_handler(payload: LoginRequest, db: Session = Depends(get_db)):
    
    user = verify_user(payload=payload, db=db)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": payload.resident_code, "id": user.id},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nome_completo": user.nome_completo,
            "area_atuacao": user.area_atuacao,
            "inicio_residencia": user.inicio_residencia
        }
    }
    

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: Usuario):
    try:
        novo_usuario = criar_usuario(usuario=payload)
        return {
            "mensagem": "Residente registado com sucesso!",
            "codigo_acesso": novo_usuario.codigo_residente,
            "nome": novo_usuario.nome_completo
        }

    except Exception as e:

        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro ao registar: {str(e)}")