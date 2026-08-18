// =====================================================
// SERVICE WORKER - PVD / BAR DO CELSO
// =====================================================

const CACHE_NAME = "bar-do-celso-v3";


// =====================================================
// INSTALAÇÃO
// =====================================================

self.addEventListener("install", function (event) {

    console.log(
        "PWA: Service Worker instalando..."
    );

    // Não bloquear a instalação
    self.skipWaiting();

});


// =====================================================
// ATIVAÇÃO
// =====================================================

self.addEventListener("activate", function (event) {

    console.log(
        "PWA: Service Worker ativado."
    );


    event.waitUntil(

        caches.keys().then(function (cacheNames) {

            return Promise.all(

                cacheNames.map(function (cacheName) {

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

                })

            );

        }).then(function () {

            return self.clients.claim();

        })

    );

});


// =====================================================
// FETCH
// =====================================================
//
// IMPORTANTE:
//
// Neste momento não vamos interceptar os pedidos.
// O site será carregado diretamente do Render.
//
// Isso evita que o Service Worker impeça o APK
// de abrir https://celso.onrender.com
// =====================================================

self.addEventListener("fetch", function (event) {

    // Não interferir no carregamento do site.

    return;

});