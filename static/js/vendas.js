/* =====================================================
   VENDAS.JS
   Sistema de vendas - Bar do Celso
===================================================== */


/* =====================================================
   VARIÁVEIS DA VENDA
===================================================== */

window.produtosVenda = [];

window.itensVenda = [];

window.usuarioLogado = JSON.parse(
    localStorage.getItem("usuario")
);


/* =====================================================
   MOSTRAR CARRINHO
===================================================== */

window.mostrarCarrinho = function(){

    console.log("mostrarCarrinho carregado");


    const tabela =
        document.getElementById("lista-carrinho");


    if(!tabela){

        console.log(
            "lista-carrinho não existe no HTML"
        );

        return;

    }


    tabela.innerHTML = "";


    /* ================================================
       CARRINHO VAZIO
    ================================================ */

    if(window.itensVenda.length === 0){

        tabela.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Carrinho vazio
                </td>
            </tr>
        `;


        const totalElemento =
            document.getElementById("total-venda");


        if(totalElemento){

            totalElemento.innerHTML =
                "0 MT";

        }


        calcularTroco();

        return;

    }


    /* ================================================
       CALCULAR TOTAL
    ================================================ */

    let total = 0;


    window.itensVenda.forEach(
        (item, index) => {


        let subtotal =
            Number(item.preco) *
            Number(item.quantidade);


        total += subtotal;


        tabela.innerHTML += `

            <tr>

                <td>
                    ${item.nome}
                </td>


                <td>

                    <input
                        type="number"
                        min="1"
                        value="${item.quantidade}"
                        class="form-control form-control-sm"
                        style="width:70px;"
                        onchange="
                            alterarQuantidadeCarrinho(
                                ${index},
                                this.value
                            )
                        "
                    >

                </td>


                <td>
                    ${subtotal.toFixed(2)} MT
                </td>


                <td>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="
                            removerCarrinho(${index})
                        "
                    >

                        <i class="bi bi-trash"></i>

                    </button>

                </td>


            </tr>

        `;

    });


    /* ================================================
       MOSTRAR TOTAL
    ================================================ */

    const totalElemento =
        document.getElementById("total-venda");


    if(totalElemento){

        totalElemento.innerHTML =
            total.toFixed(2) + " MT";

    }


    /* ================================================
       RECALCULAR TROCO
    ================================================ */

    calcularTroco();

};


/* =====================================================
   ALTERAR QUANTIDADE DO CARRINHO
===================================================== */

window.alterarQuantidadeCarrinho = function(
    index,
    valor
){

    if(
        index < 0 ||
        index >= window.itensVenda.length
    ){

        return;

    }


    let novaQuantidade =
        Number(valor);


    /* ================================================
       QUANTIDADE MÍNIMA
    ================================================ */

    if(
        !Number.isFinite(novaQuantidade) ||
        novaQuantidade < 1
    ){

        novaQuantidade = 1;

    }


    novaQuantidade =
        Math.floor(novaQuantidade);


    const item =
        window.itensVenda[index];


    /* ================================================
       ENCONTRAR PRODUTO ORIGINAL
    ================================================ */

    const produto =
        window.produtosVenda.find(
            p =>
            Number(p.id) ===
            Number(item.id)
        );


    if(produto){

        /*
         * Quantidade atual no carrinho.
         */

        const quantidadeAtual =
            Number(item.quantidade);


        /*
         * Diferença entre a nova e a antiga
         * quantidade.
         */

        const diferenca =
            novaQuantidade -
            quantidadeAtual;


        /*
         * Se aumentou a quantidade,
         * precisamos verificar o stock.
         */

        if(diferenca > 0){

            if(
                Number(produto.quantidade) <
                diferenca
            ){

                alert(
                    "Quantidade em stock insuficiente."
                );

                mostrarCarrinho();

                return;

            }


            produto.quantidade -=
                diferenca;

        }


        /*
         * Se diminuiu a quantidade,
         * devolvemos o produto ao stock visual.
         */

        if(diferenca < 0){

            produto.quantidade +=
                Math.abs(diferenca);

        }

    }


    item.quantidade =
        novaQuantidade;


    /*
     * Atualizar lista de produtos.
     *
     * Mantém o filtro atual.
     */

    filtrarProdutos();


    mostrarCarrinho();

};


/* =====================================================
   CALCULAR TROCO
===================================================== */

window.calcularTroco = function(){

    const campoValor =
        document.getElementById(
            "valor-entregue"
        );


    const campoTroco =
        document.getElementById(
            "troco"
        );


    const campoTotal =
        document.getElementById(
            "total-venda"
        );


    if(!campoValor || !campoTroco){

        return;

    }


    const valorEntregue =
        Number(
            campoValor.value
        );


    let total = 0;


    if(campoTotal){

        const totalTexto =
            campoTotal.innerText
                .replace("MT", "")
                .trim();


        total =
            Number(totalTexto) || 0;

    }


    let troco =
        valorEntregue -
        total;


    /*
     * Nunca mostrar troco negativo.
     */

    if(
        !Number.isFinite(troco) ||
        troco < 0
    ){

        troco = 0;

    }


    campoTroco.innerHTML =
        troco.toFixed(2) +
        " MT";

};


/* =====================================================
   FINALIZAR VENDA
===================================================== */

window.finalizarVenda = async function(){

    /* ================================================
       VERIFICAR CARRINHO
    ================================================ */

    if(
        window.itensVenda.length === 0
    ){

        alert(
            "Adicione produtos ao carrinho"
        );

        return;

    }


    /* ================================================
       ATUALIZAR USUÁRIO LOGADO
    ================================================ */

    window.usuarioLogado =
        JSON.parse(
            localStorage.getItem(
                "usuario"
            )
        );


    if(!window.usuarioLogado){

        alert(
            "Faça login."
        );

        return;

    }


    /* ================================================
       VALOR ENTREGUE
    ================================================ */

    const campoValor =
        document.getElementById(
            "valor-entregue"
        );


    const valorEntregue =
        Number(
            campoValor.value
        );


    /* ================================================
       CALCULAR TOTAL
    ================================================ */

    const total =
        window.itensVenda.reduce(
            (
                soma,
                item
            ) => {

                return soma +
                    (
                        Number(item.preco) *
                        Number(item.quantidade)
                    );

            },
            0
        );


    /* ================================================
       VALIDAR PAGAMENTO
    ================================================ */

    if(
        !Number.isFinite(valorEntregue)
    ){

        alert(
            "Informe o valor entregue."
        );

        return;

    }


    if(
        valorEntregue < total
    ){

        alert(
            "Valor entregue insuficiente"
        );

        return;

    }


    /* ================================================
       MONTAR VENDA
    ================================================ */

    const venda = {

        usuario_id:
            window.usuarioLogado.id,


        valor_entregue:
            valorEntregue,


        itens:

            window.itensVenda.map(
                item => ({

                    produto_id:
                        Number(item.id),


                    quantidade:
                        Number(item.quantidade)

                })
            )

    };


    try{

        console.log(
            "ENVIANDO VENDA:",
            venda
        );


        /* ============================================
           ENVIAR VENDA PARA API
        ============================================ */

        const resposta =
            await fetch(

                API + "/vendas/",

                {

                    method: "POST",


                    headers: {

                        "Content-Type":
                            "application/json"

                    },


                    body:
                        JSON.stringify(
                            venda
                        )

                }

            );


        /* ============================================
           LER RESPOSTA
        ============================================ */

        const dados =
            await resposta.json();


        /* ============================================
           VERIFICAR ERRO
        ============================================ */

        if(!resposta.ok){

            alert(

                dados.detail ||
                "Erro ao realizar venda"

            );

            return;

        }


        console.log(
            "VENDA REGISTADA:",
            dados
        );


        /* ============================================
           GERAR RECIBO ANTES DE LIMPAR CARRINHO
        ============================================ */

        gerarRecibo(dados);


        /* ============================================
           LIMPAR CARRINHO
        ============================================ */

        window.itensVenda = [];


        mostrarCarrinho();


        /* ============================================
           LIMPAR VALOR ENTREGUE
        ============================================ */

        if(campoValor){

            campoValor.value = "";

        }


        /* ============================================
           RESETAR TROCO
        ============================================ */

        const campoTroco =
            document.getElementById(
                "troco"
            );


        if(campoTroco){

            campoTroco.innerHTML =
                "0 MT";

        }


        /* ============================================
           RECARREGAR PRODUTOS
        ============================================ */

        await carregarProdutosVenda();


        /* ============================================
           ATUALIZAR DASHBOARD
        ============================================ */

        if(
            typeof carregarDashboard ===
            "function"
        ){

            await carregarDashboard();

        }


        /* ============================================
           ATUALIZAR STOCK
        ============================================ */

        if(
            typeof carregarStock ===
            "function"
        ){

            await carregarStock();

        }


        /* ============================================
           ATUALIZAR VENDAS DO DIA
        ============================================ */

        if(
            typeof carregarVendasDia ===
            "function"
        ){

            await carregarVendasDia();

        }

    }
    catch(error){

        console.error(
            "ERRO VENDA:",
            error
        );


        alert(
            "Erro ao finalizar venda."
        );

    }

};


/* =====================================================
   ABRIR VENDA
===================================================== */

window.abrirVenda = async function(){

    const painel =
        document.getElementById(
            "venda-panel"
        );


    if(painel){

        painel.style.display =
            "flex";

    }


    /* ================================================
       LIMPAR CARRINHO
    ================================================ */

    window.itensVenda = [];


    /* ================================================
       LIMPAR PESQUISA
    ================================================ */

    const pesquisa =
        document.getElementById(
            "pesquisa-produto"
        );


    if(pesquisa){

        pesquisa.value = "";

    }


    /* ================================================
       MOSTRAR CARRINHO VAZIO
    ================================================ */

    mostrarCarrinho();


    /* ================================================
       CARREGAR PRODUTOS
    ================================================ */

    await carregarProdutosVenda();

};


/* =====================================================
   FECHAR VENDA
===================================================== */

window.fecharVenda = function(){

    const painel =
        document.getElementById(
            "venda-panel"
        );


    if(painel){

        painel.style.display =
            "none";

    }

};


/* =====================================================
   MOSTRAR MENU NOVA VENDA
===================================================== */

window.mostrarNovaVenda = function(valor){

    const menuVenda =
        document.getElementById(
            "menu-nova-venda"
        );


    if(menuVenda){

        menuVenda.style.display =
            valor
            ? "flex"
            : "none";

    }

};


/* =====================================================
   CARREGAR PRODUTOS PARA VENDA
===================================================== */

window.carregarProdutosVenda =
    async function(){

    try{

        const resposta =
            await fetch(
                API + "/produtos/"
            );


        if(!resposta.ok){

            throw new Error(
                "Erro ao buscar produtos"
            );

        }


        const todos =
            await resposta.json();


        /* ============================================
           FILTRAR PRODUTOS DISPONÍVEIS
        ============================================ */

        window.produtosVenda =
            todos.filter(

                p =>

                    Number(p.quantidade) > 0 &&

                    p.ativo !== false

            );


        /* ============================================
           MOSTRAR PRODUTOS
        ============================================ */

        filtrarProdutos();

    }
    catch(error){

        console.error(
            "Erro produtos:",
            error
        );

    }

};


/* =====================================================
   MOSTRAR PRODUTOS
===================================================== */

window.mostrarProdutosVenda =
    function(lista){

    const tabela =
        document.getElementById(
            "lista-produtos-venda"
        );


    if(!tabela){

        console.error(
            "lista-produtos-venda não encontrada"
        );

        return;

    }


    let html = "";


    /* ================================================
       NENHUM PRODUTO
    ================================================ */

    if(
        !lista ||
        lista.length === 0
    ){

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="text-center"
                >

                    Nenhum produto disponível

                </td>

            </tr>

        `;

        return;

    }


    /* ================================================
       LISTAR PRODUTOS
    ================================================ */

    lista.forEach(
        produto => {

        html += `

            <tr>

                <td>
                    ${produto.nome}
                </td>


                <td>

                    ${Number(
                        produto.preco_venda
                    ).toFixed(2)}

                    MT

                </td>


                <td>

                    ${Number(
                        produto.quantidade
                    )}

                </td>


                <td>

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="
                            adicionarCarrinho(
                                ${produto.id}
                            )
                        "
                    >

                        <i
                            class="bi bi-cart-plus"
                        ></i>

                    </button>

                </td>

            </tr>

        `;

    });


    tabela.innerHTML =
        html;

};


