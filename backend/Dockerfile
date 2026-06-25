FROM python:3.13-slim

# Instala o uv 
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Define o diretório
WORKDIR /app

#entra na pasta src
ENV PYTHONPATH=/app/src

# Copia os arquivos de dependências 
COPY pyproject.toml uv.lock ./

# Instala as dependências do projeto
RUN uv pip install --system -r pyproject.toml

# Copia o resto do código 
COPY . .

# Expõe a porta que o FastAPI vai rodar
EXPOSE 8000

# Comando para iniciar o servidor FastAPI
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]