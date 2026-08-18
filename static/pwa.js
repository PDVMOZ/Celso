// =====================================================
// PWA - BAR DO CELSO
// =====================================================

(function () {

    "use strict";


    // =================================================
    // SERVICE WORKER
    // =================================================

    if ("serviceWorker" in navigator) {

        window.addEventListener(
            "load",
            function () {

                navigator.serviceWorker
                    .register(
                        "/service-worker.js",
                        {
                            scope: "/"
                        }
                    )
                    .then(
                        function (registration) {

                            console.log(
                                "PWA: Service Worker registado.",
                                registration.scope
                            );

                        }
                    )
                    .catch(
                        function (error) {

                            console.error(
                                "PWA: erro ao registar Service Worker:",
                                error
                            );

                        }
                    );

            }
        );

    }


    // =================================================
    // INSTALAÇÃO DA PWA
    // =================================================

    let eventoInstalacao = null;


    window.addEventListener(
        "beforeinstallprompt",
        function (event) {

            event.preventDefault();

            eventoInstalacao = event;

            console.log(
                "PWA: aplicação pronta para instalação."
            );


            window.eventoInstalacaoPWA =
                eventoInstalacao;

        }
    );


    // =================================================
    // FUNÇÃO PARA INSTALAR
    // =================================================

    window.instalarPWA = async function () {

        if (!eventoInstalacao) {

            alert(
                "A instalação ainda não está disponível neste dispositivo."
            );

            return;

        }


        eventoInstalacao.prompt();


        const resultado =
            await eventoInstalacao.userChoice;


        console.log(
            "Resultado instalação PWA:",
            resultado.outcome
        );


        eventoInstalacao = null;

        window.eventoInstalacaoPWA =
            null;

    };


    // =================================================
    // DETECTAR INSTALAÇÃO
    // =================================================

    window.addEventListener(
        "appinstalled",
        function () {

            console.log(
                "PWA: aplicação instalada com sucesso."
            );

            eventoInstalacao = null;

            window.eventoInstalacaoPWA =
                null;

        }
    );


    // =================================================
    // DETECTAR MODO PWA
    // =================================================

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

            document.body.classList.add(
                "pwa-standalone"
            );


            console.log(
                "PWA: aplicação aberta em modo standalone."
            );

        }

    }


    verificarModoPWA();


})();