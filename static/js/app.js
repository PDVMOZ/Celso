// =====================================================
// PVD - SISTEMA DE VENDAS
// APP.JS
// =====================================================

"use strict";


// =====================================================
// CONFIGURAÇÃO GLOBAL DA APLICAÇÃO
// =====================================================

const API =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
        ? "http://127.0.0.1:8000"
        : window.location.origin;


// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let produtosVenda = [];
let carrinho = [];
let usuarioLogado = null;


// =====================================================
// SERVICE WORKER
// =====================================================
//
// IMPORTANTE:
// O Service Worker é registado, mas não interfere
// no carregamento inicial do dashboard.
// =====================================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", function () {

        navigator.serviceWorker
            .register(
                "/static/service-worker.js",
                {
                    scope: "/"
                }
            )
            .then(function (registration) {

                console.log(
                    "PWA: Service Worker registado:",
                    registration.scope
                );

            })
            .catch(function (error) {

                console.error(
                    "PWA: erro no Service Worker:",
                    error
                );

            });

    });

}


// =====================================================
// INSTALAÇÃO DA PWA
// =====================================================

let eventoInstalacao = null;


window.addEventListener(
    "beforeinstallprompt",
    function (event) {

        event.preventDefault();

        eventoInstalacao = event;

        window.eventoInstalacaoPWA =
            eventoInstalacao;

        console.log(
            "PWA: aplicação pronta para instalação."
        );

    }
);


// =====================================================
// FUNÇÃO PARA INSTALAR A PWA
// =====================================================

window.instalarPWA = async function () {

    if (!eventoInstalacao) {

        alert(
            "A instalação ainda não está disponível neste dispositivo."
        );

        return;

    }


    try {

        eventoInstalacao.prompt();

        const resultado =
            await eventoInstalacao.userChoice;

        console.log(
            "Resultado da instalação:",
            resultado.outcome
        );

    }
    catch (error) {

        console.error(
            "PWA: erro durante instalação:",
            error
        );

    }


    eventoInstalacao = null;

    window.eventoInstalacaoPWA = null;

};


// =====================================================
// DETECTAR INSTALAÇÃO
// =====================================================

window.addEventListener(
    "appinstalled",
    function () {

        console.log(
            "PWA: aplicação instalada com sucesso."
        );

        eventoInstalacao = null;

        window.eventoInstalacaoPWA = null;

    }
);


// =====================================================
// DETECTAR MODO PWA
// =====================================================

function verificarModoPWA() {

    const standalone =
        window.matchMedia(
            "(display-mode: standalone)"
        ).matches;


    const iosStandalone =
        window.navigator.standalone === true;


    if (
        standalone ||
        iosStandalone
    ) {

        if (document.body) {

            document.body.classList.add(
                "pwa-standalone"
            );

        }


        console.log(
            "PWA: aplicação aberta em modo standalone."
        );

    }

}


// =====================================================
// FUNÇÃO AUXILIAR - ELEMENTO
// =====================================================

function obterElemento(id) {

    return document.getElementById(id);

}


// =====================================================
// FUNÇÃO AUXILIAR - ESCONDER
// =====================================================

function esconderElemento(id) {

    const elemento =
        obterElemento(id);


    if (elemento) {

        elemento.style.display =
            "none";

    }

}


// =====================================================
// FUNÇÃO AUXILIAR - MOSTRAR
// =====================================================

function mostrarElemento(
    id,
    display = "block"
) {

    const elemento =
        obterElemento(id);


    if (elemento) {

        elemento.style.display =
            display;

    }

}


// =====================================================
// PREPARAR DASHBOARD PARA VISITANTE
// =====================================================

