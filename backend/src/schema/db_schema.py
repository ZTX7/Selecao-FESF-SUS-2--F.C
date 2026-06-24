from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class Usuario(BaseModel):
    email: EmailStr
    senha: str
    nome_completo: str
    cpf: str
    data_nascimento: str
    area_atuacao: str
    inicio_residencia: str


#Funciona perfeitamente para REGISTRO DE ATIVIDADES
class Atividade(BaseModel):
    usf: str
    responsavel_acompanhamento: str
    detalhes_atividade: str = Field(..., max_length=1000,
                                    description="Descrição limitada a 1000 caracteres para otimização de banco")
    inicio_atividade: str
    tipo_atividade: str
    carga_horaria: int
    file_base64: str


class AtividadeBase(BaseModel):
    usf: str
    responsavel_acompanhamento: str
    detalhes_atividade: str
    inicio_atividade: str
    tipo_atividade: str
    carga_horaria: int
    
class AtividadeResponse(AtividadeBase):
    id: int
    status: str
    data_criacao: datetime

    class Config:
        from_attributes = True