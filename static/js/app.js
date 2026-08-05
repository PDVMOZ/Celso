// =====================================================
// CONFIGURAÇÃO GLOBAL DA APLICAÇÃO
// =====================================================


const API = "http://127.0.0.1:8000";


// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================


// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================


let produtosVenda = [];

let carrinho = [];

let usuarioLogado = null;



// =====================================================
// CARREGAR UTILIZADOR AO INICIAR SISTEMA
// =====================================================


document.addEventListener("DOMContentLoaded", () => {


    const usuario =
    localStorage.getItem("usuario");
    // Esconde Nova Venda por padrão
    // Esconde menus por padrão
    mostrarNovaVenda(false);
    mostrarHistorico(false);
    mostrarStock(false);


    const menuDespesas =
    document.getElementById(
        "menu-despesas"
    );



    if(usuario){

        usuarioLogado =
        JSON.parse(usuario);


        console.log(
            "USUARIO LOGADO:",
            usuarioLogado
        );


        carregarUsuario(usuarioLogado);



        // MOSTRAR NOVA VENDA
        // Apenas ADMIN e VENDEDOR podem vender

        if(
            usuarioLogado.tipo === "admin" ||
            usuarioLogado.tipo === "vendedor"
        ){

            mostrarNovaVenda(true);

        }
        else{

            mostrarNovaVenda(false);

        }


        // MOSTRAR DESPESAS
        if(menuDespesas){

            menuDespesas.style.display = "block";

        }


    }
    else{


        if(menuDespesas){

            menuDespesas.style.display =
            "none";

        }


        const vendas =
        document.getElementById(
            "vendas-dia"
        );


        if(vendas){

            vendas.innerText =
            "0.00 MT";

        }



        const detalhe =
        document.querySelector(
            "#vendas-dia"
        );



        if(
            detalhe &&
            detalhe.parentElement
        ){


            const info =
            detalhe.parentElement
            .querySelector("small");



            if(info){

                info.innerHTML =
                "Faça login para ver vendas";

            }


        }


    }




    const verDetalhes =
    document.getElementById(
        "ver-detalhes-stock"
    );



    if(verDetalhes){

        verDetalhes.style.display =
        "none";

    }



});

// =====================================================
// LOGIN / LOGOUT GERAL
// =====================================================


function abrirLogin(){


    document.getElementById(
        "login-screen"
    ).style.display="flex";


}



function fecharLogin(){


    document.getElementById(
        "login-screen"
    ).style.display="none";


}




function logout(){


    localStorage.removeItem("usuario");

    usuarioLogado = null;

    mostrarNovaVenda(false);


    usuarioLogado = null;



    const user =
    document.getElementById(
        "user-name"
    );


    if(user){

        user.innerText =
        "Login";

    }



    const nomePerfil =
    document.querySelector(
        ".profile-info strong"
    );


    const emailPerfil =
    document.querySelector(
        ".profile-info small"
    );



    if(nomePerfil){

        nomePerfil.innerText =
        "Visitante";

    }


    if(emailPerfil){

        emailPerfil.innerText =
        "";

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


    const verDetalhes =
    document.getElementById(
        "ver-detalhes-stock"
    );



    if(verDetalhes){

        verDetalhes.style.display =
        "none";

    }


    if(menuUsuarios)
        menuUsuarios.style.display="none";


    if(menuCategorias)
        menuCategorias.style.display="none";


    if(menuProdutos)
        menuProdutos.style.display="none";
    if(menuDespesas)
        menuDespesas.style.display="none";

    mostrarNovaVenda(false);

    mostrarHistorico(false);

    mostrarStock(false);



    const vendas =
    document.getElementById(
        "vendas-dia"
    );


    if(vendas){

        vendas.innerText =
        "0.00 MT";

    }



    const lucro =
    document.getElementById(
        "lucro-hoje"
    );


    if(lucro){

        lucro.innerText =
        "0.00 MT";

    }



    const despesas =
    document.getElementById(
        "despesas-hoje"
    );


    if(despesas){

        despesas.innerText =
        "0.00 MT";

    }



    const totalStock =
    document.getElementById(
        "total-stock"
    );


    if(totalStock){

        totalStock.innerText =
        "0";

    }



    const produtosNovos =
    document.getElementById(
        "produtos-novos"
    );


    if(produtosNovos){

        produtosNovos.innerText =
        "0";

    }



    const baixoStock =
    document.getElementById(
        "baixo-stock"
    );


    if(baixoStock){

        baixoStock.innerText =
        "0";

    }



    const lista =
    document.getElementById(
        "baixo-stock-list"
    );


    if(lista){

        lista.innerHTML =
        `
        <div class="alert alert-secondary mb-0">
            Faça login para visualizar o stock.
        </div>
        `;

    }
    const botaoLogin =
    document.getElementById(
        "login-button"
    );


    if(botaoLogin){

        botaoLogin.style.display = "block";

        botaoLogin.onclick = abrirLogin;

    }

    fecharLogin();


}
