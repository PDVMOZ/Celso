const CACHE_NAME = "bar-do-celso-v1";

const ARQUIVOS = [
    "/dashboard",
    "/static/manifest.json",

    "/static/css/dashboard.css",

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

    "/static/assets/img/icon-192.png",
    "/static/assets/img/icon-512.png",
    "/static/assets/img/icon-512-maskable.png"
];


// =====================================================
// INSTALAÇÃO
// =====================================================

self.addEventListener("install", event => {

    console.log(
        "Service Worker: instalando..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    ARQUIVOS
                );

            })

    );

    self.skipWaiting();

});


// =====================================================
// ATIVAÇÃO
// =====================================================

self.addEventListener("activate", event => {

    console.log(
        "Service Worker: ativado."
    );

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(key =>
                            key !== CACHE_NAME
                        )
                        .map(key =>
                            caches.delete(key)
                        )

                );

            })

    );

    self.clients.claim();

});


// =====================================================
// PEDIDOS
// =====================================================

self.addEventListener("fetch", event => {

    const request = event.request;

    // Apenas GET
    if(request.method !== "GET"){
        return;
    }


    event.respondWith(

        fetch(request)

            .then(response => {

                // Guardar cópia atualizada
                const copia = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {

                        cache.put(
                            request,
                            copia
                        );

                    });

                return response;

            })

            .catch(() => {

                // Sem internet
                return caches.match(request)
                    .then(cached => {

                        if(cached){
                            return cached;
                        }

                        // Se for página
                        if(
                            request.headers.get(
                                "accept"
                            )?.includes(
                                "text/html"
                            )
                        ){

                            return caches.match(
                                "/dashboard"
                            );

                        }

                    });

            })

    );

});
