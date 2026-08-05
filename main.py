import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates

from database import Base, engine


# ==========================
# ROUTERS
# ==========================

from routers import (
    auth,
    dashboard,
    produtos,
    categorias,
    vendas,
    stock,
    caixa,
    despesas,
    relatorios
)


# ==========================
# CAMINHOS
# ==========================

BASE_DIR = Path(__file__).resolve().parent


# ==========================
# TEMPLATES
# ==========================

templates = Jinja2Templates(
    directory=str(BASE_DIR / "templates")
)


# ==========================
# APP
# ==========================

is_production = os.getenv("ENV") == "production"


app = FastAPI(
    title="Bar do Celso - Sistema de Gestão",
    version="1.0.0",
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc"
)


# ==========================
# STATIC
# ==========================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# ==========================
# CORS
# ==========================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "*"
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],
)


# ==========================
# STARTUP
# ==========================

@app.on_event("startup")
async def startup():

    async with engine.begin() as conn:

        await conn.run_sync(
            Base.metadata.create_all
        )


    print("✅ Banco de dados conectado")
    print("✅ Sistema Bar do Celso iniciado")


# ==========================
# DASHBOARD
# ==========================

@app.get("/")
async def home(request: Request):

    return templates.TemplateResponse(
        "dashboard.html",
        {
            "request": request
        }
    )


# ==========================
# ROTAS API
# ==========================

app.include_router(
    auth.router
)


app.include_router(
    dashboard.router
)


app.include_router(
    categorias.router
)


app.include_router(
    produtos.router
)


app.include_router(
    vendas.router
)


app.include_router(
    stock.router
)


app.include_router(
    caixa.router
)


app.include_router(
    despesas.router
)


app.include_router(
    relatorios.router
)
