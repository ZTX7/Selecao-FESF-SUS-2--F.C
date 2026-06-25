
#### Selecao-FESF-SUS-2--F.C
# 📃 ResiSUS - Sistema de Gestão e Acompanhamento de Residentes em Saúde **(MVP)**

![Python](https://img.shields.io/badge/Python-005571?style=for-the-badge&logo=python&logoColor=white)
![Uv](https://img.shields.io/badge/uv-432f9c.svg?style=for-the-badge&logo=UV&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-007571?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-167e8a.svg?style=for-the-badge&logo=react&logoColor=white)



## Sobre o projeto

O **ResiSUS** é uma aplicação web desenvolvida para auxiliar na gestão, acompanhamento e organização das atividades práticas realizadas por residentes em instituições de saúde.

A plataforma permite que residentes registrem suas experiências, atividades desenvolvidas durante a residência, carga horária cumprida e relatórios de acompanhamento, possibilitando uma futura análise e supervisão por tutores, preceptores e responsáveis pelo programa de residência.

O projeto encontra-se em versão **MVP (Minimum Viable Product)**, contemplando atualmente o fluxo principal de solicitação de acesso, autenticação, registro e visualização das atividades realizadas pelos residentes.


# 📍Executando o projeto

## Pré-requisitos

Necessário possuir:

* Docker 

---

# 🐳Execução utilizando Docker

O projeto possui ambiente totalmente conteinerizado.



Serviços:

| Serviço  | Tecnologia | Porta   |
| -------- | ---------- | ------- |
| Frontend | Next.js    | 3000    |
| Backend  | FastAPI    | 8000    |
| Banco    | PostgreSQL | interno |

Executar:

```bash
docker compose up --build
```

Após inicialização:

Frontend: (Aplicação)

```
http://localhost:3000
```

Swagger:

```
http://localhost:8000/docs
```

# 🌴Variáveis de Ambiente

Criar um arquivo:

```
.env
```

Exemplo:

```


        # Senha do usuário postgres
        # Usada pelo container do banco e pelo backend
        POSTGRES_PASSWORD=password

        PROJECT_NAME=RESISUS API
        VERSION=1.0.0
        ENVIRONMENT=development



        # Chave usada para assinatura dos tokens JWT
        # Em produção deve ser alterada para uma chave segura
        SECRET_KEY=minha_chave_super_segura


        # Algoritmo utilizado na criação do JWT
        ALGORITHM=HS256


        # Tempo de validade do token em minutos
        ACCESS_TOKEN_EXPIRE_MINUTES=60


        # Dentro do Docker o host é o nome do serviço:
        # db
        #
        # Não usar localhost dentro dos containers

        DATABASE_URL=postgresql://postgres:password@db:5432/resisus_db


        # Cria usuário e dados de demonstração automaticamente
        MOCK_ENABLED=True


        NEXT_PUBLIC_API_URL=http://localhost:8000


        BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

Um arquivo de referência deve ser disponibilizado:

```
.env.example
```
#

### 👤 Usuário de Demonstração (Mock)

Para facilitar a avaliação do sistema, o projeto possui um usuário previamente cadastrado através do script de seed do banco de dados.

Esse usuário permite testar o fluxo completo de autenticação, visualização de atividades e acompanhamento dos registros cadastrados.

## Credenciais de acesso

| Campo | Valor |
|---|---|
| Código do residente | `202629469330` |
| Senha | `Mudar@123` |

#
# Objetivo

O objetivo principal do ResiSUS é facilitar o acompanhamento da trajetória prática dos residentes, proporcionando:

* Organização das atividades realizadas;
* Controle de carga horária;
* Registro das experiências práticas;
* Armazenamento de relatórios;
* Centralização das informações para acompanhamento dos responsáveis.

---

# ⚙️Funcionalidades Implementadas

## Autenticação

* Solicitação de cadastro interno para residentes;
* Login por código, utilizando autenticação JWT;
* Proteção de rotas autenticadas;
* Criptografia de senhas utilizando bcrypt.

## Gestão de atividades

* Cadastro de atividades práticas;
* Registro de local de atuação (USF);
* Registro do responsável pelo acompanhamento;
* Descrição da atividade realizada;
* Classificação do tipo de atividade;
* Registro de carga horária;
* Upload de relatório;
* Controle de status da atividade.

## Visualização

* Listagem das atividades cadastradas;
* Visualização detalhada das atividades;
* Histórico de registros do residente.

---

# 🏛️Arquitetura do Projeto

O sistema utiliza uma arquitetura baseada no padrão **MVC adaptado para aplicações web modernas**, utilizando uma separação entre:

* Camada de apresentação;
* Camada de API e regras de negócio;
* Camada de persistência de dados.

Arquitetura geral:

 ```
                                            Usuário

                                                |
                                                v

                                    Next.js + React
                                    (Interface / View)

                                                |
                                        HTTP REST API

                                                |
                                                v

                                        FastAPI
                                    (Controller/API)

                                                |

                                    Services / Repositories

                                                |

                                        SQLAlchemy ORM

                                                |

                                        PostgreSQL
                                        (Model)
```

# 🏯Estrutura do Projeto

O projeto utiliza organização em formato **Monorepo**, contendo frontend e backend no mesmo repositório.

```
                    ResiSUS
                    │
                    ├── backend
                    │   │
                    │   └── src
                    │       │
                    │       ├── api
                    │       │   └── v1
                    │       │       └── routes
                    │       │
                    │       ├── core
                    │       │
                    │       ├── middlewares
                    │       │
                    │       ├── models
                    │       │
                    │       ├── repositories
                    │       │
                    │       ├── schemas
                    │       │
                    │       ├── services
                    │       │
                    │       └── main.py
                    │
                    ├── frontend
                    │   │
                    │   └── src
                    │       │
                    │       ├── app
                    │       │
                    │       ├── components
                    │       │
                    │       ├── services
                    │       │
                    │       └── types
                    │
                    └── docker-compose.yml
```

---

# 📔Backend - API REST

## Tecnologias utilizadas

| Tecnologia | Descrição | Utilização no ResiSUS |
|---|---|---|
| **Python** | Linguagem de programação utilizada para desenvolvimento do backend, reconhecida pela produtividade, legibilidade e amplo ecossistema para aplicações web. | Utilizada como linguagem principal para construção da API, regras de negócio, autenticação e comunicação com o banco de dados. |
| **FastAPI** | Framework moderno para criação de APIs REST utilizando Python, com alto desempenho, validação automática e documentação integrada. | Responsável pela criação dos endpoints da API, gerenciamento das requisições HTTP, validação de dados e disponibilização da documentação Swagger. |
| **Uvicorn** | Servidor ASGI utilizado para executar aplicações Python assíncronas, especialmente aplicações desenvolvidas com FastAPI. | Utilizado como servidor responsável por iniciar e disponibilizar a API backend do sistema. |
| **SQLAlchemy** | ORM (Object Relational Mapper) para integração entre aplicações Python e bancos de dados relacionais. | Utilizado para mapear as entidades do sistema (Usuários e Atividades), criar relacionamentos e realizar operações no PostgreSQL. |
| **Pydantic** | Biblioteca de validação e gerenciamento de dados utilizando modelos tipados em Python. | Utilizado para criação dos schemas da aplicação, validação das entradas e respostas da API, garantindo consistência dos dados. |
| **PostgreSQL** | Sistema gerenciador de banco de dados relacional de código aberto, utilizado em aplicações de produção. | Utilizado como banco principal para armazenamento das informações dos residentes, atividades, relatórios e dados do sistema. |
| **JWT (JSON Web Token)** | Padrão de autenticação baseado em tokens assinados para comunicação segura entre cliente e servidor. | Utilizado no processo de autenticação dos usuários, permitindo controle de acesso às rotas protegidas da API. |
| **Passlib** | Biblioteca Python utilizada para gerenciamento seguro de senhas e funções de hash. | Utilizada em conjunto com bcrypt para realizar a criptografia das senhas dos usuários antes do armazenamento. |
| **Psycopg2** | Driver responsável pela comunicação entre aplicações Python e bancos PostgreSQL. | Utilizado pelo backend para estabelecer conexão e realizar operações no banco de dados PostgreSQL. |

## Responsabilidades

O backend é responsável por:

* Exposição da API REST;
* Autenticação;
* Validação de dados;
* Regras de negócio;
* Comunicação com banco de dados;
* Gerenciamento dos registros de residentes e atividades.

## 📃Documentação da API

O FastAPI disponibiliza documentação automática utilizando Swagger UI.

Após executar o projeto:

```
http://localhost:8000/docs
```

---

# 📘Frontend - Interface Web

## Tecnologias utilizadas

| Tecnologia | Descrição | Utilização no ResiSUS |
|---|---|---|
| **Next.js** | Framework baseado em React para desenvolvimento de aplicações web modernas, oferecendo recursos como roteamento, renderização otimizada e estrutura organizada de páginas. | Utilizado como framework principal do Front-End, responsável pela construção da aplicação web, gerenciamento das páginas através do App Router e comunicação com a API Backend. |
| **React** | Biblioteca JavaScript para criação de interfaces de usuário baseadas em componentes reutilizáveis. | Utilizado para desenvolver os componentes da interface, formulários, telas de autenticação, visualização de atividades e interação do usuário com o sistema. |
| **TypeScript** | Superset do JavaScript que adiciona tipagem estática, permitindo maior segurança e previsibilidade no desenvolvimento. | Utilizado para garantir maior confiabilidade no código Front-End, definindo tipos para dados recebidos da API, componentes e estruturas da aplicação. |
| **Tailwind CSS** | Framework de estilização baseado em classes utilitárias, permitindo criação rápida de interfaces responsivas e padronizadas. | Utilizado para construção da identidade visual da aplicação, estilização dos componentes, responsividade e organização dos elementos da interface. |
| **Recharts** | Biblioteca de gráficos baseada em React para criação de visualizações de dados interativas. | Utilizado para criação de gráficos e representações visuais de informações, permitindo futuramente exibir indicadores como carga horária, atividades realizadas e acompanhamento dos residentes. |

## Responsabilidades

O frontend é responsável por:

* Interface do usuário;
* Navegação;
* Formulários;
* Visualização das atividades;
* Comunicação com API;
* Controle de sessão do usuário.

A aplicação utiliza o padrão moderno **Next.js App Router**.

---

# 🎲Banco de Dados

## PostgreSQL

O sistema utiliza PostgreSQL como banco principal.

ORM utilizado:

```
SQLAlchemy
```

## Principais entidades:

### #Usuário

Representa o residente cadastrado.

Campos principais:

* Nome completo;
* CPF;
* Código do residente;
* Área de atuação;
* Data de início da residência.

Relacionamento:

```
Usuário 1 -------- N Atividades
```

### #Atividade

Representa uma experiência prática realizada pelo residente.

Campos principais:

* Unidade de Saúde;
* Responsável pelo acompanhamento;
* Tipo da atividade;
* Descrição;
* Carga horária;
* Relatório;
* Status.

---

# Segurança

O projeto utiliza:

## JWT

A autenticação funciona através de tokens.

Fluxo:

```
Usuário realiza login

        |

API valida credenciais

        |

JWT é gerado

        |

Frontend envia token nas próximas requisições
```

## Proteção de dados

* Senhas armazenadas utilizando hash bcrypt;
* Variáveis sensíveis isoladas utilizando arquivo `.env`;
* Credenciais do banco não ficam expostas no código.

---