/* =====================================================
   ADICIONAR PRODUTO AO CARRINHO
===================================================== */

window.adicionarCarrinho =
    function(id){

    console.log(
        "Produto clicado:",
        id
    );


    console.log(
        "Produtos disponíveis:",
        window.produtosVenda
    );


    /* ================================================
       PROCURAR PRODUTO
    ================================================ */

    const produto =
        window.produtosVenda.find(

            p =>
                Number(p.id) ===
                Number(id)

        );


    if(!produto){

        console.error(
            "Produto não encontrado",
            id
        );

        return;

    }


    console.log(
        "Produto encontrado:",
        produto
    );


    /* ================================================
       VERIFICAR STOCK
    ================================================ */

    if(
        Number(produto.quantidade) <= 0
    ){

        alert(
            "Produto sem stock."
        );

        return;

    }


    /* ================================================
       VERIFICAR SE JÁ EXISTE NO CARRINHO
    ================================================ */

    const existente =
        window.itensVenda.find(

            item =>
                Number(item.id) ===
                Number(id)

        );


    if(existente){

        existente.quantidade += 1;

    }
    else{

        window.itensVenda.push({

            id:
                produto.id,


            nome:
                produto.nome,


            preco:
                Number(
                    produto.preco_venda
                ),


            quantidade:
                1

        });

    }


    /* ================================================
       DIMINUIR STOCK VISUAL
    ================================================ */

    produto.quantidade -= 1;


    /* ================================================
       IMPORTANTE

       NÃO usar:

       mostrarProdutosVenda(produtosVenda)

       porque isso apagaria o filtro.

       Usamos filtrarProdutos(), que reaplica
       o filtro atualmente digitado.
    ================================================ */

    filtrarProdutos();


    console.log(
        "Carrinho atual:",
        window.itensVenda
    );


    /* ================================================
       ATUALIZAR CARRINHO
    ================================================ */

    mostrarCarrinho();

};


