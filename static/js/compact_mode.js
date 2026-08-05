window.addEventListener("load", function(){


    function compactarDashboard(){


        if(window.innerWidth <= 900){


            // permite scroll horizontal novamente

            document.documentElement.style.overflowX = "auto";



            // CARDS PRINCIPAIS

            const cards = document.querySelector(".cards");


            if(cards){

                cards.style.gridTemplateColumns = "repeat(2,1fr)";
                cards.style.gap = "5px";

            }





            // TODOS OS CARDS

            document.querySelectorAll(
                ".card-item"
            ).forEach(function(card){


                card.style.padding = "5px";

                card.style.minHeight = "45px";

                card.style.borderRadius = "8px";

                card.style.gap = "5px";


            });







            // ICONES

            document.querySelectorAll(
                ".card-icon"
            ).forEach(function(icon){


                icon.style.width = "28px";

                icon.style.height = "28px";

                icon.style.fontSize = "13px";

                icon.style.borderRadius = "8px";


            });








            // TEXTO DOS CARDS

            document.querySelectorAll(
                ".card-content span"
            ).forEach(function(el){


                el.style.fontSize = "7px";

                el.style.marginBottom = "0";


            });




            document.querySelectorAll(
                ".card-content h3"
            ).forEach(function(el){


                el.style.fontSize = "12px";

                el.style.margin = "0";


            });




            document.querySelectorAll(
                ".card-content small"
            ).forEach(function(el){


                el.style.fontSize = "7px";


            });








            // DESEMPENHO DA LOJA

            const desempenho =
            document.querySelector(".right-column");


            if(desempenho){


                desempenho.style.width = "100%";

                desempenho.style.display = "block";


            }







            document.querySelectorAll(
                ".performance-item"
            ).forEach(function(item){


                item.style.padding = "5px";

                item.style.minHeight = "45px";

                item.style.gap = "5px";


            });






            document.querySelectorAll(
                ".performance-item h3"
            ).forEach(function(el){


                el.style.fontSize = "13px";

                el.style.margin = "0";


            });






            document.querySelectorAll(
                ".performance-item span"
            ).forEach(function(el){


                el.style.fontSize = "8px";


            });










            // PAINÉIS

            document.querySelectorAll(
                ".dashboard-card"
            ).forEach(function(card){


                card.style.padding = "8px";

                card.style.marginBottom = "5px";


            });







            // TITULOS

            document.querySelectorAll(
                ".card-header h4"
            ).forEach(function(el){


                el.style.fontSize = "12px";


            });






        }else{


            // restaura no PC

            document.documentElement.style.overflowX = "";


        }



    }




    compactarDashboard();



    window.addEventListener(
        "resize",
        compactarDashboard
    );



});