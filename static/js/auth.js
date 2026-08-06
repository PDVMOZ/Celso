// =====================================================
// AUTENTICAÇÃO
// =====================================================


async function fazerLogin(){


    const email =
    document.getElementById(
        "login-email"
    ).value;


    const senha =
    document.getElementById(
        "login-senha"
    ).value;



    const resposta =
    await fetch(
        API + "/auth/login",
        {

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify({

                email:email,

                senha:senha

            })

        }

    );



    const dados =
    await resposta.json();




    if(resposta.ok){


        localStorage.setItem(
            "usuario",
            JSON.stringify(
                dados.usuario
            )
        );



        usuarioLogado =
        dados.usuario;




        if(
            usuarioLogado.tipo === "admin" ||
            usuarioLogado.tipo === "vendedor"
        ){

            mostrarNovaVenda(true);

        }
        else{

            mostrarNovaVenda(false);

        }




        mostrarHistorico(true);

        mostrarStock(true);



        carregarUsuario(
            dados.usuario
        );



        atualizarMenuDespesas();




        const login =
        document.getElementById(
            "login-screen"
        );


        if(login){

            login.style.display="none";

        }




        carregarDashboard();



    }
    else{


        alert(
            dados.detail
        );


    }


}








// =====================================================
// LOGOUT
// =====================================================


function logout(){


    localStorage.removeItem(
        "usuario"
    );


    usuarioLogado = null;



    const botaoLogin =
    document.getElementById(
        "login-button"
    );



    if(botaoLogin){


        botaoLogin.style.display="flex";

        botaoLogin.style.visibility="visible";

        botaoLogin.style.opacity="1";



        botaoLogin.innerHTML =
        `
        <i class="bi bi-box-arrow-in-right"></i>
        <span>Login</span>
        `;



        botaoLogin.onclick =
        abrirLogin;


    }



    location.reload();


}









// =====================================================
// MENU DESPESAS
// =====================================================


function atualizarMenuDespesas(){



    const menuDespesas =
    document.getElementById(
        "menu-despesas"
    );


    if(!menuDespesas)
        return;



    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );



    if(usuario){


        menuDespesas.style.display =
        "block";


    }
    else{


        menuDespesas.style.display =
        "none";


    }


}









// =====================================================
// CARREGAR USUÁRIO
// =====================================================


function carregarUsuario(usuario){



    const nome =
    document.getElementById(
        "user-name"
    );


    if(nome){

        nome.innerText =
        usuario.nome;

    }






    // ==========================
    // BOTÃO LOGIN / SAIR
    // ==========================


    const botaoLogin =
    document.getElementById(
        "login-button"
    );



    if(botaoLogin){



        botaoLogin.style.display="flex";

        botaoLogin.style.visibility="visible";

        botaoLogin.style.opacity="1";



        botaoLogin.innerHTML =
        `
        <i class="bi bi-box-arrow-right"></i>
        <span>Sair</span>
        `;



        botaoLogin.onclick =
        function(){

            logout();

        };


    }









    const nomePerfil =
    document.getElementById(
        "profile-name"
    );


    const emailPerfil =
    document.getElementById(
        "profile-email"
    );



    if(nomePerfil){

        nomePerfil.innerText =
        usuario.nome;

    }








    const verDetalhes =
    document.getElementById(
        "ver-detalhes-stock"
    );


    if(verDetalhes){

        verDetalhes.style.display="block";

    }








    const menuUsuarios =
    document.getElementById(
        "menu-usuarios"
    );


    const menuCategorias =
    document.getElementById(
        "menu-categorias"
    );


    const menuProdutos =
    document.getElementById(
        "menu-produtos"
    );


    const menuDespesas =
    document.getElementById(
        "menu-despesas"
    );









    if(usuario.tipo==="admin"){



        if(menuUsuarios)
            menuUsuarios.style.display="flex";


        if(menuCategorias)
            menuCategorias.style.display="flex";


        if(menuProdutos)
            menuProdutos.style.display="flex";


    }





    else if(usuario.tipo==="gerente"){



        if(menuUsuarios)
            menuUsuarios.style.display="none";


        if(menuCategorias)
            menuCategorias.style.display="flex";


        if(menuProdutos)
            menuProdutos.style.display="flex";


    }





    else{


        if(menuUsuarios)
            menuUsuarios.style.display="none";


        if(menuCategorias)
            menuCategorias.style.display="none";


        if(menuProdutos)
            menuProdutos.style.display="none";


    }



    atualizarMenuDespesas();



}









// =====================================================
// INICIALIZAÇÃO
// =====================================================


window.addEventListener(
"DOMContentLoaded",
function(){



    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );



    const botaoLogin =
    document.getElementById(
        "login-button"
    );



    if(usuario){



        carregarUsuario(usuario);



    }
    else{


        if(botaoLogin){



            botaoLogin.style.display="flex";

            botaoLogin.style.visibility="visible";

            botaoLogin.style.opacity="1";



            botaoLogin.innerHTML =
            `
            <i class="bi bi-box-arrow-in-right"></i>
            <span>Login</span>
            `;



            botaoLogin.onclick =
            abrirLogin;


        }


    }




    atualizarMenuDespesas();



});
