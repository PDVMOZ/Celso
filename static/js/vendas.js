/* =====================================================
   VENDAS.JS
   Sistema de vendas - Bar do Celso
===================================================== */

// =====================================================
// VARIÁVEIS DA VENDA
// =====================================================

window.produtosVenda = [];

window.itensVenda = [];

window.usuarioLogado = JSON.parse(
    localStorage.getItem("usuario")
);
// =====================================================
// TESTE MOSTRAR CARRINHO
// =====================================================

window.mostrarCarrinho = function(){

    console.log("mostrarCarrinho carregado");

    const tabela = document.getElementById("lista-carrinho");

    if(!tabela){
        console.log("lista-carrinho não existe no HTML");
        return;
    }


    tabela.innerHTML = "";


    if(itensVenda.length === 0){

        tabela.innerHTML = `
            <tr>
                <td colspan="4" class="text-center">
                    Carrinho vazio
                </td>
            </tr>
        `;

        document.getElementById("total-venda").innerHTML = "0 MT";

        return;
    }


    let total = 0;


    itensVenda.forEach((item, index)=>{


        let subtotal = item.preco * item.quantidade;

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
                        itensVenda[${index}].quantidade = Number(this.value);
                        mostrarCarrinho();
                    "
                >
            </td>


            <td>
                ${subtotal.toFixed(2)} MT
            </td>


            <td>

                <button
                class="btn btn-danger btn-sm"
                onclick="removerCarrinho(${index})">

                    <i class="bi bi-trash"></i>

                </button>

            </td>


        </tr>

        `;


    });


    document.getElementById("total-venda").innerHTML =
        total.toFixed(2) + " MT";
    calcularTroco();
};

// =====================================================
// CALCULAR TROCO
// =====================================================

window.calcularTroco = function(){

    const valorEntregue =
        Number(
            document.getElementById(
                "valor-entregue"
            ).value
        );


    const totalTexto =
        document.getElementById(
            "total-venda"
        ).innerText;


    const total =
        Number(
            totalTexto.replace("MT","").trim()
        );


    let troco = valorEntregue - total;


    if(troco < 0){
        troco = 0;
    }


    document.getElementById(
        "troco"
    ).innerHTML =
        troco.toFixed(2) + " MT";
    };

// =====================================================
// FINALIZAR VENDA
// =====================================================

window.finalizarVenda = async function(){

    if(window.itensVenda.length === 0){

        alert("Adicione produtos ao carrinho");
        return;

    }


    window.usuarioLogado = JSON.parse(
        localStorage.getItem("usuario")
    );


    if(!window.usuarioLogado){

        alert("Faça login.");
        return;

    }



    const valorEntregue = Number(
        document.getElementById(
            "valor-entregue"
        ).value
    );



    const total = window.itensVenda.reduce(
        (soma,item)=>
            soma +
            (item.preco * item.quantidade),
        0
    );



    if(valorEntregue < total){

        alert("Valor entregue insuficiente");
        return;

    }



    const venda = {

        usuario_id:
        window.usuarioLogado.id,


        valor_entregue:
        valorEntregue,


        itens:

        window.itensVenda.map(item=>({

            produto_id:
            Number(item.id),


            quantidade:
            Number(item.quantidade)

        }))

    };



    try{


        console.log(
            "ENVIANDO VENDA:",
            venda
        );



        const resposta =
        await fetch(

            API + "/vendas/",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:
                JSON.stringify(venda)

            }

        );



        const dados =
        await resposta.json();



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



        // gerar recibo antes de limpar carrinho

        gerarRecibo(dados);



        window.itensVenda = [];



        mostrarCarrinho();



        document.getElementById(
            "valor-entregue"
        ).value="";



        document.getElementById(
            "troco"
        ).innerHTML =
        "0 MT";



        await carregarProdutosVenda();



        if(typeof carregarDashboard === "function"){

            await carregarDashboard();

        }



        if(typeof carregarStock === "function"){

            await carregarStock();

        }



        if(typeof carregarVendasDia === "function"){

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

    document.getElementById(
        "venda-panel"
    ).style.display="flex";


    window.itensVenda = [];


    mostrarCarrinho();


    await carregarProdutosVenda();

};



/* =====================================================
   FECHAR VENDA
===================================================== */

window.fecharVenda = function(){

    document.getElementById(
        "venda-panel"
    ).style.display="none";

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
        valor ? "flex" : "none";

    }

};




/* =====================================================
   CARREGAR PRODUTOS PARA VENDA
===================================================== */

window.carregarProdutosVenda = async function(){

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



        let todos =
        await resposta.json();



        produtosVenda =
        todos.filter(
            p =>
            p.quantidade > 0 &&
            p.ativo !== false
        );



        mostrarProdutosVenda(
            produtosVenda
        );


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


window.mostrarProdutosVenda = function(lista){

    let html="";


    if(lista.length===0){


        document.getElementById(
            "lista-produtos-venda"
        ).innerHTML=
        `
        <tr>
            <td colspan="4" class="text-center">
                Nenhum produto disponível
            </td>
        </tr>
        `;


        return;

    }



    lista.forEach(produto=>{


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
                ${produto.quantidade}
            </td>


            <td>

                <button
                class="btn btn-primary btn-sm"
                onclick="adicionarCarrinho(${produto.id})">

                    <i class="bi bi-cart-plus"></i>

                </button>

            </td>

        </tr>

        `;


    });



    document.getElementById(
        "lista-produtos-venda"
    ).innerHTML=html;


};
// =====================================================
// ADICIONAR PRODUTO AO CARRINHO
// =====================================================

