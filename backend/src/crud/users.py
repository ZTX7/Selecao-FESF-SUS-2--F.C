from sqlalchemy.orm import Session

from models import models
from service.rcode_generate import generate_code_resident
from schema.db_schema import Usuario
from core.security import pwd_context
from core.database import SessionLocal



def obter_hash_senha(senha: str):
    return pwd_context.hash(senha)

def criar_usuario(usuario: Usuario):
    try:
        db = SessionLocal()
        senha_criptografada = obter_hash_senha(usuario.senha)
        
        novo_usuario = models.UsuarioModel(
            codigo_residente=generate_code_resident(db),
            email=usuario.email,
            nome_completo=usuario.nome_completo,
            cpf=usuario.cpf,
            data_nascimento=usuario.data_nascimento,
            area_atuacao=usuario.area_atuacao,
            senha_padrao=senha_criptografada,
            inicio_residencia=usuario.inicio_residencia
        )
        db.add(novo_usuario)
        db.commit()
        db.refresh(novo_usuario)
        
        return novo_usuario
    
    except Exception as exc:
        db.rollback()
        raise exc
    
    finally:
        db.close()

def buscar_usuario_por_id(db: Session, usuario_id: int):
    return db.query(models.UsuarioModel).filter(models.UsuarioModel.id == usuario_id).first()

def buscar_usuario_por_codigo(db: Session, codigo: str):
    return db.query(models.UsuarioModel).filter(models.UsuarioModel.codigo_residente == codigo).first()