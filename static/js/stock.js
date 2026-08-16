// =====================================================
// STOCK
// =====================================================

window.abrirStock = async function(){

    document.getElementById(
        "stock-panel"
    ).style.display = "flex";

    await carregarStock();

};


// =====================================================
// FECHAR STOCK
// =====================================================

window.fecharStock = function(){

    document.getElementById(
        "stock-panel"
    ).style.display = "none";

};


// =====================================================
// CARREGAR STOCK
// =====================================================

window.carregarStock = async function(){

    try{

        const resposta = await fetch(
            API + "/produtos/"
        );

        if(!resposta.ok){

            throw new Error(
                "Erro HTTP: " + resposta.status
            );

        }

        const produtos = await resposta.json();

        const tabela = document.getElementById(
            "lista-stock"
        );

        if(!tabela)
            return;

        tabela.innerHTML = "";

        const usuario = JSON.parse(
            localStorage.getItem("usuario")
        );


        produtos.forEach(p => {

            let estado = "";
            let classe = "";


            // =================================================
            // ESTADO DO STOCK
            // =================================================

            if(
                Number(p.quantidade) === 0
            ){

                estado = "Sem Stock";

                classe = "bg-danger";

            }

            else if(
                Number(p.quantidade) <=
                Number(p.stock_minimo)
            ){

                estado = "Baixo";

                classe = "bg-warning text-dark";

            }

            else{

                estado = "Normal";

                classe = "bg-success";

            }


            // =================================================
            // BOTÃO ENTRADA
            // =================================================

            let botaoEntrada = "";


            if(
                usuario &&
                (
                    usuario.tipo === "admin" ||
                    usuario.tipo === "gerente"
                )
            ){

                botaoEntrada = `

                    <button

                        class="btn btn-success btn-sm"

                        onclick="abrirEntradaStock(
                            ${p.id},
                            '${String(p.nome).replace(/'/g, "\\'")}',
                            ${Number(p.preco_compra || 0)},
                            ${Number(p.preco_venda || 0)}
                        )"

                    >

                        <i class="bi bi-plus-circle"></i>

                        Entrada

                    </button>

                `;

            }


            // =================================================
            // LINHA
            // =================================================

            tabela.innerHTML += `

                <tr>

                    <td>
                        ${p.id}
                    </td>

                    <td>
                        ${p.nome}
                    </td>

                    <td>
                        ${p.categoria_id}
                    </td>

                    <td>
                        ${p.quantidade}
                    </td>

                    <td>
                        ${p.stock_minimo}
                    </td>

                    <td>

                        <span class="badge ${classe}">

                            ${estado}

                        </span>

                    </td>

                    <td>

                        ${botaoEntrada}

                    </td>

                </tr>

            `;

        });

    }

    catch(error){

        console.error(
            "Erro ao carregar stock:",
            error
        );

        alert(
            "Erro ao carregar stock."
        );

    }

};


// =====================================================
// ABRIR ENTRADA DE STOCK
// =====================================================

window.abrirEntradaStock = function(
    id,
    nome,
    precoCompra = 0,
    precoVenda = 0
){

    document.getElementById(
        "entrada-produto-id"
    ).value = id;


    document.getElementById(
        "entrada-produto"
    ).value = nome;


    document.getElementById(
        "entrada-quantidade"
    ).value = "";


    // =================================================
    // PREÇO DE COMPRA
    // =================================================

    const campoCompra = document.getElementById(
        "entrada-preco-compra"
    );

    if(campoCompra){

        campoCompra.value =
            precoCompra || "";

    }


    // =================================================
    // PREÇO DE VENDA
    // =================================================

    const campoVenda = document.getElementById(
        "entrada-preco-venda"
    );

    if(campoVenda){

        campoVenda.value =
            precoVenda || "";

    }


    document.getElementById(
        "entrada-stock-panel"
    ).style.display = "flex";

};