/* =====================================================
   GERAR RECIBO
===================================================== */

window.gerarRecibo =
    function(venda){

    /* ================================================
       DATA
    ================================================ */

    const reciboData =
        document.getElementById(
            "recibo-data"
        );


    if(reciboData){

        reciboData.innerHTML =
            new Date().toLocaleString();

    }


    /* ================================================
       NÚMERO DA VENDA
    ================================================ */

    const numeroVenda =
        document.getElementById(
            "numero-venda"
        );


    if(numeroVenda){

        numeroVenda.innerHTML =
            venda.id ||
            Date.now();

    }


    /* ================================================
       ITENS
    ================================================ */

    let html = "";


    window.itensVenda.forEach(
        item => {

        const subtotal =
            Number(item.preco) *
            Number(item.quantidade);


        html += `

            <tr>

                <td
                    style="
                        text-align:left;
                        padding:10px 0;
                    "
                >

                    ${item.nome}

                </td>


                <td
                    style="
                        text-align:center;
                    "
                >

                    ${item.quantidade}

                </td>


                <td
                    style="
                        text-align:right;
                    "
                >

                    ${subtotal.toFixed(2)}
                    MT

                </td>

            </tr>

        `;

    });


    const reciboItens =
        document.getElementById(
            "recibo-itens"
        );


    if(reciboItens){

        reciboItens.innerHTML =
            html;

    }


    /* ================================================
       TOTAL
    ================================================ */

    const reciboTotal =
        document.getElementById(
            "recibo-total"
        );


    const totalVenda =
        Number(
            venda.total || 0
        );


    if(reciboTotal){

        reciboTotal.innerHTML =
            totalVenda.toFixed(2);

    }


    /* ================================================
       VALOR PAGO
    ================================================ */

    const campoValor =
        document.getElementById(
            "valor-entregue"
        );


    const pago =
        Number(
            campoValor
            ? campoValor.value
            : 0
        );


    const reciboPago =
        document.getElementById(
            "recibo-pago"
        );


    if(reciboPago){

        reciboPago.innerHTML =
            pago.toFixed(2);

    }


    /* ================================================
       TROCO
    ================================================ */

    const reciboTroco =
        document.getElementById(
            "recibo-troco"
        );


    const troco =
        Math.max(
            0,
            pago - totalVenda
        );


    if(reciboTroco){

        reciboTroco.innerHTML =
            troco.toFixed(2);

    }


    /* ================================================
       MOSTRAR RECIBO
    ================================================ */

    const recibo =
        document.getElementById(
            "recibo"
        );


    if(!recibo){

        console.error(
            "Elemento recibo não encontrado"
        );

        return;

    }


    recibo.style.display =
        "block";


    /* ================================================
       GERAR PDF
    ================================================ */

    baixarReciboPDF();

};


