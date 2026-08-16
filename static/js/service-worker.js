// =====================================================
// SERVICE WORKER
// BAR DO CELSO
// =====================================================

const CACHE_NAME = "bar-do-celso-v2";


// =====================================================
// ARQUIVOS PRINCIPAIS
// =====================================================

const ARQUIVOS_CACHE = [

    "/dashboard",

    "/static/css/dashboard.css",

    "/static/js/pwa.js"

];


// =====================================================
// INSTALAÇÃO
// =====================================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "PWA: instalando Service Worker..."
        );

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache => {

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
// ATIVAÇÃO
// =====================================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "PWA: Service Worker ativado."
        );

        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    cacheName =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    cacheName =>
                                        caches.delete(
                                            cacheName
                                        )
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
    event => {

        const request =
            event.request;


        // -------------------------------------------------
        // SOMENTE GET
        // -------------------------------------------------

        if(
            request.method !== "GET"
        ){

            return;

        }


        event.respondWith(

            fetch(request)

                .then(
                    response => {

                        // -------------------------------------------------
                        // GUARDAR RESPOSTA NO CACHE
                        // -------------------------------------------------

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
                                    cache => {

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
                    async () => {

                        console.log(
                            "PWA: sem conexão:",
                            request.url
                        );


                        // -------------------------------------------------
                        // TENTAR CACHE
                        // -------------------------------------------------

                        const cached =
                            await caches.match(
                                request
                            );


                        if(cached){

                            return cached;

                        }


                        // -------------------------------------------------
                        // SE FOR NAVEGAÇÃO
                        // -------------------------------------------------

                        if(
                            request.mode ===
                            "navigate"
                        ){

                            return new Response(

                                `
                                <!DOCTYPE html>

                                <html lang="pt">

                                <head>

                                    <meta charset="UTF-8">

                                    <meta
                                        name="viewport"
                                        content="width=device-width, initial-scale=1.0"
                                    >

                                    <meta
                                        name="theme-color"
                                        content="#212529"
                                    >

                                    <title>
                                        Bar do Celso
                                    </title>

                                    <style>

                                        *{
                                            box-sizing:border-box;
                                        }

                                        body{

                                            margin:0;

                                            min-height:100vh;

                                            display:flex;

                                            align-items:center;

                                            justify-content:center;

                                            background:#212529;

                                            color:white;

                                            font-family:
                                                Arial,
                                                sans-serif;

                                            text-align:center;

                                            padding:25px;

                                        }

                                        .offline{

                                            max-width:400px;

                                            width:100%;

                                        }

                                        .icon{

                                            width:90px;

                                            height:90px;

                                            margin:0 auto 25px;

                                            border-radius:20px;

                                            object-fit:cover;

                                        }

                                        h1{

                                            margin-bottom:12px;

                                            font-size:28px;

                                        }

                                        p{

                                            color:#adb5bd;

                                            line-height:1.6;

                                        }

                                        button{

                                            margin-top:20px;

                                            border:0;

                                            padding:13px 25px;

                                            border-radius:8px;

                                            background:#198754;

                                            color:white;

                                            font-size:16px;

                                            cursor:pointer;

                                        }

                                    </style>

                                </head>

                                <body>

                                    <div class="offline">

                                        <img
                                            class="icon"
                                            src="/static/assets/img/icon-192.png"
                                            alt="Bar do Celso"
                                        >

                                        <h1>
                                            Sem conexão
                                        </h1>

                                        <p>
                                            Não foi possível
                                            conectar ao servidor.
                                        </p>

                                        <p>
                                            Verifique a sua
                                            ligação à internet
                                            e tente novamente.
                                        </p>

                                        <button
                                            onclick="location.reload()"
                                        >
                                            Tentar novamente
                                        </button>

                                    </div>

                                </body>

                                </html>
                                `,

                                {
                                    status: 503,

                                    headers: {
                                        "Content-Type":
                                            "text/html; charset=UTF-8"
                                    }

                                }

                            );

                        }


                        // -------------------------------------------------
                        // OUTROS PEDIDOS
                        // -------------------------------------------------

                        return new Response(
                            "Offline",
                            {
                                status: 503
                            }
                        );

                    }
                )

        );

    }
);
