// historico.js

// =====================================================
// ARRAY GLOBAL DO HISTÓRICO
// =====================================================

let vendasHistorico = [];


// =====================================================
// ABRIR HISTÓRICO DE VENDAS
// =====================================================

async function abrirHistoricoVendas(){

    try {

        document.getElementById(
            "historico-panel"
        ).style.display = "flex";


        // =================================================
        // BUSCAR VENDAS
        // =================================================

        const resposta = await fetch(
            "/vendas/"
        );


        if(!resposta.ok){

            throw new Error(
                "Erro ao buscar vendas"
            );

        }


        vendasHistorico =
            await resposta.json();


        console.log(
            "Vendas carregadas:",
            vendasHistorico
        );


        // =================================================
        // MOSTRAR TODAS AS VENDAS
        // =================================================

        renderizarHistoricoVendas(
            vendasHistorico
        );


        // =================================================
        // CAMPO DE FILTRO
        // =================================================

        const filtro =
            document.getElementById(
                "filtro-historico-vendas"
            );


        if(filtro){

            // Evita criar vários eventos
            // quando abrir o histórico novamente
            filtro.oninput = function(){

                const texto =
                    this.value
                        .toLowerCase()
                        .trim();


                // =========================================
                // SE ESTIVER VAZIO
                // MOSTRAR TODAS
                // =========================================

                if(!texto){

                    renderizarHistoricoVendas(
                        vendasHistorico
                    );

                    return;

                }


                // =========================================
                // FILTRAR
                // =========================================

                const vendasFiltradas =
                    vendasHistorico.filter(
                        venda => {


                            // =============================
                            // DATA
                            // =============================

                            let dataVenda = "";


                            if(venda.data){

                                dataVenda =
                                    new Date(
                                        venda.data
                                    ).toLocaleString(
                                        "pt-PT"
                                    );

                            }

                            else if(
                                venda.data_criacao
                            ){

                                dataVenda =
                                    new Date(
                                        venda.data_criacao
                                    ).toLocaleString(
                                        "pt-PT"
                                    );

                            }

                            else if(
                                venda.created_at
                            ){

                                dataVenda =
                                    new Date(
                                        venda.created_at
                                    ).toLocaleString(
                                        "pt-PT"
                                    );

                            }

                            else if(
                                venda.data_venda
                            ){

                                dataVenda =
                                    new Date(
                                        venda.data_venda
                                    ).toLocaleString(
                                        "pt-PT"
                                    );

                            }


                            // =============================
                            // TEXTO PARA PESQUISA
                            // =============================

                            const conteudo = `

                                ${venda.id ?? ""}

                                ${venda.total ?? ""}

                                ${venda.valor_entregue ?? ""}

                                ${venda.troco ?? ""}

                                ${dataVenda}

                            `
                            .toLowerCase();


                            return conteudo.includes(
                                texto
                            );

                        }
                    );


                // =========================================
                // MOSTRAR RESULTADOS
                // =========================================

                renderizarHistoricoVendas(
                    vendasFiltradas
                );

            };

        }

    }

    catch(error){

        console.error(
            "Erro ao abrir histórico:",
            error
        );


        alert(
            "Erro ao carregar histórico de vendas."
        );

    }

}


// =====================================================
// RENDERIZAR HISTÓRICO
// =====================================================

