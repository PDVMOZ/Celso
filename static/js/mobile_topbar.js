window.addEventListener("load", function(){

    function ajustarTopbarMobile(){

        const date = document.querySelector(".date");
        const storeBtn = document.querySelector(".store-btn");
        const topbar = document.querySelector(".topbar");
        const topLeft = document.querySelector(".top-left");
        const topRight = document.querySelector(".top-right");


        if(!topbar) return;


        if(window.innerWidth <= 900){


            // esconder data
            if(date){
                date.style.display = "none";
            }


            // esconder Bar do Celso
            if(storeBtn){
                storeBtn.style.display = "none";
            }


            // organizar barra superior

            topbar.style.display = "flex";
            topbar.style.alignItems = "center";
            topbar.style.justifyContent = "space-between";


            topbar.style.width = "100%";


            if(topLeft){

                topLeft.style.display="flex";
                topLeft.style.alignItems="center";

            }


            if(topRight){

                topRight.style.display="flex";
                topRight.style.marginLeft="auto";
                topRight.style.alignItems="center";

            }



        }else{


            // restaurar no PC

            if(date){
                date.style.display = "";
            }


            if(storeBtn){
                storeBtn.style.display = "";
            }


            if(topbar){

                topbar.style.display="";
                topbar.style.justifyContent="";
                topbar.style.width="";

            }


            if(topRight){

                topRight.style.marginLeft="";

            }


        }


    }


    ajustarTopbarMobile();


    window.addEventListener(
        "resize",
        ajustarTopbarMobile
    );


});