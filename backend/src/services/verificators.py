from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models import models
from core.security import verify_password
from schemas.auth_schema import LoginRequest

def verify_user(payload: LoginRequest, db: Session):

    user = db.query(models.UsuarioModel).filter(
        models.UsuarioModel.codigo_residente == payload.resident_code
    ).first()

    if not user or not verify_password(payload.password, user.senha_padrao):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Código de residente ou senha inválidos",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return user
    
