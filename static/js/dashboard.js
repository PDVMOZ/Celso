// =====================================================
// DASHBOARD.JS
// =====================================================

console.log("DASHBOARD.JS FOI CARREGADO");

let vendasVendedoresCache = [];


// =====================================================
// FUNÇÃO AUXILIAR
// OBTER USUÁRIO
// =====================================================

function obterUsuarioDashboard(){

    try{

        const storage =
            localStorage.getItem("usuario");

        if(!storage)
            return null;

        return JSON.parse(storage);

    }
    catch(error){

        console.error(
            "ERRO AO LER USUÁRIO:",
            error
        );

        return null;

    }

}


// =====================================================
// CARREGAR DASHBOARD
// =====================================================

window.carregarDashboard = async function(){

    try{

        console.log("=====================================");
        console.log(" CARREGANDO DASHBOARD");
        console.log("=====================================");


        const usuario =
            obterUsuarioDashboard();


        let urlDashboard =
            API + "/dashboard/";


        // =============================================
        // VENDEDOR
        // =============================================

        if(
            usuario &&
            usuario.tipo === "vendedor"
        ){

            urlDashboard +=
                "?usuario_id=" +
                encodeURIComponent(usuario.id);

        }


        console.log(
            "URL DASHBOARD:",
            urlDashboard
        );


        // =============================================
        // BUSCAR DASHBOARD
        // =============================================

        const resposta =
            await fetch(
                urlDashboard,
                {
                    cache: "no-store"
                }
            );


        console.log(
            "STATUS DASHBOARD:",
            resposta.status
        );


        if(!resposta.ok){

            const erroTexto =
                await resposta.text();

            console.error(
                "ERRO DASHBOARD:",
                erroTexto
            );

            throw new Error(
                "Erro HTTP " +
                resposta.status
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "========== DASHBOARD =========="
        );

        console.log(
            "DADOS COMPLETOS:",
            dados
        );

        console.log(
            "STOCK RECEBIDO:",
            dados.stock
        );

        console.log(
            "BAIXO STOCK RECEBIDO:",
            dados.stock?.baixo_stock
        );

        console.log(
            "TOTAL BAIXO STOCK:",
            dados.stock?.baixo_stock_total
        );


        // =============================================
        // DETALHES DAS VENDAS
        // =============================================

        const verDetalhesVendas =
            document.getElementById(
                "ver-detalhes-vendas"
            );


        if(verDetalhesVendas){

            if(
                usuario &&
                (
                    usuario.tipo === "admin" ||
                    usuario.tipo === "gerente"
                )
            ){

                verDetalhesVendas.style.display =
                    "block";

            }
            else{

                verDetalhesVendas.style.display =
                    "none";

            }

        }


        // =============================================
        // BOTÃO LOGIN
        // =============================================

        const botaoLogin =
            document.getElementById(
                "login-button"
            );


        if(botaoLogin){

            if(usuario){

                botaoLogin.style.display =
                    "none";

            }
            else{

                botaoLogin.style.display =
                    "block";

                if(
                    typeof abrirLogin ===
                    "function"
                ){

                    botaoLogin.onclick =
                        abrirLogin;

                }

            }

        }


        // =============================================
        // STOCK
        // =============================================

        let stock =
            dados.stock || {};


        // =============================================
        // SE O DASHBOARD NÃO TROUXER STOCK,
        // BUSCAR DIRETAMENTE /stock/
        // =============================================

        let produtosStock =
            Array.isArray(stock.produtos)
                ? stock.produtos
                : null;


        if(!produtosStock){

            try{

                console.log(
                    "Dashboard não trouxe lista de stock."
                );

                console.log(
                    "Buscando diretamente:",
                    API + "/stock/"
                );


                const respostaStock =
                    await fetch(
                        API + "/stock/",
                        {
                            cache: "no-store"
                        }
                    );


                if(respostaStock.ok){

                    produtosStock =
                        await respostaStock.json();


                    console.log(
                        "STOCK DIRETO RECEBIDO:",
                        produtosStock
                    );

                }

            }
            catch(error){

                console.error(
                    "ERRO AO BUSCAR STOCK DIRETO:",
                    error
                );

            }

        }


        // =============================================
        // CALCULAR BAIXO STOCK DIRETAMENTE
        // CASO O DASHBOARD NÃO ENVIE A LISTA
        // =============================================

        let baixoStockProdutos =
            Array.isArray(stock.baixo_stock)
                ? stock.baixo_stock
                : [];


        if(
            baixoStockProdutos.length === 0 &&
            Array.isArray(produtosStock)
        ){

            baixoStockProdutos =
                produtosStock.filter(
                    produto => {

                        const quantidade =
                            Number(
                                produto.quantidade ?? 0
                            );


                        const minimo =
                            Number(
                                produto.stock_minimo ?? 0
                            );


                        return (
                            quantidade <= minimo
                        );

                    }
                );

        }


        // =============================================
        // TOTAL STOCK
        // =============================================

        const totalStock =
            document.getElementById(
                "total-stock"
            );


        if(totalStock){

            let total =
                stock.total;


            // Se backend não enviar total,
            // calcula diretamente

            if(
                total === undefined &&
                Array.isArray(produtosStock)
            ){

                total =
                    produtosStock.reduce(
                        (
                            soma,
                            produto
                        ) => {

                            return soma +
                                Number(
                                    produto.quantidade ?? 0
                                );

                        },
                        0
                    );

            }


            totalStock.innerText =
                total ?? 0;

        }


        // =============================================
        // PRODUTOS NOVOS
        // =============================================

        const produtosNovos =
            document.getElementById(
                "produtos-novos"
            );


        if(produtosNovos){

            produtosNovos.innerText =
                stock.produtos_novos ?? 0;

        }


        // =============================================
        // TOTAL BAIXO STOCK
        // =============================================

        const baixoStock =
            document.getElementById(
                "baixo-stock"
            );


        if(baixoStock){

            baixoStock.innerText =
                baixoStockProdutos.length;

        }


        // =============================================
        // LUCRO
        // =============================================

        const lucro =
            document.getElementById(
                "lucro-hoje"
            );


        if(lucro){

            lucro.innerText =
                Number(
                    dados.lucro_hoje || 0
                ).toFixed(2)
                + " MT";

        }


        // =============================================
        // DESPESAS
        // =============================================

        const despesas =
            document.getElementById(
                "despesas-hoje"
            );


        if(despesas){

            despesas.innerText =
                Number(
                    dados.despesas_hoje || 0
                ).toFixed(2)
                + " MT";

        }


        // =============================================
        // LISTA DE PRODUTOS COM BAIXO STOCK
        // =============================================

        const lista =
            document.getElementById(
                "baixo-stock-list"
            );


        if(lista){

            lista.innerHTML = "";


            // =========================================
            // EXISTEM PRODUTOS COM BAIXO STOCK
            // =========================================

            if(
                Array.isArray(
                    baixoStockProdutos
                )
                &&
                baixoStockProdutos.length > 0
            ){

                baixoStockProdutos.forEach(
                    produto => {

                        const nome =
                            produto.nome ??
                            produto.produto ??
                            "Produto";


                        const quantidade =
                            Number(
                                produto.quantidade ?? 0
                            );


                        const minimo =
                            Number(
                                produto.stock_minimo ?? 0
                            );


                        lista.innerHTML += `

                        <div class="alert-item">

                            <div>

                                <strong>
                                    ${nome}
                                </strong>

                                <br>

                                <small>

                                    Stock:
                                    ${quantidade}

                                    /
                                    mínimo:
                                    ${minimo}

                                </small>

                            </div>

                            <span
                                class="badge bg-danger"
                            >
                                Baixo Stock
                            </span>

                        </div>

                        `;

                    }
                );

            }

            // =========================================
            // NENHUM PRODUTO
            // =========================================

            else{

                lista.innerHTML = `

                    <div
                        class="alert alert-success mb-0"
                    >

                        Nenhum produto com baixo stock.

                    </div>

                `;

            }

        }


        // =============================================
        // VENDAS DO DIA
        // =============================================

        if(
            typeof carregarVendasDia ===
            "function"
        ){

            await carregarVendasDia();

        }


        console.log(
            "DASHBOARD CARREGADO COM SUCESSO"
        );

    }
    catch(error){

        console.error(
            "ERRO DASHBOARD:",
            error
        );

    }

};


// =====================================================
// VENDAS DE HOJE
// =====================================================

window.carregarVendasDia = async function(){

    console.log(
        "====================================="
    );

    console.log(
        " CARREGANDO VENDAS DE HOJE"
    );

    console.log(
        "====================================="
    );


    const elemento =
        document.getElementById(
            "vendas-dia"
        );


    if(!elemento){

        console.error(
            "ERRO: #vendas-dia não existe"
        );

        return;

    }


    const usuario =
        obterUsuarioDashboard();


    if(!usuario){

        console.log(
            "Usuário ainda não está disponível."
        );

        elemento.innerText =
            "0.00 MT";

        return;

    }


    // =============================================
    // URL
    // =============================================

    let url =
        API +
        "/vendas/dashboard/vendas-dia";


    if(
        usuario.tipo ===
        "vendedor"
    ){

        url +=
            "?usuario_id=" +
            encodeURIComponent(
                usuario.id
            );

    }


    // =============================================
    // CACHE
    // =============================================

    if(url.includes("?")){

        url +=
            "&_=" +
            Date.now();

    }
    else{

        url +=
            "?_=" +
            Date.now();

    }


    console.log(
        "URL VENDAS:",
        url
    );


    try{

        const resposta =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        console.log(
            "STATUS VENDAS:",
            resposta.status
        );


        if(!resposta.ok){

            const erroTexto =
                await resposta.text();

            console.error(
                "ERRO SERVIDOR VENDAS:",
                erroTexto
            );

            throw new Error(
                "Erro HTTP " +
                resposta.status
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "VENDAS RECEBIDAS:",
            dados
        );


        const vendasHoje =
            Number(
                dados.vendas_dia ?? 0
            );


        elemento.innerText =
            vendasHoje.toFixed(2) +
            " MT";

    }
    catch(error){

        console.error(
            "ERRO AO CARREGAR VENDAS:",
            error
        );


        elemento.innerText =
            "0.00 MT";

    }

};


// =====================================================
// DETALHES DOS VENDEDORES
// =====================================================

window.carregarDetalhesVendedores = async function(){

    try{

        const tabela =
            document.getElementById(
                "tabela-vendedores"
            );


        if(!tabela)
            return;


        const usuario =
            obterUsuarioDashboard();


        if(!usuario){

            tabela.innerHTML =
                "Usuário não encontrado";

            return;

        }


        const resposta =
            await fetch(
                API +
                "/vendas/dashboard/vendas-vendedores?usuario_id=" +
                encodeURIComponent(
                    usuario.id
                ),
                {
                    cache: "no-store"
                }
            );


        if(!resposta.ok){

            throw new Error(
                "Erro ao carregar detalhes"
            );

        }


        const dados =
            await resposta.json();


        vendasVendedoresCache =
            dados;


        mostrarVendasVendedores(
            dados
        );

    }
    catch(error){

        console.error(
            "ERRO DETALHES:",
            error
        );

    }

};


// =====================================================
// MOSTRAR VENDAS DOS VENDEDORES
// =====================================================

window.mostrarVendasVendedores = function(
    dados
){

    const tabela =
        document.getElementById(
            "tabela-vendedores"
        );


    if(!tabela)
        return;


    if(
        !Array.isArray(dados) ||
        dados.length === 0
    ){

        tabela.innerHTML = `

            <div class="alert alert-info">

                Nenhuma venda encontrada.

            </div>

        `;

        return;

    }


    let agrupado = {};


    dados.forEach(
        venda => {

            const chave =
                venda.vendedor +
                "_" +
                venda.data;


            if(!agrupado[chave]){

                agrupado[chave] = {

                    vendedor:
                        venda.vendedor,

                    data:
                        venda.data,

                    total: 0,

                    produtos: []

                };

            }


            agrupado[chave].total +=
                Number(
                    venda.total || 0
                );


            if(
                Array.isArray(
                    venda.produtos
                )
            ){

                venda.produtos.forEach(
                    produto => {

                        agrupado[
                            chave
                        ].produtos.push(
                            produto
                        );

                    }
                );

            }

        }
    );


    const vendasOrganizadas =
        Object.values(
            agrupado
        );


    let html = "";


    vendasOrganizadas.forEach(
        venda => {

            html += `

            <div class="card mb-4">

                <div
                    class="card-header bg-dark text-white"
                >

                    <strong>
                        Data: ${venda.data}
                    </strong>

                </div>


                <div class="card-body">

                    <h5>
                        Vendedor:
                        ${venda.vendedor}
                    </h5>


                    <p>

                        <strong>
                            Total vendido:
                        </strong>

                        ${venda.total.toFixed(2)}
                        MT

                    </p>


                    <table
                        class="table table-sm table-bordered"
                    >

                        <thead>

                            <tr>

                                <th>
                                    Produto
                                </th>

                                <th>
                                    Quantidade
                                </th>

                                <th>
                                    Subtotal
                                </th>

                            </tr>

                        </thead>


                        <tbody>

            `;


            venda.produtos.forEach(
                produto => {

                    html += `

                        <tr>

                            <td>
                                ${produto.produto}
                            </td>

                            <td>
                                ${produto.quantidade}
                            </td>

                            <td>

                                ${Number(
                                    produto.subtotal || 0
                                ).toFixed(2)}

                                MT

                            </td>

                        </tr>

                    `;

                }
            );


            html += `

                        </tbody>

                    </table>

                </div>

            </div>

            `;

        }
    );


    tabela.innerHTML =
        html;

};


// =====================================================
// FILTRAR VENDAS POR DATA
// =====================================================

window.filtrarVendasData = function(){

    const campo =
        document.getElementById(
            "filtro-data-vendas"
        );


    if(!campo)
        return;


    const texto =
        campo.value.trim();


    if(texto === ""){

        mostrarVendasVendedores(
            vendasVendedoresCache
        );

        return;

    }


    const filtradas =
        vendasVendedoresCache.filter(
            venda =>
                String(
                    venda.data ?? ""
                ).includes(texto)
        );


    mostrarVendasVendedores(
        filtradas
    );

};


// =====================================================
// MODAL VENDEDORES
// =====================================================

window.abrirModalVendedores = function(){

    const modal =
        document.getElementById(
            "modal-vendedores"
        );


    if(modal){

        modal.style.display =
            "flex";


        carregarDetalhesVendedores();

    }

};


window.fecharModalVendedores = function(){

    const modal =
        document.getElementById(
            "modal-vendedores"
        );


    if(modal){

        modal.style.display =
            "none";

    }

};

window.atualizarVisibilidadeStock = function(){

    const menuStock =
        document.getElementById(
            "menu-stock"
        );

    if(!menuStock){

        console.error(
            "ERRO: #menu-stock não encontrado"
        );

        return;
    }

    const usuario =
        obterUsuarioDashboard();


    // =====================================
    // NENHUM USUÁRIO LOGADO
    // =====================================

    if(!usuario){

        menuStock.style.display =
            "none";

        return;
    }


    // =====================================
    // QUALQUER USUÁRIO LOGADO
    // =====================================

    menuStock.style.display =
        "block";


    console.log(
        "MENU STOCK VISÍVEL PARA:",
        usuario.nome,
        "| TIPO:",
        usuario.tipo
    );

};

function atualizarVisibilidadeDinheiroRecolhido(){

    const usuario =
        obterUsuarioDashboard();

    const card =
        document.getElementById(
            "card-dinheiro-recolhido"
        );

    if(!card){

        console.error(
            "Card #card-dinheiro-recolhido não encontrado."
        );

        return;
    }


    if(!usuario){

        card.style.display = "none";

        return;
    }


    // =====================================
    // VENDEDOR NÃO VÊ
    // =====================================

    if(usuario.tipo === "vendedor"){

        card.style.display = "none";

        return;
    }


    // =====================================
    // ADMIN / GERENTE VÊ
    // =====================================

    if(
        usuario.tipo === "admin" ||
        usuario.tipo === "gerente"
    ){

        card.style.display = "flex";

        return;
    }


    // =====================================
    // TIPO DESCONHECIDO
    // =====================================

    card.style.display = "none";

}
function atualizarVisibilidadeDetalhesDinheiroRecolhido(){

    const usuario =
        obterUsuarioDashboard();

    const link =
        document.getElementById(
            "ver-detalhes-dinheiro-recolhido"
        );

    if(!link){
        return;
    }


    // =====================================
    // SOMENTE ADMIN
    // =====================================

    if(
        usuario &&
        usuario.tipo === "admin"
    ){

        link.style.display = "inline-block";

    }
    else{

        link.style.display = "none";

    }

}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log(
            "====================================="
        );

        console.log(
            " DASHBOARD PRONTO"
        );

        console.log(
            "====================================="
        );


        setTimeout(
            async function(){

                const usuario =
                    obterUsuarioDashboard();


                console.log(
                    "USUÁRIO NO DASHBOARD:",
                    usuario
                );


                if(!usuario){

                    console.log(
                        "Nenhum usuário logado."
                    );

                    return;

                }


                // =====================================
                // DETALHES DAS VENDAS
                // =====================================

                if(
                    typeof atualizarVisibilidadeDetalhesVendas ===
                    "function"
                ){

                    atualizarVisibilidadeDetalhesVendas();

                }


                // =====================================
                // VISIBILIDADE DO STOCK
                // =====================================

                if(
                    typeof atualizarVisibilidadeStock ===
                    "function"
                ){

                    atualizarVisibilidadeStock();

                }


                // =====================================
                // VISIBILIDADE DINHEIRO RECOLHIDO
                // =====================================

                if(
                    typeof atualizarVisibilidadeDinheiroRecolhido ===
                    "function"
                ){

                    atualizarVisibilidadeDinheiroRecolhido();

                }
                if(
                    typeof atualizarVisibilidadeDetalhesDinheiroRecolhido ===
                    "function"
                ){

                    atualizarVisibilidadeDetalhesDinheiroRecolhido();

                }

                // =====================================
                // SALDO DA CAIXA
                // =====================================

                if(
                    typeof atualizarSaldoCaixaDashboard ===
                    "function"
                ){

                    await atualizarSaldoCaixaDashboard();

                }


                // =====================================
                // DINHEIRO RECOLHIDO
                // =====================================

                if(
                    typeof atualizarDinheiroRecolhido ===
                    "function"
                ){

                    // Só executa para Admin/Gerente
                    if(
                        usuario.tipo === "admin" ||
                        usuario.tipo === "gerente"
                    ){

                        await atualizarDinheiroRecolhido();

                    }

                }


                // =====================================
                // DASHBOARD
                // =====================================

                await carregarDashboard();


            },
            500
        );

    }
);

// =====================================================
// ATUALIZAR SALDO DA CAIXA QUANDO SOLICITADO
// =====================================================

window.atualizarSaldoCaixaAgora = async function(){

    console.log("🔄 Atualizando saldo da caixa...");

    if(
        typeof window.atualizarSaldoCaixaDashboard !==
        "function"
    ){

        console.warn(
            "⚠️ atualizarSaldoCaixaDashboard ainda não está disponível."
        );

        return;
    }

    try{

        await window.atualizarSaldoCaixaDashboard();

        console.log(
            "✅ Saldo da caixa atualizado."
        );

    }
    catch(error){

        console.error(
            "❌ Erro ao atualizar saldo da caixa:",
            error
        );

    }

};