function prepararDashboardVisitante() {

    usuarioLogado = null;


    // -------------------------------------------------
    // MENUS
    // -------------------------------------------------

    esconderElemento(
        "menu-usuarios"
    );

    esconderElemento(
        "menu-categorias"
    );

    esconderElemento(
        "menu-produtos"
    );

    esconderElemento(
        "menu-despesas"
    );

    esconderElemento(
        "ver-detalhes-stock"
    );


    // -------------------------------------------------
    // FUNCIONALIDADES
    // -------------------------------------------------

    if (
        typeof mostrarNovaVenda === "function"
    ) {

        mostrarNovaVenda(false);

    }


    if (
        typeof mostrarHistorico === "function"
    ) {

        mostrarHistorico(false);

    }


    if (
        typeof mostrarStock === "function"
    ) {

        mostrarStock(false);

    }


    // -------------------------------------------------
    // VENDAS
    // -------------------------------------------------

    const vendas =
        obterElemento(
            "vendas-dia"
        );


    if (vendas) {

        vendas.innerText =
            "0.00 MT";

    }


    const detalheVendas =
        document.querySelector(
            "#vendas-dia"
        );


    if (
        detalheVendas &&
        detalheVendas.parentElement
    ) {

        const info =
            detalheVendas.parentElement
                .querySelector("small");


        if (info) {

            info.innerHTML =
                "Faça login para ver vendas";

        }

    }


    // -------------------------------------------------
    // LUCRO
    // -------------------------------------------------

    const lucro =
        obterElemento(
            "lucro-hoje"
        );


    if (lucro) {

        lucro.innerText =
            "0.00 MT";

    }


    // -------------------------------------------------
    // DESPESAS
    // -------------------------------------------------

    const despesas =
        obterElemento(
            "despesas-hoje"
        );


    if (despesas) {

        despesas.innerText =
            "0.00 MT";

    }


    // -------------------------------------------------
    // STOCK
    // -------------------------------------------------

    const totalStock =
        obterElemento(
            "total-stock"
        );


    if (totalStock) {

        totalStock.innerText =
            "0";

    }


    // -------------------------------------------------
    // PRODUTOS NOVOS
    // -------------------------------------------------

    const produtosNovos =
        obterElemento(
            "produtos-novos"
        );


    if (produtosNovos) {

        produtosNovos.innerText =
            "0";

    }


    // -------------------------------------------------
    // BAIXO STOCK
    // -------------------------------------------------

    const baixoStock =
        obterElemento(
            "baixo-stock"
        );


    if (baixoStock) {

        baixoStock.innerText =
            "0";

    }


    const lista =
        obterElemento(
            "baixo-stock-list"
        );


    if (lista) {

        lista.innerHTML = `
            <div class="alert alert-secondary mb-0">
                Faça login para visualizar o stock.
            </div>
        `;

    }


    // -------------------------------------------------
    // BOTÃO LOGIN
    // -------------------------------------------------

    const botaoLogin =
        obterElemento(
            "login-button"
        );


    if (botaoLogin) {

        botaoLogin.style.display =
            "block";


        botaoLogin.onclick =
            abrirLogin;

    }

}


// =====================================================
// CARREGAR UTILIZADOR
// =====================================================

function carregarUtilizadorSalvo() {

    const usuarioSalvo =
        localStorage.getItem(
            "usuario"
        );


    if (!usuarioSalvo) {

        prepararDashboardVisitante();

        return;

    }


    try {

        usuarioLogado =
            JSON.parse(
                usuarioSalvo
            );

    }
    catch (erro) {

        console.error(
            "PVD: erro ao ler utilizador:",
            erro
        );


        localStorage.removeItem(
            "usuario"
        );


        prepararDashboardVisitante();

        return;

    }


    if (!usuarioLogado) {

        prepararDashboardVisitante();

        return;

    }


    console.log(
        "PVD: utilizador logado:",
        usuarioLogado
    );


    // -------------------------------------------------
    // CARREGAR UTILIZADOR NO PERFIL
    // -------------------------------------------------

    if (
        typeof carregarUsuario === "function"
    ) {

        try {

            carregarUsuario(
                usuarioLogado
            );

        }
        catch (erro) {

            console.error(
                "PVD: erro ao carregar perfil:",
                erro
            );

        }

    }


    // -------------------------------------------------
    // NOVA VENDA
    // -------------------------------------------------

    if (
        usuarioLogado.tipo === "admin" ||
        usuarioLogado.tipo === "vendedor"
    ) {

        if (
            typeof mostrarNovaVenda === "function"
        ) {

            mostrarNovaVenda(true);

        }

    }
    else {

        if (
            typeof mostrarNovaVenda === "function"
        ) {

            mostrarNovaVenda(false);

        }

    }


    // -------------------------------------------------
    // DESPESAS
    // -------------------------------------------------

    mostrarElemento(
        "menu-despesas",
        "block"
    );


    // -------------------------------------------------
    // BOTÃO LOGIN
    // -------------------------------------------------

    const botaoLogin =
        obterElemento(
            "login-button"
        );


    if (botaoLogin) {

        botaoLogin.style.display =
            "none";

    }

}


// =====================================================
// ABRIR LOGIN
// =====================================================

function abrirLogin() {

    const loginScreen =
        obterElemento(
            "login-screen"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "flex";

    }

}


// =====================================================
// FECHAR LOGIN
// =====================================================

