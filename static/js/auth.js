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

                "Content-Type":
                "application/json"

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


        // NOVA VENDA
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


        // restantes menus

        mostrarHistorico(true);

        mostrarStock(true);


        carregarUsuario(
            dados.usuario
        );
        atualizarMenuDespesas();


        // fecha imediatamente o modal
        document.getElementById(
            "login-screen"
        ).style.display = "none";


        // carrega dados em segundo plano
        carregarDashboard();
    }

    else{

        alert(
            dados.detail
        );

    }

}


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

        // qualquer utilizador logado vê despesas
        menuDespesas.style.display = "block";

    }
    else{

        // visitante não vê
        menuDespesas.style.display = "none";

    }

}
// =====================================================
// CARREGAR DADOS DO UTILIZADOR
// =====================================================

function carregarUsuario(usuario){

    // Nome mostrado na Topbar
    const nome =
    document.getElementById(
        "user-name"
    );

    if(nome){

        nome.innerText =
        usuario.nome;

    }


    const botaoLogin =
    document.getElementById(
        "login-button"
    );


    if(botaoLogin){

        botaoLogin.style.display = "none";

    }
    // Perfil da Sidebar
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

    if(emailPerfil){

        emailPerfil.innerText =
        usuario.email;

    }


    // Link de detalhes do stock
    const verDetalhes =
    document.getElementById(
        "ver-detalhes-stock"
    );

    if(verDetalhes){

        verDetalhes.style.display =
        "block";

    }


    // Menus
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
    // ============================
    // ADMIN
    // ============================

    if(usuario.tipo === "admin"){

        if(menuUsuarios)
            menuUsuarios.style.display =
            "flex";

        if(menuCategorias)
            menuCategorias.style.display =
            "flex";

        if(menuProdutos)
            menuProdutos.style.display =
            "flex";

        if(menuDespesas)
            menuDespesas.style.display =
            "block";

    }

    // ============================
    // GERENTE
    // ============================

    else if(usuario.tipo === "gerente"){

        if(menuUsuarios)
            menuUsuarios.style.display =
            "none";

        if(menuCategorias)
            menuCategorias.style.display =
            "flex";

        if(menuProdutos)
            menuProdutos.style.display =
            "flex";
        if(menuDespesas)
        menuDespesas.style.display =
        "block";

    }

    // ============================
    // VENDEDOR
    // ============================

    else{

        if(menuUsuarios)
            menuUsuarios.style.display =
            "none";

        if(menuCategorias)
            menuCategorias.style.display =
            "none";

        if(menuProdutos)
            menuProdutos.style.display =
            "none";

        if(menuDespesas)
        menuDespesas.style.display =
        "block";

    }
    atualizarMenuDespesas();

}

window.addEventListener("DOMContentLoaded", function(){

    const usuario =
    JSON.parse(localStorage.getItem("usuario"));
        if(usuario){

        carregarUsuario(usuario);

    }


    const botaoLogin =
    document.getElementById("login-button");


    if(botaoLogin){

        if(usuario){

            botaoLogin.style.display = "none";

        }
        else{

            botaoLogin.style.display = "block";

            botaoLogin.onclick = abrirLogin;

        }

    }
    atualizarMenuDespesas();

});