// =====================================================
// ADICIONAR AO CARRINHO
// =====================================================

window.adicionarCarrinho = function(id){

    console.log("Produto clicado:", id);


    console.log("Produtos disponíveis:", produtosVenda);



    const produto = produtosVenda.find(
        p => Number(p.id) === Number(id)
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



    const existente = window.itensVenda.find(
        item => Number(item.id) === Number(id)
    );



    if(existente){

    existente.quantidade += 1;

}else{

    window.itensVenda.push({

        id: produto.id,

        nome: produto.nome,

        preco: Number(produto.preco_venda),

        quantidade: 1

    });

}


// diminuir stock visual
produto.quantidade -= 1;


// atualizar tabela produtos
mostrarProdutosVenda(produtosVenda);



    console.log(
        "Carrinho atual:",
        itensVenda
    );


    mostrarCarrinho();


};

// =====================================================
// GERAR RECIBO
// =====================================================


window.gerarRecibo = function(venda){


    document.getElementById("recibo-data").innerHTML =
        new Date().toLocaleString();


    document.getElementById("numero-venda").innerHTML =
    venda.id || Date.now();



    let html = "";

    window.itensVenda.forEach(item => {

        let subtotal = item.preco * item.quantidade;


        html += `

        <tr>

            <td style="
                text-align:left;
                padding:10px 0;
            ">
                ${item.nome}
            </td>


            <td style="
                text-align:center;
            ">
                ${item.quantidade}
            </td>


            <td style="
                text-align:right;
            ">
                ${subtotal.toFixed(2)} MT
            </td>


        </tr>

        `;

    });


    document.getElementById(
        "recibo-itens"
    ).innerHTML = html;


    document.getElementById("recibo-itens").innerHTML = html;


    document.getElementById("recibo-total").innerHTML =
    Number(
        venda.total || 0
    ).toFixed(2);



    let pago = Number(
        document.getElementById("valor-entregue").value
    );


    document.getElementById("recibo-pago").innerHTML =
        pago.toFixed(2);


    document.getElementById("recibo-troco").innerHTML =
        (
        pago - Number(venda.total || 0)
        ).toFixed(2)



    const recibo =
        document.getElementById("recibo");


    recibo.style.display = "block";


    baixarReciboPDF();


};


window.baixarReciboPDF = function(){

    const recibo = document.getElementById("recibo");

    if(!recibo){

        console.error(
            "Elemento recibo não encontrado"
        );

        return;
    }


    // Guardar estilos originais
    const estiloOriginal = {

        width:
            recibo.style.width,

        margin:
            recibo.style.margin,

        transform:
            recibo.style.transform,

        zoom:
            recibo.style.zoom

    };


    // Preparar recibo
    recibo.style.width = "190mm";

    recibo.style.margin = "0 auto";

    recibo.style.transform = "none";

    recibo.style.zoom = "1";

    recibo.style.display = "block";


    setTimeout(() => {

        /*
         * Usamos o próprio html2pdf para
         * transformar o recibo inteiro em canvas.
         *
         * Assim NÃO usamos pagebreak e
         * NÃO alteramos a altura do recibo.
         */

        html2pdf()

        .set({

            html2canvas: {

                scale: 2,

                backgroundColor: "#ffffff",

                useCORS: true,

                scrollX: 0,

                scrollY: 0

            }

        })

        .from(recibo)

        .toCanvas()

        .get("canvas")

        .then(canvas => {

            /*
             * Criar PDF A4 diretamente.
             */
            const { jsPDF } = window.jspdf;

            const pdf = new jsPDF({

                unit: "mm",

                format: "a4",

                orientation: "portrait",

                compress: true

            });


            /*
             * Dimensões da página A4.
             */
            const paginaLargura = 210;

            const paginaAltura = 297;


            /*
             * Margem.
             */
            const margem = 10;


            const larguraDisponivel =
                paginaLargura -
                (margem * 2);


            const alturaDisponivel =
                paginaAltura -
                (margem * 2);


            /*
             * Dimensões originais do canvas.
             */
            const larguraCanvas =
                canvas.width;

            const alturaCanvas =
                canvas.height;


            /*
             * Calcular escala para que
             * TODO o recibo caiba na A4.
             */
            const escalaLargura =
                larguraDisponivel /
                larguraCanvas;


            const escalaAltura =
                alturaDisponivel /
                alturaCanvas;


            /*
             * Usar a menor escala.
             *
             * Isso garante que nenhuma parte
             * do recibo fique fora da página.
             */
            const escala =
                Math.min(
                    escalaLargura,
                    escalaAltura
                );


            /*
             * Tamanho final da imagem.
             */
            const larguraFinal =
                larguraCanvas *
                escala;


            const alturaFinal =
                alturaCanvas *
                escala;


            /*
             * Centralizar horizontalmente.
             */
            const x =
                (paginaLargura -
                larguraFinal) / 2;


            /*
             * Começar no topo da página.
             */
            const y = margem;


            /*
             * Colocar o RECIBO INTEIRO
             * dentro da única página A4.
             */
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


            /*
             * Salvar PDF.
             */
            pdf.save(
                "recibo-venda.pdf"
            );


            /*
             * Restaurar estilos.
             */
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

        .catch(error => {

            console.error(
                "Erro ao gerar PDF:",
                error
            );

            alert(
                "Erro ao gerar recibo PDF."
            );


            /*
             * Restaurar estilos
             * mesmo em caso de erro.
             */
            recibo.style.width =
                estiloOriginal.width;

            recibo.style.margin =
                estiloOriginal.margin;

            recibo.style.transform =
                estiloOriginal.transform;

            recibo.style.zoom =
                estiloOriginal.zoom;

        });

    }, 200);

};
// =====================================================
// FILTRAR PRODUTOS NA VENDA
// =====================================================

window.filtrarProdutos = function(){

    const campo = document.getElementById(
        "pesquisa-produto"
    );


    if(!campo){
        console.log("Campo pesquisa-produto não encontrado");
        return;
    }


    const texto = campo.value
        .toLowerCase()
        .trim();


    const filtrados = produtosVenda.filter(produto => {


        return produto.nome
            .toLowerCase()
            .includes(texto);


    });


    mostrarProdutosVenda(filtrados);


};

// =====================================================
// REMOVER PRODUTO DO CARRINHO
// =====================================================

window.removerCarrinho = function(index){

    console.log("Removendo item:", index);


    if(index < 0 || index >= window.itensVenda.length){

        console.error("Índice inválido:", index);
        return;

    }


    window.itensVenda.splice(index, 1);


    mostrarCarrinho();


    // atualizar troco depois de remover
    if(typeof calcularTroco === "function"){

        calcularTroco();

    }


};


