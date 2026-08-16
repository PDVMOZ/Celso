// =====================================================
// SERVICE WORKER
// BAR DO CELSO
// =====================================================

const CACHE_NAME =
    "bar-do-celso-v1";


const ARQUIVOS_CACHE = [

    "/dashboard",

    "/static/css/dashboard.css",

    "/static/js/pwa.js"

];


// =====================================================
// INSTALL
// =====================================================

self.addEventListener(
    "install",
    function(event){

        console.log(
            "Service Worker: instalação."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    function(cache){

                        return cache.addAll(
                            ARQUIVOS_CACHE
                        );

                    }
                )

        );


        self.skipWaiting();

    }
);


// =====================================================
// ACTIVATE
// =====================================================

self.addEventListener(
    "activate",
    function(event){

        console.log(
            "Service Worker: ativado."
        );


        event.waitUntil(

            caches
                .keys()
                .then(
                    function(cacheNames){

                        return Promise.all(

                            cacheNames
                                .filter(
                                    function(cacheName){

                                        return (
                                            cacheName !==
                                            CACHE_NAME
                                        );

                                    }
                                )
                                .map(
                                    function(cacheName){

                                        return caches.delete(
                                            cacheName
                                        );

                                    }
                                )

                        );

                    }
                )

        );


        self.clients.claim();

    }
);


// =====================================================
// FETCH
// =====================================================

self.addEventListener(
    "fetch",
    function(event){

        const request =
            event.request;


        // Não interferir em POST/PUT/DELETE
        if(
            request.method !== "GET"
        ){

            return;

        }


        event.respondWith(

            fetch(request)

                .then(
                    function(response){

                        // Guardar cópia
                        if(
                            response &&
                            response.status === 200 &&
                            response.type === "basic"
                        ){

                            const copia =
                                response.clone();


                            caches
                                .open(CACHE_NAME)
                                .then(
                                    function(cache){

                                        cache.put(
                                            request,
                                            copia
                                        );

                                    }
                                );

                        }


                        return response;

                    }
                )

                .catch(
                    function(){

                        return caches
                            .match(request)
                            .then(
                                function(cached){

                                    if(cached){

                                        return cached;

                                    }


                                    return caches.match(
                                        "/dashboard"
                                    );

                                }
                            );

                    }
                )

        );

    }
);