/* =====================================================
   BAIXAR RECIBO PDF
===================================================== */

window.baixarReciboPDF =
    function(){

    const recibo =
        document.getElementById(
            "recibo"
        );


    if(!recibo){

        console.error(
            "Elemento recibo não encontrado"
        );

        return;

    }


    /* ================================================
       GUARDAR ESTILOS ORIGINAIS
    ================================================ */

    const estiloOriginal = {

        width:
            recibo.style.width,


        margin:
            recibo.style.margin,


        transform:
            recibo.style.transform,


        zoom:
            recibo.style.zoom,


        display:
            recibo.style.display

    };


    /* ================================================
       PREPARAR RECIBO
    ================================================ */

    recibo.style.width =
        "190mm";


    recibo.style.margin =
        "0 auto";


    recibo.style.transform =
        "none";


    recibo.style.zoom =
        "1";


    recibo.style.display =
        "block";


    /* ================================================
       AGUARDAR RENDERIZAÇÃO
    ================================================ */

    setTimeout(
        () => {

        html2pdf()

        .set({

            html2canvas: {

                scale: 2,

                backgroundColor:
                    "#ffffff",

                useCORS:
                    true,

                scrollX:
                    0,

                scrollY:
                    0

            }

        })

        .from(recibo)

        .toCanvas()

        .get("canvas")

        .then(
            canvas => {

            /* ========================================
               CRIAR PDF A4
            ======================================== */

            const {
                jsPDF
            } = window.jspdf;


            const pdf =
                new jsPDF({

                    unit:
                        "mm",

                    format:
                        "a4",

                    orientation:
                        "portrait",

                    compress:
                        true

                });


            /* ========================================
               DIMENSÕES A4
            ======================================== */

            const paginaLargura =
                210;


            const paginaAltura =
                297;


            const margem =
                10;


            const larguraDisponivel =
                paginaLargura -
                (
                    margem * 2
                );


            const alturaDisponivel =
                paginaAltura -
                (
                    margem * 2
                );


            /* ========================================
               DIMENSÕES CANVAS
            ======================================== */

            const larguraCanvas =
                canvas.width;


            const alturaCanvas =
                canvas.height;


            /* ========================================
               CALCULAR ESCALA
            ======================================== */

            const escalaLargura =
                larguraDisponivel /
                larguraCanvas;


            const escalaAltura =
                alturaDisponivel /
                alturaCanvas;


            const escala =
                Math.min(
                    escalaLargura,
                    escalaAltura
                );


            /* ========================================
               TAMANHO FINAL
            ======================================== */

            const larguraFinal =
                larguraCanvas *
                escala;


            const alturaFinal =
                alturaCanvas *
                escala;


            /* ========================================
               CENTRALIZAR
            ======================================== */

            const x =
                (
                    paginaLargura -
                    larguraFinal
                ) / 2;


            const y =
                margem;


            /* ========================================
               COLOCAR RECIBO NO PDF
            ======================================== */

            pdf.addImage(

                canvas,

                "JPEG",

                x,

                y,

                larguraFinal,

                alturaFinal,

                undefined,

                "FAST"

            );


            /* ========================================
               SALVAR
            ======================================== */

            pdf.save(
                "recibo-venda.pdf"
            );


            /* ========================================
               RESTAURAR ESTILOS
            ======================================== */

            recibo.style.width =
                estiloOriginal.width;


            recibo.style.margin =
                estiloOriginal.margin;


            recibo.style.transform =
                estiloOriginal.transform;


            recibo.style.zoom =
                estiloOriginal.zoom;


            recibo.style.display =
                "none";

        })

        .catch(
            error => {

            console.error(
                "Erro ao gerar PDF:",
                error
            );


            alert(
                "Erro ao gerar recibo PDF."
            );


            /* ====================================
               RESTAURAR ESTILOS EM CASO DE ERRO
            ==================================== */

            recibo.style.width =
                estiloOriginal.width;


            recibo.style.margin =
                estiloOriginal.margin;


            recibo.style.transform =
                estiloOriginal.transform;


            recibo.style.zoom =
                estiloOriginal.zoom;


            recibo.style.display =
                estiloOriginal.display;

        });

    }, 200);

};


