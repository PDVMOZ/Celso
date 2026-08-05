window.addEventListener("load", function(){

    const menuBtn = document.querySelector(".menu-btn");


    function forcarMenuFixo(){

        if(window.innerWidth <= 900 && menuBtn){


            menuBtn.style.setProperty(
                "position",
                "fixed",
                "important"
            );


            menuBtn.style.setProperty(
                "top",
                "12px",
                "important"
            );


            menuBtn.style.setProperty(
                "left",
                "15px",
                "important"
            );


            menuBtn.style.setProperty(
                "right",
                "auto",
                "important"
            );


            menuBtn.style.setProperty(
                "z-index",
                "999999",
                "important"
            );


            menuBtn.style.setProperty(
                "display",
                "flex",
                "important"
            );


            menuBtn.style.setProperty(
                "align-items",
                "center",
                "important"
            );


            menuBtn.style.setProperty(
                "justify-content",
                "center",
                "important"
            );


        }

    }



    function ajustarTopbarMobile(){


        const date = document.querySelector(".date");
        const store = document.querySelector(".store-btn");
        const login = document.querySelector(".user-menu");


        if(window.innerWidth <= 900){


            if(date){

                date.style.display="none";

            }


            if(store){

                store.style.display="none";

            }



            if(login){

                login.style.setProperty(
                    "position",
                    "fixed",
                    "important"
                );

                login.style.setProperty(
                    "top",
                    "12px",
                    "important"
                );

                login.style.setProperty(
                    "right",
                    "15px",
                    "important"
                );

                login.style.setProperty(
                    "z-index",
                    "999999",
                    "important"
                );

            }



            forcarMenuFixo();



        }else{


            if(date){

                date.style.display="";

            }


            if(store){

                store.style.display="";

            }


        }


    }



    ajustarTopbarMobile();



    // força quando redimensionar

    window.addEventListener(
        "resize",
        ajustarTopbarMobile
    );



    // força depois de qualquer clique (abrir/fechar sidebar)

    document.addEventListener(
        "click",
        function(){

            setTimeout(
                forcarMenuFixo,
                50
            );

        }
    );



    // força a cada meio segundo caso outro script altere

    setInterval(
        forcarMenuFixo,
        5
    );


});