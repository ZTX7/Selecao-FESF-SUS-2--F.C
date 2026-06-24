from pydantic import BaseModel

class LoginRequest(BaseModel):
    resident_code: str
    password: str

class AuthUserResponse(BaseModel):
    id: int
    nome_completo: str
    area_atuacao: str
    inicio_residencia: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUserResponse

class RecoveryRequest(BaseModel):
    resident_code: str