/* =====================================================
   FILTRAR PRODUTOS NA VENDA
===================================================== */

window.filtrarProdutos =
    function(){

    const campo =
        document.getElementById(
            "pesquisa-produto"
        );


    if(!campo){

        console.log(
            "Campo pesquisa-produto não encontrado"
        );

        return;

    }


    /* ================================================
       TEXTO DA PESQUISA
    ================================================ */

    const texto =
        campo.value
            .toLowerCase()
            .trim();


    /* ================================================
       FILTRAR
    ================================================ */

    const filtrados =
        window.produtosVenda.filter(
            produto => {

            return String(
                produto.nome
            )
            .toLowerCase()
            .includes(
                texto
            );

        });


    /* ================================================
       MOSTRAR RESULTADO
    ================================================ */

    mostrarProdutosVenda(
        filtrados
    );

};


/* =====================================================
   REMOVER PRODUTO DO CARRINHO
===================================================== */

window.removerCarrinho =
    function(index){

    console.log(
        "Removendo item:",
        index
    );


    /* ================================================
       VALIDAR ÍNDICE
    ================================================ */

    if(

        index < 0 ||

        index >=
        window.itensVenda.length

    ){

        console.error(
            "Índice inválido:",
            index
        );

        return;

    }


    /* ================================================
       PRODUTO REMOVIDO
    ================================================ */

    const item =
        window.itensVenda[index];


    /* ================================================
       DEVOLVER AO STOCK VISUAL
    ================================================ */

    const produto =
        window.produtosVenda.find(

            p =>
                Number(p.id) ===
                Number(item.id)

        );


    if(produto){

        produto.quantidade +=
            Number(item.quantidade);

    }


    /* ================================================
       REMOVER DO CARRINHO
    ================================================ */

    window.itensVenda.splice(
        index,
        1
    );


    /* ================================================
       ATUALIZAR PRODUTOS

       Mantém o filtro atual.
    ================================================ */

    filtrarProdutos();


    /* ================================================
       ATUALIZAR CARRINHO
    ================================================ */

    mostrarCarrinho();


    /* ================================================
       ATUALIZAR TROCO
    ================================================ */

    calcularTroco();

};