function fecharLogin() {

    const loginScreen =
        obterElemento(
            "login-screen"
        );


    if (loginScreen) {

        loginScreen.style.display =
            "none";

    }

}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    console.log(
        "PVD: terminando sessão..."
    );


    // -------------------------------------------------
    // LIMPAR SESSÃO
    // -------------------------------------------------

    localStorage.removeItem(
        "usuario"
    );


    usuarioLogado = null;


    // -------------------------------------------------
    // LIMPAR DADOS TEMPORÁRIOS
    // -------------------------------------------------

    produtosVenda = [];
    carrinho = [];


    // -------------------------------------------------
    // MENUS
    // -------------------------------------------------

    esconderElemento(
        "menu-usuarios"
    );

    esconderElemento(
        "menu-categorias"
    );

    esconderElemento(
        "menu-produtos"
    );

    esconderElemento(
        "menu-despesas"
    );

    esconderElemento(
        "ver-detalhes-stock"
    );


    // -------------------------------------------------
    // FUNCIONALIDADES
    // -------------------------------------------------

    if (
        typeof mostrarNovaVenda === "function"
    ) {

        mostrarNovaVenda(false);

    }


    if (
        typeof mostrarHistorico === "function"
    ) {

        mostrarHistorico(false);

    }


    if (
        typeof mostrarStock === "function"
    ) {

        mostrarStock(false);

    }


    // -------------------------------------------------
    // NOME DO UTILIZADOR
    // -------------------------------------------------

    const user =
        obterElemento(
            "user-name"
        );


    if (user) {

        user.innerText =
            "Login";

    }


    // -------------------------------------------------
    // PERFIL
    // -------------------------------------------------

    const nomePerfil =
        document.querySelector(
            ".profile-info strong"
        );


    const emailPerfil =
        document.querySelector(
            ".profile-info small"
        );


    if (nomePerfil) {

        nomePerfil.innerText =
            "Visitante";

    }


    if (emailPerfil) {

        emailPerfil.innerText =
            "";

    }


    // -------------------------------------------------
    // VENDAS
    // -------------------------------------------------

    const vendas =
        obterElemento(
            "vendas-dia"
        );


    if (vendas) {

        vendas.innerText =
            "0.00 MT";

    }


    // -------------------------------------------------
    // LUCRO
    // -------------------------------------------------

    const lucro =
        obterElemento(
            "lucro-hoje"
        );


    if (lucro) {

        lucro.innerText =
            "0.00 MT";

    }


    // -------------------------------------------------
    // DESPESAS
    // -------------------------------------------------

    const despesas =
        obterElemento(
            "despesas-hoje"
        );


    if (despesas) {

        despesas.innerText =
            "0.00 MT";

    }


    // -------------------------------------------------
    // STOCK
    // -------------------------------------------------

    const totalStock =
        obterElemento(
            "total-stock"
        );


    if (totalStock) {

        totalStock.innerText =
            "0";

    }


    // -------------------------------------------------
    // PRODUTOS NOVOS
    // -------------------------------------------------

    const produtosNovos =
        obterElemento(
            "produtos-novos"
        );


    if (produtosNovos) {

        produtosNovos.innerText =
            "0";

    }


    // -------------------------------------------------
    // BAIXO STOCK
    // -------------------------------------------------

    const baixoStock =
        obterElemento(
            "baixo-stock"
        );


    if (baixoStock) {

        baixoStock.innerText =
            "0";

    }


    const lista =
        obterElemento(
            "baixo-stock-list"
        );


    if (lista) {

        lista.innerHTML = `
            <div class="alert alert-secondary mb-0">
                Faça login para visualizar o stock.
            </div>
        `;

    }


    // -------------------------------------------------
    // BOTÃO LOGIN
    // -------------------------------------------------

    const botaoLogin =
        obterElemento(
            "login-button"
        );


    if (botaoLogin) {

        botaoLogin.style.display =
            "block";


        botaoLogin.onclick =
            abrirLogin;

    }


    // -------------------------------------------------
    // FECHAR LOGIN
    // -------------------------------------------------

    fecharLogin();


    console.log(
        "PVD: sessão terminada."
    );

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

function iniciarAplicacao() {

    console.log(
        "PVD: iniciando aplicação..."
    );


    // -------------------------------------------------
    // MODO PWA
    // -------------------------------------------------

    verificarModoPWA();


    // -------------------------------------------------
    // ESTADO INICIAL
    // -------------------------------------------------

    if (
        typeof mostrarNovaVenda === "function"
    ) {

        mostrarNovaVenda(false);

    }


    if (
        typeof mostrarHistorico === "function"
    ) {

        mostrarHistorico(false);

    }


    if (
        typeof mostrarStock === "function"
    ) {

        mostrarStock(false);

    }


    // -------------------------------------------------
    // CARREGAR UTILIZADOR
    // -------------------------------------------------

    carregarUtilizadorSalvo();


    // -------------------------------------------------
    // DETALHES STOCK
    // -------------------------------------------------

    esconderElemento(
        "ver-detalhes-stock"
    );


    console.log(
        "PVD: aplicação iniciada."
    );

}


// =====================================================
// DOM READY
// =====================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacao
    );

}
else {

    iniciarAplicacao();

}
