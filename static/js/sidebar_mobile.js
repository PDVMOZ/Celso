window.addEventListener("load", function(){

    const btn = document.querySelector(".menu-btn");
    const sidebar = document.querySelector(".sidebar");

    if(!btn || !sidebar){
        console.log("Botão ou sidebar não encontrado");
        return;
    }


    let aberto = false;


    function abrirSidebar(){

        sidebar.style.cssText = `
            position:fixed !important;
            top:0 !important;
            left:0 !important;
            width:290px !important;
            height:100vh !important;
            display:flex !important;
            flex-direction:column !important;
            background:#111827 !important;
            z-index:999999 !important;
            opacity:1 !important;
            visibility:visible !important;
            transform:none !important;
        `;


        // mantém o botão sempre visível

        btn.style.position = "fixed";
        btn.style.left = "15px";
        btn.style.top = "15px";
        btn.style.zIndex = "1000000";

    }



    function fecharSidebar(){

        sidebar.style.left = "-290px";


        btn.style.position = "";
        btn.style.left = "";
        btn.style.top = "";
        btn.style.zIndex = "";

    }




    btn.addEventListener("click", function(e){

        e.preventDefault();
        e.stopPropagation();


        // somente comportamento mobile

        if(window.innerWidth <= 900){


            aberto = !aberto;


            if(aberto){

                abrirSidebar();

                console.log("SIDEBAR MOBILE ABERTO");


            }else{


                fecharSidebar();

                console.log("SIDEBAR MOBILE FECHADO");


            }


        }


    });



    // quando aumentar a tela volta ao modo PC

    window.addEventListener("resize", function(){


        if(window.innerWidth > 900){


            sidebar.removeAttribute("style");


            btn.style.position = "";
            btn.style.left = "";
            btn.style.top = "";
            btn.style.zIndex = "";


            aberto = false;


            console.log("MODO PC RESTAURADO");


        }


    });



});