// =====================================================
// ROLAR AUTOMATICAMENTE PARA O ITEM ADICIONADO
// =====================================================

window.rolarParaItemCarrinho = function(id){

    // Esperar a tabela terminar de atualizar
    setTimeout(() => {

        const container =
            document.getElementById(
                "carrinho-scroll"
            );


        if(!container){

            console.error(
                "carrinho-scroll não encontrado"
            );

            return;

        }


        // Procurar o produto pelo ID
        const item =
            container.querySelector(
                `tr[data-produto-id="${id}"]`
            );


        if(!item){

            console.error(
                "Item não encontrado no carrinho:",
                id
            );

            return;

        }


        // =============================================
        // ROLAR ATÉ O ITEM
        // =============================================

        item.scrollIntoView({

            behavior: "smooth",

            block: "center",

            inline: "nearest"

        });


        // =============================================
        // DESTACAR O ITEM
        // =============================================

        item.classList.remove(
            "item-adicionado-destaque"
        );

        // Forçar atualização visual
        void item.offsetWidth;

        item.classList.add(
            "item-adicionado-destaque"
        );


        // Remover destaque depois de 1 segundo
        setTimeout(() => {

            item.classList.remove(
                "item-adicionado-destaque"
            );

        }, 1000);


    }, 50);

};