// =====================================================
// FECHAR ENTRADA
// =====================================================

window.fecharEntradaStock = function(){

    document.getElementById(
        "entrada-stock-panel"
    ).style.display = "none";

};


// =====================================================
// SALVAR ENTRADA DE STOCK
// =====================================================
//
// AGORA USA:
//
// POST /produtos/{id}/entrada-stock
//
// JSON:
//
// {
//     quantidade: 3,
//     preco_compra: 20,
//     preco_venda: 30
// }
//
// =====================================================

window.salvarEntradaStock = async function(){

    try{

        const id = document.getElementById(
            "entrada-produto-id"
        ).value;


        const quantidade = Number(
            document.getElementById(
                "entrada-quantidade"
            ).value
        );


        const campoCompra = document.getElementById(
            "entrada-preco-compra"
        );


        const campoVenda = document.getElementById(
            "entrada-preco-venda"
        );


        const precoCompra = Number(
            campoCompra ?
            campoCompra.value :
            0
        );


        const precoVenda = Number(
            campoVenda ?
            campoVenda.value :
            0
        );


        // =================================================
        // VALIDAR ID
        // =================================================

        if(!id){

            alert(
                "Produto inválido."
            );

            return;

        }


        // =================================================
        // VALIDAR QUANTIDADE
        // =================================================

        if(
            !quantidade ||
            quantidade <= 0
        ){

            alert(
                "Informe uma quantidade válida."
            );

            return;

        }


        // =================================================
        // VALIDAR PREÇO DE COMPRA
        // =================================================

        if(
            !precoCompra ||
            precoCompra <= 0
        ){

            alert(
                "Informe um preço de compra válido."
            );

            return;

        }


        // =================================================
        // VALIDAR PREÇO DE VENDA
        // =================================================

        if(
            !precoVenda ||
            precoVenda <= 0
        ){

            alert(
                "Informe um preço de venda válido."
            );

            return;

        }


        // =================================================
        // DADOS
        // =================================================

        const dados = {

            quantidade: quantidade,

            preco_compra: precoCompra,

            preco_venda: precoVenda

        };


        console.log(
            "Enviando entrada de stock:",
            dados
        );


        // =================================================
        // NOVA ROTA
        // =================================================

        const resposta = await fetch(

            API +
            "/produtos/" +
            id +
            "/entrada-stock",

            {

                method: "POST",

                headers: {

                    "accept":
                        "application/json",

                    "Content-Type":
                        "application/json"

                },

                body: JSON.stringify(
                    dados
                )

            }

        );


        // =================================================
        // LER RESPOSTA
        // =================================================

        const resultado =
            await resposta.json();


        // =================================================
        // SUCESSO
        // =================================================

        if(resposta.ok){

            alert(
                resultado.mensagem ||
                "Stock adicionado com sucesso."
            );


            fecharEntradaStock();


            // Atualizar tabela de stock
            await carregarStock();


            // Atualizar dashboard
            if(
                typeof carregarDashboard ===
                "function"
            ){

                await carregarDashboard();

            }

        }

        // =================================================
        // ERRO
        // =================================================

        else{

            console.error(
                "Erro da API:",
                resultado
            );


            alert(

                resultado.detail ||

                "Erro ao adicionar stock."

            );

        }

    }

    catch(error){

        console.error(
            "Erro ao adicionar stock:",
            error
        );

        alert(
            "Erro de conexão com o servidor."
        );

    }

};


// =====================================================
// CONTROLAR MENU STOCK
// =====================================================

window.mostrarStock = function(valor){

    const menuStock =
        document.getElementById(
            "menu-stock"
        );


    if(!menuStock)
        return;


    if(valor){

        menuStock.style.display = "flex";

        menuStock.style.visibility =
            "visible";

        menuStock.style.opacity =
            "1";

    }

    else{

        menuStock.style.display =
            "none";

    }

};