function renderizarHistoricoVendas(
    vendas
){

    const tabela =
        document.getElementById(
            "lista-historico-vendas"
        );


    if(!tabela){

        console.error(
            "Elemento #lista-historico-vendas não encontrado"
        );

        return;

    }


    tabela.innerHTML = "";


    // =================================================
    // NENHUMA VENDA
    // =================================================

    if(
        !vendas ||
        vendas.length === 0
    ){

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:20px;
                        color:#777;
                    "
                >

                    Nenhuma venda encontrada.

                </td>

            </tr>

        `;

        return;

    }


    // =================================================
    // CRIAR LINHAS
    // =================================================

    vendas.forEach(venda => {


        // =============================================
        // DATA
        // =============================================

        let dataVenda = "";


        if(venda.data){

            dataVenda =
                new Date(
                    venda.data
                ).toLocaleString(
                    "pt-PT"
                );

        }

        else if(venda.data_criacao){

            dataVenda =
                new Date(
                    venda.data_criacao
                ).toLocaleString(
                    "pt-PT"
                );

        }

        else if(venda.created_at){

            dataVenda =
                new Date(
                    venda.created_at
                ).toLocaleString(
                    "pt-PT"
                );

        }

        else if(venda.data_venda){

            dataVenda =
                new Date(
                    venda.data_venda
                ).toLocaleString(
                    "pt-PT"
                );

        }

        else{

            dataVenda =
                "Não informada";

        }


        // =============================================
        // LINHA DA VENDA
        // =============================================

        tabela.innerHTML += `

            <tr>

                <td>
                    ${venda.id ?? ""}
                </td>


                <td>
                    ${Number(
                        venda.total || 0
                    ).toFixed(2)} MT
                </td>


                <td>
                    ${Number(
                        venda.valor_entregue || 0
                    ).toFixed(2)} MT
                </td>


                <td>
                    ${Number(
                        venda.troco || 0
                    ).toFixed(2)} MT
                </td>


                <td>
                    ${dataVenda}
                </td>


                <td>

                    <button
                        class="btn btn-success"
                        onclick="gerarReciboVenda(${venda.id})"
                    >

                        <i class="bi bi-receipt"></i>

                        Recibo

                    </button>

                </td>

            </tr>

        `;

    });

}


// =====================================================
// FECHAR HISTÓRICO
// =====================================================

function fecharHistoricoVendas(){

    document.getElementById(
        "historico-panel"
    ).style.display = "none";

}

function fecharHistoricoVendas(){


    document.getElementById(
        "historico-panel"
    ).style.display="none";


}





async function gerarReciboVenda(idVenda) {

    try {

        const resposta = await fetch(
            `/vendas/${idVenda}`
        );

        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar venda"
            );

        }

        const venda = await resposta.json();

        console.log(
            "Venda recibo:",
            venda
        );

        if (
            !venda.itens ||
            venda.itens.length === 0
        ) {

            alert(
                "Venda não possui itens"
            );

            return;

        }


        // =====================================================
        // CRIAR PDF A4
        // =====================================================

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({

            orientation: "portrait",

            unit: "mm",

            format: "a4",

            compress: true

        });


        // =====================================================
        // CONFIGURAÇÕES
        // =====================================================

        const centro = 105;

        const margemEsquerda = 20;

        const margemDireita = 190;

        /*
         * COMEÇAR BEM NO TOPO.
         *
         * Antes estava 25mm.
         * Agora começa em apenas 10mm.
         */

        let y = 20;


        // =====================================================
        // DATA
        // =====================================================

        let dataVenda = "Não informada";


        if (venda.data) {

            dataVenda =
                new Date(
                    venda.data
                ).toLocaleString("pt-PT");

        }

        else if (venda.data_criacao) {

            dataVenda =
                new Date(
                    venda.data_criacao
                ).toLocaleString("pt-PT");

        }

        else if (venda.created_at) {

            dataVenda =
                new Date(
                    venda.created_at
                ).toLocaleString("pt-PT");

        }

        else if (venda.data_venda) {

            dataVenda =
                new Date(
                    venda.data_venda
                ).toLocaleString("pt-PT");

        }


        // =====================================================
        // CABEÇALHO
        // =====================================================

        pdf.setFont(
            "helvetica",
            "bold"
        );


        /*
         * TÍTULO
         */

        pdf.setFontSize(18);

        pdf.text(
            "BAR DO CELSO",
            centro,
            y,
            {
                align: "center"
            }
        );


        y += 7;


        /*
         * NÚMERO DA VENDA
         */

        pdf.setFontSize(11);

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.text(
            "RECIBO DE VENDA Nº " +
            venda.id,
            centro,
            y,
            {
                align: "center"
            }
        );


        y += 6;


        /*
         * DATA DA VENDA
         */

        pdf.setFontSize(8);

        pdf.text(
            "Data da Venda: " +
            dataVenda,
            centro,
            y,
            {
                align: "center"
            }
        );


        y += 5;


        /*
         * DATA DE EMISSÃO
         */

        pdf.text(
            "Data de Emissão: " +
            new Date()
                .toLocaleString("pt-PT"),
            centro,
            y,
            {
                align: "center"
            }
        );


        y += 6;


        // =====================================================
        // LINHA
        // =====================================================

        pdf.line(
            margemEsquerda,
            y,
            margemDireita,
            y
        );


        y += 6;


        // =====================================================
        // CABEÇALHO DA TABELA
        // =====================================================

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(9);


        pdf.text(
            "Produto",
            25,
            y
        );


        pdf.text(
            "Qtd",
            125,
            y,
            {
                align: "center"
            }
        );


        pdf.text(
            "Valor",
            175,
            y,
            {
                align: "right"
            }
        );


        y += 5;


        // =====================================================
        // PRODUTOS
        // =====================================================

        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(8);


        let totalCalculado = 0;


        venda.itens.forEach(item => {


            /*
             * NÃO CRIAR NOVA PÁGINA.
             *
             * O objetivo é manter tudo
             * dentro da mesma A4.
             */

            let nome = "Produto";


            if (item.produto) {

                nome =
                    String(
                        item.produto.nome
                    );

            }


            const quantidade =
                Number(
                    item.quantidade || 0
                );


            const preco =
                Number(
                    item.preco_unitario || 0
                );


            const subtotal =
                preco * quantidade;


            totalCalculado += subtotal;


            /*
             * Se o nome for muito grande,
             * cortar somente o excesso
             * horizontal.
             */

            if (nome.length > 55) {

                nome =
                    nome.substring(
                        0,
                        52
                    ) + "...";

            }


            pdf.text(
                nome,
                25,
                y
            );


            pdf.text(
                String(quantidade),
                125,
                y,
                {
                    align: "center"
                }
            );


            pdf.text(
                subtotal.toFixed(2) +
                " MT",
                175,
                y,
                {
                    align: "right"
                }
            );


            /*
             * ESPAÇAMENTO PEQUENO
             */

            y += 4.5;

        });


        // =====================================================
        // TOTAL
        // =====================================================

        y += 3;


        pdf.line(
            margemEsquerda,
            y,
            margemDireita,
            y
        );


        y += 7;


        const total =
            Number(
                venda.total ??
                totalCalculado
            );


        const pago =
            Number(
                venda.valor_entregue || 0
            );


        const troco =
            Number(
                venda.troco ??
                Math.max(
                    0,
                    pago - total
                )
            );


        // =====================================================
        // VALORES
        // =====================================================

        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(10);


        pdf.text(
            "Total: " +
            total.toFixed(2) +
            " MT",
            25,
            y
        );


        y += 5;


        pdf.setFont(
            "helvetica",
            "normal"
        );

        pdf.setFontSize(9);


        pdf.text(
            "Pago: " +
            pago.toFixed(2) +
            " MT",
            25,
            y
        );


        y += 5;


        pdf.text(
            "Troco: " +
            troco.toFixed(2) +
            " MT",
            25,
            y
        );


        // =====================================================
        // AGRADECIMENTO
        // =====================================================

        y += 9;


        pdf.setFont(
            "helvetica",
            "bold"
        );

        pdf.setFontSize(9);


        pdf.text(
            "Obrigado pela preferência!",
            centro,
            y,
            {
                align: "center"
            }
        );


        // =====================================================
        // SALVAR
        // =====================================================

        pdf.save(
            "recibo-bar-do-celso-" +
            venda.id +
            ".pdf"
        );


    }

    catch(error) {

        console.error(
            "ERRO AO GERAR RECIBO:",
            error
        );

        alert(
            "Erro ao gerar recibo"
        );

    }

}

function mostrarHistorico(valor){


    const menuHistorico =
    document.getElementById(
        "menu-historico"
    );



    if(menuHistorico){


        menuHistorico.style.display =
        valor ? "flex" : "none";


    }


}


// =====================================================
// FORÇAR HISTÓRICO VISÍVEL PARA USUÁRIO LOGADO
// =====================================================

function forcarHistoricoVisivel(){

    try{

        const usuario =
            JSON.parse(
                localStorage.getItem("usuario")
            );


        // Se não está logado, não fazer nada
        if(!usuario){
            return;
        }


        const menuHistorico =
            document.getElementById(
                "menu-historico"
            );


        if(!menuHistorico){
            return;
        }


        // FORÇAR O BOTÃO A APARECER
        menuHistorico.style.setProperty(
            "display",
            "flex",
            "important"
        );


    }
    catch(error){

        console.error(
            "Erro ao restaurar Histórico:",
            error
        );

    }

}


// =====================================================
// INICIALIZAR DEPOIS QUE O HTML ESTIVER CARREGADO
// =====================================================

window.addEventListener(
    "DOMContentLoaded",
    function(){

        // Mostrar imediatamente
        forcarHistoricoVisivel();


        // =================================================
        // OBSERVAR ALTERAÇÕES NO SIDEBAR
        // =================================================

        const observadorHistorico =
            new MutationObserver(
                function(){

                    forcarHistoricoVisivel();

                }
            );


        /*
         * Usamos document.documentElement
         * em vez de document.body.
         *
         * Assim funciona mesmo que o JS
         * seja carregado no <head>.
         */

        observadorHistorico.observe(
            document.documentElement,
            {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "style",
                    "class"
                ]
            }
        );


        // =================================================
        // GARANTIA EXTRA
        // =================================================

        setInterval(
            function(){

                forcarHistoricoVisivel();

            },
            500
        );

    }
);
