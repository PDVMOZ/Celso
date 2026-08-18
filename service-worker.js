const CACHE_NAME = "bar-do-celso-v1";

self.addEventListener("install", (event) => {

    console.log("PWA: Service Worker instalado.");

    self.skipWaiting();

});


self.addEventListener("activate", (event) => {

    console.log("PWA: Service Worker ativado.");

    event.waitUntil(

        caches.keys().then((keys) => {

            return Promise.all(

                keys.map((key) => {

                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }

                })

            );

        }).then(() => {

            return self.clients.claim();

        })

    );

});


self.addEventListener("fetch", (event) => {

    /*
     * Nesta primeira versão não vamos
     * interferir nos pedidos da aplicação.
     *
     * O site continuará a carregar
     * diretamente do servidor.
     */

    return;

});