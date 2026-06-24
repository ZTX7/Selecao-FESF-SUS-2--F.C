import random
import string
from datetime import datetime
from sqlalchemy.orm import Session
from models import models

def generate_code_resident(db: Session) -> str:

    ano_atual = str(datetime.now().year)
    
    while True:

        numeros_aleatorios = ''.join(random.choices(string.digits, k=8))
        novo_codigo = f"{ano_atual}{numeros_aleatorios}"
        codigo_em_uso = db.query(models.UsuarioModel).filter(
            models.UsuarioModel.codigo_residente == novo_codigo
        ).first()
        
        if not codigo_em_uso:
            return novo_codigo