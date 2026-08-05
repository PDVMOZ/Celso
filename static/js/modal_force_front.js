window.addEventListener("load", function(){


    function protegerModalContraSidebar(){


        if(window.innerWidth > 900){
            return;
        }



        const sidebar = document.querySelector(".sidebar");



        const modais = document.querySelectorAll(
            ".modal, .usuarios-modal, .login-screen, [role='dialog']"
        );



        let modalAberto = false;



        modais.forEach(function(modal){


            const estilo =
            window.getComputedStyle(modal);



            if(
                estilo.display !== "none" &&
                estilo.visibility !== "hidden"
            ){


                modalAberto = true;



                modal.style.setProperty(
                    "position",
                    "fixed",
                    "important"
                );


                modal.style.setProperty(
                    "top",
                    "0",
                    "important"
                );


                modal.style.setProperty(
                    "left",
                    "0",
                    "important"
                );


                modal.style.setProperty(
                    "width",
                    "100%",
                    "important"
                );


                modal.style.setProperty(
                    "height",
                    "100%",
                    "important"
                );


                modal.style.setProperty(
                    "z-index",
                    "99999999",
                    "important"
                );


            }



        });



        if(sidebar){



            if(modalAberto){


                sidebar.style.setProperty(
                    "z-index",
                    "999",
                    "important"
                );


            }else{


                sidebar.style.setProperty(
                    "z-index",
                    "99999",
                    "important"
                );


            }


        }



    }



    setInterval(
        protegerModalContraSidebar,
        300
    );



    document.addEventListener(
        "click",
        function(){

            setTimeout(
                protegerModalContraSidebar,
                100
            );

        }
    );



});