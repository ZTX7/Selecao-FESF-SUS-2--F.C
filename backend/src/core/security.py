from fastapi.openapi.utils import get_openapi
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
import jwt

from core.settings import settings 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

#gera os tokens de acesso JWT
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_access_token(token: str):
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

