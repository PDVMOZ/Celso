// =====================================================
// SERVICE WORKER - PVD / BAR DO CELSO
// =====================================================

const CACHE_NAME = "bar-do-celso-v2";


// =====================================================
// ARQUIVOS PRINCIPAIS
// =====================================================

const ARQUIVOS = [

    // Página principal
    "/dashboard",

    // Manifest
    "/static/manifest.json",

    // CSS
    "/static/css/dashboard.css",

    // JavaScript
    "/static/js/app.js",
    "/static/js/auth.js",
    "/static/js/dashboard.js",
    "/static/js/vendas.js",
    "/static/js/stock.js",
    "/static/js/historico.js",
    "/static/js/despesas.js",
    "/static/js/caixa.js",
    "/static/js/configuracoes.js",
    "/static/js/lucros-dashboard.js",
    "/static/js/grafico.js",
    "/static/js/dashboard-dinheiro-recolhido.js",
    "/static/js/recolha-gerente.js",
    "/static/js/usuarios.js",
    "/static/js/categorias.js",
    "/static/js/produtos.js",
    "/static/js/sidebar_mobile.js",
    "/static/js/notificacoes.js",

    // Ícones
    "/static/assets/img/icon-192.png",
    "/static/assets/img/icon-512.png",
    "/static/assets/img/icon-512-maskable.png"

];


// =====================================================
// INSTALAÇÃO
// =====================================================

self.addEventListener(
    "install",
    function (event) {

        console.log(
            "PWA: instalando Service Worker..."
        );


        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(function (cache) {

                    console.log(
                        "PWA: criando cache..."
                    );


                    return Promise.all(

                        ARQUIVOS.map(
                            function (arquivo) {

                                return fetch(
                                    arquivo,
                                    {
                                        cache: "no-cache"
                                    }
                                )
                                .then(
                                    function (response) {

                                        if (
                                            !response.ok
                                        ) {

                                            throw new Error(
                                                "Erro ao carregar: " +
                                                arquivo +
                                                " (" +
                                                response.status +
                                                ")"
                                            );

                                        }


                                        return cache.put(
                                            arquivo,
                                            response
                                        );

                                    }
                                )
                                .catch(
                                    function (error) {

                                        console.error(
                                            "PWA: não foi possível colocar no cache:",
                                            arquivo,
                                            error
                                        );

                                        // Não interromper
                                        // instalação inteira
                                        return null;

                                    }
                                );

                            }
                        )

                    );

                })

                .then(function () {

                    console.log(
                        "PWA: instalação concluída."
                    );

                    return self.skipWaiting();

                })

        );

    }
);


// =====================================================
// ATIVAÇÃO
// =====================================================

self.addEventListener(
    "activate",
    function (event) {

        console.log(
            "PWA: Service Worker ativado."
        );


        event.waitUntil(

            caches.keys()

                .then(function (cacheNames) {

                    return Promise.all(

                        cacheNames.map(
                            function (cacheName) {

                                if (
                                    cacheName !== CACHE_NAME
                                ) {

                                    console.log(
                                        "PWA: removendo cache antigo:",
                                        cacheName
                                    );

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                                return null;

                            }
                        )

                    );

                })

                .then(function () {

                    return self.clients.claim();

                })

        );

    }
);


// =====================================================
// FETCH
// =====================================================

self.addEventListener(
    "fetch",
    function (event) {

        const request =
            event.request;


        // Apenas GET
        if (
            request.method !== "GET"
        ) {

            return;

        }


        const url =
            new URL(request.url);


        // =================================================
        // NAVEGAÇÃO / PÁGINAS
        // =================================================

        if (
            request.mode === "navigate"
        ) {

            event.respondWith(

                fetch(request)

                    .then(function (response) {

                        // Guardar apenas respostas válidas
                        if (
                            response &&
                            response.ok
                        ) {

                            const copia =
                                response.clone();


                            caches.open(
                                CACHE_NAME
                            )
                            .then(
                                function (cache) {

                                    cache.put(
                                        request,
                                        copia
                                    );

                                }
                            );

                        }


                        return response;

                    })

                    .catch(function () {

                        console.log(
                            "PWA: sem Internet. Tentando cache:",
                            request.url
                        );


                        return caches.match(
                            request
                        )

                        .then(
                            function (cachedPage) {

                                if (
                                    cachedPage
                                ) {

                                    return cachedPage;

                                }


                                // Fallback principal
                                return caches.match(
                                    "/dashboard"
                                )

                                .then(
                                    function (dashboard) {

                                        if (
                                            dashboard
                                        ) {

                                            return dashboard;

                                        }


                                        return new Response(
                                            `
                                            <!DOCTYPE html>
                                            <html lang="pt">
                                            <head>
                                                <meta charset="UTF-8">
                                                <meta name="viewport"
                                                    content="width=device-width, initial-scale=1.0">
                                                <title>PVD</title>
                                            </head>

                                            <body>
                                                <h3>Sem ligação à Internet</h3>
                                                <p>Não foi possível carregar o dashboard.</p>
                                            </body>
                                            </html>
                                            `,
                                            {
                                                headers: {
                                                    "Content-Type":
                                                        "text/html; charset=utf-8"
                                                }
                                            }
                                        );

                                    }
                                );

                            }
                        );

                    })

            );

            return;

        }


        // =================================================
        // ARQUIVOS ESTÁTICOS
        // =================================================

        if (
            url.pathname.startsWith(
                "/static/"
            )
        ) {

            event.respondWith(

                caches.match(request)

                    .then(function (cached) {

                        if (
                            cached
                        ) {

                            return cached;

                        }


                        return fetch(request)

                            .then(
                                function (response) {

                                    if (
                                        response &&
                                        response.ok
                                    ) {

                                        const copia =
                                            response.clone();


                                        caches.open(
                                            CACHE_NAME
                                        )
                                        .then(
                                            function (cache) {

                                                cache.put(
                                                    request,
                                                    copia
                                                );

                                            }
                                        );

                                    }


                                    return response;

                                }
                            );

                    })

            );

            return;

        }


        // =================================================
        // OUTROS PEDIDOS GET
        // =================================================

        event.respondWith(

            fetch(request)

                .then(function (response) {

                    if (
                        response &&
                        response.ok
                    ) {

                        const copia =
                            response.clone();


                        caches.open(
                            CACHE_NAME
                        )
                        .then(
                            function (cache) {

                                cache.put(
                                    request,
                                    copia
                                );

                            }
                        );

                    }


                    return response;

                })

                .catch(function () {

                    return caches.match(
                        request
                    );

                })

        );

    }
);