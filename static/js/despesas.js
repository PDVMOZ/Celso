// =====================================================
// ÁREA DE DESPESAS
// =====================================================


// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let despesasAtuais = [];

let modoTabelaDespesas = false;


// =====================================================
// OBTER USUÁRIO LOGADO
// =====================================================

function obterUsuarioLogado(){

    try{

        const usuario =
            JSON.parse(
                localStorage.getItem("usuario")
            );

        return usuario || null;

    }
    catch(error){

        console.error(
            "Erro ao ler usuário:",
            error
        );

        return null;

    }

}


// =====================================================
// NORMALIZAR TIPO DO USUÁRIO
// =====================================================

function obterTipoUsuario(){

    const usuario =
        obterUsuarioLogado();


    if(!usuario){

        return "";

    }


    return String(
        usuario.tipo || ""
    )
    .trim()
    .toLowerCase();

}


// =====================================================
// VERIFICAR ADMIN
// =====================================================

function usuarioEhAdmin(){

    const tipo =
        obterTipoUsuario();


    return (
        tipo === "admin" ||
        tipo === "administrador"
    );

}


// =====================================================
// VERIFICAR GERENTE
// =====================================================

function usuarioEhGerente(){

    return (
        obterTipoUsuario() === "gerente"
    );

}


// =====================================================
// VERIFICAR VENDEDOR
// =====================================================

function usuarioEhVendedor(){

    return (
        obterTipoUsuario() === "vendedor"
    );

}


// =====================================================
// ABRIR DESPESAS
// =====================================================

window.abrirDespesas = function(){

    const modal =
        document.getElementById(
            "modal-despesas"
        );


    if(!modal){

        console.error(
            "Modal de despesas não encontrado."
        );

        return;

    }


    modal.style.display = "flex";


    configurarPermissaoDespesas();

};


// =====================================================
// FECHAR DESPESAS
// =====================================================

window.fecharDespesas = function(){

    const modal =
        document.getElementById(
            "modal-despesas"
        );


    if(modal){

        modal.style.display = "none";

    }

};


// =====================================================
// CONFIGURAR PERMISSÕES
// =====================================================

async function configurarPermissaoDespesas(){

    const usuario =
        obterUsuarioLogado();


    if(!usuario){

        console.error(
            "Usuário não encontrado."
        );

        mostrarErroLista(
            "Usuário não encontrado."
        );

        return;

    }


    const tipoUsuario =
        obterTipoUsuario();


    const formulario =
        document.getElementById(
            "formulario-despesa"
        );


    const botao =
        document.getElementById(
            "btn-nova-despesa"
        );


    // =================================================
    // ESCONDER FORMULÁRIO
    // =================================================

    if(formulario){

        formulario.style.display =
            "none";

    }


    // =================================================
    // ADMIN
    // =================================================

    if(
        tipoUsuario === "admin" ||
        tipoUsuario === "administrador"
    ){

        if(botao){

            botao.style.display =
                "inline-block";

            botao.disabled =
                false;

            botao.innerHTML = `
                <i class="bi bi-plus-circle"></i>
                Nova despesa
            `;

        }


        /*
         * ATENÇÃO:
         *
         * O backend NÃO possui:
         *
         * GET /despesas/
         *
         * nem:
         *
         * GET /despesas/admin
         *
         *
         * A única rota GET disponível
         * para consultar despesas sem
         * informar usuário é:
         *
         * GET /despesas/pendentes
         */

        await carregarDespesasPendentes();

        return;

    }


    // =================================================
    // GERENTE
    // =================================================

    if(
        tipoUsuario === "gerente"
    ){

        if(botao){

            botao.style.display =
                "none";

            botao.disabled =
                true;

        }


        await carregarDespesasPendentes();

        return;

    }


    // =================================================
    // VENDEDOR
    // =================================================

    if(
        tipoUsuario === "vendedor"
    ){

        if(botao){

            botao.style.display =
                "inline-block";

            botao.disabled =
                false;

            botao.innerHTML = `
                <i class="bi bi-send"></i>
                Solicitar despesa
            `;

        }


        await carregarMinhasDespesas();

        return;

    }


    // =================================================
    // TIPO DESCONHECIDO
    // =================================================

    if(botao){

        botao.style.display =
            "none";

    }


    mostrarErroLista(
        "Tipo de usuário sem permissão para despesas."
    );

}


// =====================================================
// ABRIR FORMULÁRIO
// =====================================================

window.abrirFormularioDespesa = function(){

    const usuario =
        obterUsuarioLogado();


    if(!usuario){

        alert(
            "Usuário não encontrado."
        );

        return;

    }


    const tipoUsuario =
        obterTipoUsuario();


    // =================================================
    // GERENTE
    // =================================================

    if(
        tipoUsuario === "gerente"
    ){

        alert(
            "O gerente não pode criar despesas."
        );

        return;

    }


    // =================================================
    // PERMISSÃO
    // =================================================

    if(
        tipoUsuario !== "admin" &&
        tipoUsuario !== "administrador" &&
        tipoUsuario !== "vendedor"
    ){

        alert(
            "Você não tem permissão para criar despesas."
        );

        return;

    }


    const formulario =
        document.getElementById(
            "formulario-despesa"
        );


    if(!formulario){

        console.error(
            "Formulário de despesa não encontrado."
        );

        return;

    }


    formulario.style.display =
        "block";


    formulario.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

};


// =====================================================
// LIMPAR FORMULÁRIO
// =====================================================

function limparFormularioDespesa(){

    const descricao =
        document.getElementById(
            "despesa-descricao"
        );


    const categoria =
        document.getElementById(
            "despesa-categoria"
        );


    const valor =
        document.getElementById(
            "despesa-valor"
        );


    const observacao =
        document.getElementById(
            "despesa-observacao"
        );


    if(descricao)
        descricao.value = "";


    if(categoria)
        categoria.value = "";


    if(valor)
        valor.value = "";


    if(observacao)
        observacao.value = "";

}


// =====================================================
// SALVAR DESPESA
// =====================================================

window.salvarDespesa = async function(){

    const usuario =
        obterUsuarioLogado();


    if(!usuario){

        alert(
            "Usuário não encontrado."
        );

        return;

    }


    const tipoUsuario =
        obterTipoUsuario();


    // =================================================
    // PERMISSÃO
    // =================================================

    if(
        tipoUsuario === "gerente"
    ){

        alert(
            "O gerente não pode criar despesas."
        );

        return;

    }


    if(
        tipoUsuario !== "admin" &&
        tipoUsuario !== "administrador" &&
        tipoUsuario !== "vendedor"
    ){

        alert(
            "Você não tem permissão para criar despesas."
        );

        return;

    }


    // =================================================
    // CAMPOS
    // =================================================

    const campoDescricao =
        document.getElementById(
            "despesa-descricao"
        );


    const campoCategoria =
        document.getElementById(
            "despesa-categoria"
        );


    const campoValor =
        document.getElementById(
            "despesa-valor"
        );


    const campoObservacao =
        document.getElementById(
            "despesa-observacao"
        );


    if(
        !campoDescricao ||
        !campoCategoria ||
        !campoValor ||
        !campoObservacao
    ){

        alert(
            "Formulário de despesa incompleto."
        );

        return;

    }


    // =================================================
    // VALORES
    // =================================================

    const descricao =
        campoDescricao.value.trim();


    const categoria =
        campoCategoria.value.trim();


    const valor =
        Number(
            campoValor.value
        );


    const observacao =
        campoObservacao.value.trim();


    // =================================================
    // VALIDAÇÃO
    // =================================================

    if(!descricao){

        alert(
            "Informe a descrição da despesa."
        );

        campoDescricao.focus();

        return;

    }


    if(!categoria){

        alert(
            "Informe a categoria da despesa."
        );

        campoCategoria.focus();

        return;

    }


    if(
        !Number.isFinite(valor) ||
        valor <= 0
    ){

        alert(
            "Informe um valor válido."
        );

        campoValor.focus();

        return;

    }


    // =================================================
    // DADOS
    // =================================================

    const dados = {

        usuario_id:
            usuario.id,

        descricao:
            descricao,

        categoria:
            categoria,

        valor_proposto:
            valor,

        observacao:
            observacao

    };


    // =================================================
    // ENDPOINT
    // =================================================

    let endpoint;


    /*
     * ADMIN:
     *
     * POST /despesas/
     *
     *
     * VENDEDOR:
     *
     * POST /despesas/solicitar
     */

    if(
        tipoUsuario === "admin" ||
        tipoUsuario === "administrador"
    ){

        endpoint =
            API +
            "/despesas/";

    }
    else{

        endpoint =
            API +
            "/despesas/solicitar";

    }


    try{

        const resposta =
            await fetch(

                endpoint,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            dados
                        )

                }

            );


        const resultado =
            await lerRespostaJson(
                resposta
            );


        if(!resposta.ok){

            console.error(
                "Erro ao criar despesa:",
                resultado
            );


            alert(
                obterMensagemErro(
                    resultado,
                    "Erro ao criar despesa."
                )
            );

            return;

        }


        // =================================================
        // LIMPAR
        // =================================================

        limparFormularioDespesa();


        const formulario =
            document.getElementById(
                "formulario-despesa"
            );


        if(formulario){

            formulario.style.display =
                "none";

        }


        // =================================================
        // ATUALIZAR LISTA
        // =================================================

        if(
            tipoUsuario === "admin" ||
            tipoUsuario === "administrador"
        ){

            await carregarDespesasPendentes();

            alert(
                "Despesa criada com sucesso."
            );

        }
        else{

            await carregarMinhasDespesas();

            alert(
                "Solicitação de despesa enviada com sucesso."
            );

        }

    }
    catch(error){

        console.error(
            "Erro ao salvar despesa:",
            error
        );


        alert(
            "Erro de comunicação com o servidor."
        );

    }

};


// =====================================================
// LER JSON COM SEGURANÇA
// =====================================================

async function lerRespostaJson(resposta){

    try{

        return await resposta.json();

    }
    catch(error){

        return {};

    }

}


// =====================================================
// OBTER MENSAGEM DE ERRO
// =====================================================

function obterMensagemErro(
    dados,
    mensagemPadrao
){

    if(!dados){

        return mensagemPadrao;

    }


    if(
        typeof dados === "string"
    ){

        return dados;

    }


    if(
        dados.detail
    ){

        if(
            typeof dados.detail === "string"
        ){

            return dados.detail;

        }


        if(
            Array.isArray(
                dados.detail
            )
        ){

            return dados.detail
                .map(
                    erro =>
                        erro.msg ||
                        "Erro de validação."
                )
                .join("\n");

        }

    }


    return mensagemPadrao;

}


// =====================================================
// CARREGAR MINHAS DESPESAS
// VENDEDOR
// =====================================================

async function carregarMinhasDespesas(){

    const usuario =
        obterUsuarioLogado();


    if(!usuario)
        return;


    try{

        const resposta =
            await fetch(

                API +
                "/despesas/usuario/" +
                encodeURIComponent(
                    usuario.id
                )

            );


        const dados =
            await lerRespostaJson(
                resposta
            );


        if(!resposta.ok){

            console.error(
                "Erro ao carregar minhas despesas:",
                dados
            );


            mostrarErroLista(
                obterMensagemErro(
                    dados,
                    "Erro ao carregar despesas."
                )
            );

            return;

        }


        despesasAtuais =
            Array.isArray(dados)
                ? dados
                : [];


        modoTabelaDespesas =
            false;


        mostrarTabelaDespesas(
            despesasAtuais,
            false
        );


        configurarFiltroDespesas();

    }
    catch(error){

        console.error(
            "Erro ao carregar minhas despesas:",
            error
        );


        mostrarErroLista(
            "Erro de comunicação com o servidor."
        );

    }

}


// =====================================================
// CARREGAR DESPESAS PENDENTES
//
// ESTA É A ROTA CORRETA DO BACKEND:
//
// GET /despesas/pendentes
// =====================================================

// =====================================================
// CARREGAR DESPESAS PENDENTES
// GERENTE
// =====================================================

async function carregarDespesasPendentes(){

    const usuario = obterUsuarioLogado();

    if(!usuario){

        console.error(
            "Usuário não encontrado."
        );

        mostrarErroLista(
            "Usuário não encontrado."
        );

        return;
    }


    if(!usuario.id){

        console.error(
            "ID do usuário não encontrado:",
            usuario
        );

        mostrarErroLista(
            "ID do usuário não encontrado."
        );

        return;
    }


    try{

        // =================================================
        // O BACKEND EXIGE usuario_id
        // =================================================

        const url =
            API +
            "/despesas/pendentes?usuario_id=" +
            encodeURIComponent(
                usuario.id
            );


        console.log(
            "Carregando despesas pendentes:",
            url
        );


        const resposta =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        // =================================================
        // LER RESPOSTA
        // =================================================

        let dados = null;

        try{

            dados =
                await resposta.json();

        }
        catch(error){

            console.error(
                "Resposta não é JSON:",
                error
            );

        }


        // =================================================
        // ERRO HTTP
        // =================================================

        if(!resposta.ok){

            console.error(
                "Erro ao carregar despesas pendentes:",
                {
                    status: resposta.status,
                    statusText: resposta.statusText,
                    dados: dados
                }
            );


            let mensagem =
                "Erro ao carregar despesas pendentes.";


            if(
                dados &&
                dados.detail
            ){

                if(
                    Array.isArray(
                        dados.detail
                    )
                ){

                    mensagem =
                        dados.detail
                            .map(function(item){

                                if(
                                    item &&
                                    item.msg
                                ){

                                    return item.msg;

                                }

                                return String(item);

                            })
                            .join(", ");

                }
                else{

                    mensagem =
                        String(
                            dados.detail
                        );

                }

            }


            mostrarErroLista(
                mensagem
            );

            return;

        }


        // =================================================
        // NORMALIZAR DADOS
        // =================================================

        despesasAtuais =
            Array.isArray(dados)
                ? dados
                : [];


        modoTabelaDespesas =
            true;


        // =================================================
        // MOSTRAR TABELA
        // =================================================

        mostrarTabelaDespesas(
            despesasAtuais,
            true
        );


        // =================================================
        // CONFIGURAR FILTRO
        // =================================================

        configurarFiltroDespesas();


    }
    catch(error){

        console.error(
            "Erro de comunicação ao carregar despesas pendentes:",
            error
        );


        mostrarErroLista(
            "Erro de comunicação com o servidor."
        );

    }

}

async function carregarTodasDespesasAdmin(){

    await carregarDespesasPendentes();

}


// =====================================================
// COMPATIBILIDADE GERENTE
// =====================================================

async function carregarSolicitacoesDespesas(){

    await carregarDespesasPendentes();

}


// =====================================================
// MOSTRAR ERRO
// =====================================================

function mostrarErroLista(mensagem){

    const lista =
        document.getElementById(
            "lista-despesas"
        );


    if(!lista)
        return;


    lista.innerHTML = `

        <div class="alert alert-danger">

            ${escaparHtml(
                mensagem
            )}

        </div>

    `;

}


// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizarTexto(valor){

    if(
        valor === null ||
        valor === undefined
    ){

        return "";

    }


    return String(valor)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();

}


// =====================================================
// NORMALIZAR VALOR
// =====================================================

function normalizarValor(valor){

    if(
        valor === null ||
        valor === undefined ||
        valor === ""
    ){

        return "";

    }


    const numero =
        Number(valor);


    if(
        Number.isNaN(numero)
    ){

        return normalizarTexto(
            valor
        );

    }


    return numero
        .toFixed(2)
        .replace(
            ".",
            ","
        );

}


// =====================================================
// FORMATAR VALOR
// =====================================================

function formatarValor(valor){

    const numero =
        Number(valor || 0);


    if(
        Number.isNaN(numero)
    ){

        return "0,00 MT";

    }


    return numero
        .toFixed(2)
        .replace(
            ".",
            ","
        ) +
        " MT";

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarData(data){

    if(!data){

        return "-";

    }


    try{

        const objetoData =
            new Date(data);


        if(
            Number.isNaN(
                objetoData.getTime()
            )
        ){

            return "-";

        }


        return objetoData.toLocaleDateString(
            "pt-PT"
        );

    }
    catch(error){

        return "-";

    }

}


// =====================================================
// DATA PARA FILTRO
// =====================================================

function obterDataDespesa(d){

    if(
        !d ||
        !d.data_despesa
    ){

        return "";

    }


    const data =
        String(
            d.data_despesa
        );


    const dataISO =
        data.substring(
            0,
            10
        );


    return (
        dataISO +
        " " +
        formatarData(
            d.data_despesa
        )
    );

}


// =====================================================
// CONFIGURAR FILTRO
// =====================================================

function configurarFiltroDespesas(){

    const campoTexto =
        document.getElementById(
            "filtro-despesas"
        );


    if(!campoTexto)
        return;


    campoTexto.removeEventListener(
        "input",
        executarFiltroDespesas
    );


    campoTexto.addEventListener(
        "input",
        executarFiltroDespesas
    );


    const botaoLimpar =
        document.getElementById(
            "limpar-filtro-despesas"
        );


    if(botaoLimpar){

        botaoLimpar.onclick =
            limparFiltroDespesas;

    }

}


// =====================================================
// EXECUTAR FILTRO
// =====================================================

function executarFiltroDespesas(){

    const campoTexto =
        document.getElementById(
            "filtro-despesas"
        );


    const texto =
        campoTexto
            ? normalizarTexto(
                campoTexto.value
            )
            : "";


    if(!texto){

        mostrarTabelaDespesas(
            despesasAtuais,
            modoTabelaDespesas
        );

        return;

    }


    const dadosFiltrados =
        despesasAtuais.filter(
            function(d){

                const nome =
                    normalizarTexto(
                        d.solicitante_nome ||
                        d.usuario_nome ||
                        d.nome ||
                        ""
                    );


                const descricao =
                    normalizarTexto(
                        d.descricao
                    );


                const categoria =
                    normalizarTexto(
                        d.categoria
                    );


                const estado =
                    normalizarTexto(
                        d.estado
                    );


                const observacao =
                    normalizarTexto(
                        d.observacao
                    );


                const data =
                    normalizarTexto(
                        obterDataDespesa(d)
                    );


                const valorPropostoNumero =
                    Number(
                        d.valor_proposto || 0
                    );


                const valorAprovadoNumero =
                    d.valor_aprovado !== null &&
                    d.valor_aprovado !== undefined
                        ? Number(
                            d.valor_aprovado
                        )
                        : 0;


                const valorProposto =
                    normalizarValor(
                        d.valor_proposto
                    );


                const valorAprovado =
                    normalizarValor(
                        d.valor_aprovado
                    );


                const valorPropostoPonto =
                    String(
                        valorPropostoNumero
                    );


                const valorAprovadoPonto =
                    String(
                        valorAprovadoNumero
                    );


                return (

                    nome.includes(texto) ||

                    descricao.includes(texto) ||

                    categoria.includes(texto) ||

                    estado.includes(texto) ||

                    observacao.includes(texto) ||

                    data.includes(texto) ||

                    valorProposto.includes(texto) ||

                    valorAprovado.includes(texto) ||

                    valorPropostoPonto.includes(texto) ||

                    valorAprovadoPonto.includes(texto)

                );

            }
        );


    mostrarTabelaDespesas(
        dadosFiltrados,
        modoTabelaDespesas
    );

}


// =====================================================
// LIMPAR FILTRO
// =====================================================

window.limparFiltroDespesas = function(){

    const campoTexto =
        document.getElementById(
            "filtro-despesas"
        );


    if(campoTexto){

        campoTexto.value = "";

    }


    mostrarTabelaDespesas(
        despesasAtuais,
        modoTabelaDespesas
    );

};


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(valor){

    if(
        valor === null ||
        valor === undefined
    ){

        return "-";

    }


    return String(valor)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// MOSTRAR TABELA
// =====================================================

function mostrarTabelaDespesas(
    dados,
    adminOuGerente
){

    const lista =
        document.getElementById(
            "lista-despesas"
        );


    if(!lista){

        console.error(
            "Elemento lista-despesas não encontrado."
        );

        return;

    }


    if(!Array.isArray(dados)){

        mostrarErroLista(
            "Dados de despesas inválidos."
        );

        return;

    }


    let html = `

        <div class="table-responsive">

            <table class="table table-bordered table-hover">

                <thead>

                    <tr>

                        <th>Nome</th>

                        <th>Descrição</th>

                        <th>Categoria</th>

                        <th>Valor Proposto</th>

                        <th>Valor Aprovado</th>

                        <th>Estado</th>

                        <th>Data</th>

                        <th>Ação</th>

                    </tr>

                </thead>

                <tbody>

    `;


    if(dados.length === 0){

        html += `

            <tr>

                <td
                    colspan="8"
                    class="text-center text-muted"
                >

                    Nenhuma despesa encontrada.

                </td>

            </tr>

        `;

    }


    dados.forEach(
        function(d){

            const estado =
                normalizarTexto(
                    d.estado
                );


            const nomeSolicitante =
                d.solicitante_nome ||
                d.usuario_nome ||
                d.nome ||
                "Não informado";


            const descricao =
                d.descricao ||
                "";


            const categoria =
                d.categoria ||
                "";


            const valorProposto =
                d.valor_proposto;


            const valorAprovado =
                d.valor_aprovado;


            html += `

                <tr data-id="${Number(d.id)}">

                    <td class="nome-solicitante">

                        ${escaparHtml(
                            nomeSolicitante
                        )}

                    </td>


                    <td class="descricao">

                        ${escaparHtml(
                            descricao
                        )}

                    </td>


                    <td class="categoria">

                        ${escaparHtml(
                            categoria
                        )}

                    </td>


                    <td class="valor">

                        ${formatarValor(
                            valorProposto
                        )}

                    </td>


                    <td class="valor-aprovado">

                        ${
                            valorAprovado !== null &&
                            valorAprovado !== undefined

                            ?

                            formatarValor(
                                valorAprovado
                            )

                            :

                            "-"
                        }

                    </td>


                    <td class="estado">

                        ${escaparHtml(
                            d.estado ||
                            "-"
                        )}

                    </td>


                    <td>

                        ${formatarData(
                            d.data_despesa
                        )}

                    </td>


                    <td>
            `;


            // =================================================
            // ADMIN / GERENTE
            // =================================================

            if(
                adminOuGerente
            ){

                if(
                    estado === "pendente"
                ){

                    html += `

                        <button
                            type="button"
                            class="btn btn-success btn-sm"
                            onclick="aprovarDespesa(${Number(d.id)})"
                        >

                            <i class="bi bi-check-circle"></i>

                            Aprovar

                        </button>

                    `;

                }
                else if(
                    estado === "aprovado"
                ){

                    html += `

                        <span class="text-success">

                            <i class="bi bi-check-circle"></i>

                            Aprovada

                        </span>

                    `;

                }
                else{

                    html += `

                        <span class="text-muted">

                            ${escaparHtml(
                                d.estado || "-"
                            )}

                        </span>

                    `;

                }

            }


            // =================================================
            // VENDEDOR
            // =================================================

            else{

                if(
                    estado === "pendente"
                ){

                    html += `

                        <button
                            type="button"
                            class="btn btn-warning btn-sm me-1"
                            onclick="editarDespesa(${Number(d.id)})"
                        >

                            <i class="bi bi-pencil"></i>

                            Editar

                        </button>


                        <button
                            type="button"
                            class="btn btn-danger btn-sm"
                            onclick="apagarDespesa(${Number(d.id)})"
                        >

                            <i class="bi bi-trash"></i>

                            Apagar

                        </button>

                    `;

                }
                else{

                    html += `

                        <span class="text-muted">

                            Bloqueada

                        </span>

                    `;

                }

            }


            html += `

                    </td>

                </tr>

            `;

        }
    );


    html += `

                </tbody>

            </table>

        </div>

    `;


    lista.innerHTML =
        html;

}


// =====================================================
// EDITAR DESPESA
// SOMENTE VENDEDOR
// =====================================================

window.editarDespesa = function(id){

    if(!usuarioEhVendedor()){

        alert(
            "Somente o vendedor pode editar a sua solicitação."
        );

        return;

    }


    const linha =
        document.querySelector(
            `tr[data-id="${id}"]`
        );


    if(!linha)
        return;


    const estado =
        normalizarTexto(
            linha
                .querySelector(".estado")
                ?.innerText
        );


    if(
        estado !== "pendente"
    ){

        alert(
            "Esta despesa já foi aprovada e não pode ser alterada."
        );

        return;

    }


    const nome =
        linha
            .querySelector(".nome-solicitante")
            ?.innerText
            .trim() ||
        "";


    const descricao =
        linha
            .querySelector(".descricao")
            ?.innerText
            .trim() ||
        "";


    const categoria =
        linha
            .querySelector(".categoria")
            ?.innerText
            .trim() ||
        "";


    const valorTexto =
        linha
            .querySelector(".valor")
            ?.innerText
            .replace(
                "MT",
                ""
            )
            .trim() ||
        "0";


    const valor =
        Number(
            valorTexto
                .replace(/\./g, "")
                .replace(",", ".")
        );


    linha.innerHTML = `

        <td class="nome-solicitante">

            ${escaparHtml(nome)}

        </td>


        <td>

            <input
                type="text"
                class="form-control"
                id="edit-desc-${id}"
                value="${escaparHtml(descricao)}"
            >

        </td>


        <td>

            <input
                type="text"
                class="form-control"
                id="edit-cat-${id}"
                value="${escaparHtml(categoria)}"
            >

        </td>


        <td>

            <input
                type="number"
                min="0.01"
                step="0.01"
                class="form-control"
                id="edit-val-${id}"
                value="${
                    Number.isFinite(valor)
                        ? valor
                        : ""
                }"
            >

        </td>


        <td>
            -
        </td>


        <td class="estado">
            pendente
        </td>


        <td>
            -
        </td>


        <td>

            <button
                type="button"
                class="btn btn-success btn-sm me-1"
                onclick="salvarEdicaoDespesa(${id})"
            >

                <i class="bi bi-check"></i>

                Guardar

            </button>


            <button
                type="button"
                class="btn btn-secondary btn-sm"
                onclick="carregarMinhasDespesas()"
            >

                <i class="bi bi-x-circle"></i>

                Cancelar

            </button>

        </td>

    `;

};


// =====================================================
// GUARDAR EDIÇÃO
// PUT /despesas/{id}
// =====================================================

window.salvarEdicaoDespesa = async function(id){

    const usuario =
        obterUsuarioLogado();


    if(!usuario)
        return;


    if(!usuarioEhVendedor()){

        alert(
            "Somente o vendedor pode editar despesas."
        );

        return;

    }


    const campoDescricao =
        document.getElementById(
            "edit-desc-" + id
        );


    const campoCategoria =
        document.getElementById(
            "edit-cat-" + id
        );


    const campoValor =
        document.getElementById(
            "edit-val-" + id
        );


    if(
        !campoDescricao ||
        !campoCategoria ||
        !campoValor
    ){

        alert(
            "Campos de edição não encontrados."
        );

        return;

    }


    const descricao =
        campoDescricao.value.trim();


    const categoria =
        campoCategoria.value.trim();


    const valor =
        Number(
            campoValor.value
        );


    if(!descricao){

        alert(
            "Informe a descrição."
        );

        return;

    }


    if(!categoria){

        alert(
            "Informe a categoria."
        );

        return;

    }


    if(
        !Number.isFinite(valor) ||
        valor <= 0
    ){

        alert(
            "Informe um valor válido."
        );

        return;

    }


    const dados = {

        descricao:
            descricao,

        categoria:
            categoria,

        valor_proposto:
            valor

    };


    try{

        const resposta =
            await fetch(

                API +
                "/despesas/" +
                id +
                "?usuario_id=" +
                encodeURIComponent(
                    usuario.id
                ),

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            dados
                        )

                }

            );


        const resultado =
            await lerRespostaJson(
                resposta
            );


        if(!resposta.ok){

            console.error(
                "Erro ao editar despesa:",
                resultado
            );


            alert(
                obterMensagemErro(
                    resultado,
                    "Erro ao editar despesa."
                )
            );

            return;

        }


        alert(
            "Despesa atualizada com sucesso."
        );


        await carregarMinhasDespesas();

    }
    catch(error){

        console.error(
            "Erro ao editar despesa:",
            error
        );


        alert(
            "Erro de comunicação com o servidor."
        );

    }

};


// =====================================================
// ABRIR APROVAÇÃO
// ADMIN / GERENTE
// =====================================================

window.aprovarDespesa = function(id){

    if(
        !usuarioEhAdmin() &&
        !usuarioEhGerente()
    ){

        alert(
            "Você não tem permissão para aprovar despesas."
        );

        return;

    }


    const linha =
        document.querySelector(
            `tr[data-id="${id}"]`
        );


    if(!linha)
        return;


    const campoValor =
        linha.querySelector(
            ".valor"
        );


    const colunaValorAprovado =
        linha.querySelector(
            ".valor-aprovado"
        );


    const colunaAcao =
        linha.querySelector(
            "td:last-child"
        );


    if(
        !campoValor ||
        !colunaValorAprovado ||
        !colunaAcao
    ){

        console.error(
            "Elementos da aprovação não encontrados."
        );

        return;

    }


    if(
        document.getElementById(
            "valor-aprovado-" + id
        )
    ){

        return;

    }


    const valorProposto =
        campoValor.innerText
            .replace(
                "MT",
                ""
            )
            .trim();


    const valorNumero =
        Number(
            valorProposto
                .replace(/\./g, "")
                .replace(",", ".")
        );


    colunaValorAprovado.dataset.original =
        colunaValorAprovado.innerHTML;


    colunaAcao.dataset.original =
        colunaAcao.innerHTML;


    colunaValorAprovado.innerHTML = `

        <input
            type="number"
            min="0.01"
            step="0.01"
            class="form-control"
            id="valor-aprovado-${id}"
            value="${
                Number.isFinite(valorNumero)
                    ? valorNumero
                    : ""
            }"
        >

    `;


    colunaAcao.innerHTML = `

        <button
            type="button"
            class="btn btn-success btn-sm me-1"
            onclick="guardarAprovacaoDespesa(${id})"
        >

            <i class="bi bi-check"></i>

            Guardar

        </button>


        <button
            type="button"
            class="btn btn-secondary btn-sm"
            onclick="cancelarAprovacaoDespesa(${id})"
        >

            <i class="bi bi-x-circle"></i>

            Cancelar

        </button>

    `;


    const campo =
        document.getElementById(
            "valor-aprovado-" + id
        );


    if(campo){

        campo.focus();

        campo.select();

    }

};


// =====================================================
// CANCELAR APROVAÇÃO
// =====================================================

window.cancelarAprovacaoDespesa = function(id){

    const linha =
        document.querySelector(
            `tr[data-id="${id}"]`
        );


    if(!linha)
        return;


    const colunaValorAprovado =
        linha.querySelector(
            ".valor-aprovado"
        );


    const colunaAcao =
        linha.querySelector(
            "td:last-child"
        );


    if(
        !colunaValorAprovado ||
        !colunaAcao
    ){

        return;

    }


    if(
        colunaValorAprovado.dataset.original
        !== undefined
    ){

        colunaValorAprovado.innerHTML =
            colunaValorAprovado.dataset.original;

    }
    else{

        colunaValorAprovado.innerHTML =
            "-";

    }


    if(
        colunaAcao.dataset.original
        !== undefined
    ){

        colunaAcao.innerHTML =
            colunaAcao.dataset.original;

    }
    else{

        colunaAcao.innerHTML = `

            <button
                type="button"
                class="btn btn-success btn-sm"
                onclick="aprovarDespesa(${id})"
            >

                <i class="bi bi-check-circle"></i>

                Aprovar

            </button>

        `;

    }


    delete colunaValorAprovado.dataset.original;

    delete colunaAcao.dataset.original;

};


// =====================================================
// GUARDAR APROVAÇÃO
// PUT /despesas/{id}/aprovar
// =====================================================

window.guardarAprovacaoDespesa = async function(id){

    const usuario =
        obterUsuarioLogado();


    if(!usuario)
        return;


    if(
        !usuarioEhAdmin() &&
        !usuarioEhGerente()
    ){

        alert(
            "Você não tem permissão para aprovar despesas."
        );

        return;

    }


    const campo =
        document.getElementById(
            "valor-aprovado-" + id
        );


    if(!campo){

        alert(
            "Campo de valor aprovado não encontrado."
        );

        return;

    }


    const valor =
        Number(
            campo.value
        );


    if(
        !Number.isFinite(valor) ||
        valor <= 0
    ){

        alert(
            "Informe um valor aprovado válido."
        );

        campo.focus();

        return;

    }


    try{

        const resposta =
            await fetch(

                API +
                "/despesas/" +
                id +
                "/aprovar?usuario_id=" +
                encodeURIComponent(
                    usuario.id
                ),

                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            valor_aprovado:
                                valor

                        })

                }

            );


        const dados =
            await lerRespostaJson(
                resposta
            );


        if(!resposta.ok){

            console.error(
                "Erro ao aprovar:",
                dados
            );


            alert(
                obterMensagemErro(
                    dados,
                    "Erro ao aprovar despesa."
                )
            );

            return;

        }


        alert(
            "Despesa aprovada com sucesso."
        );


        /*
         * Depois da aprovação, recarregamos
         * as pendentes.
         */

        await carregarDespesasPendentes();

    }
    catch(error){

        console.error(
            "Erro ao aprovar despesa:",
            error
        );


        alert(
            "Erro de comunicação com o servidor."
        );

    }

};


// =====================================================
// APAGAR DESPESA
// DELETE /despesas/{id}
// =====================================================

window.apagarDespesa = async function(id){

    const usuario =
        obterUsuarioLogado();


    if(!usuario)
        return;


    if(!usuarioEhVendedor()){

        alert(
            "Somente o vendedor pode apagar a sua solicitação."
        );

        return;

    }


    const confirmar =
        confirm(
            "Deseja apagar esta solicitação de despesa?"
        );


    if(!confirmar)
        return;


    try{

        const resposta =
            await fetch(

                API +
                "/despesas/" +
                id +
                "?usuario_id=" +
                encodeURIComponent(
                    usuario.id
                ),

                {

                    method: "DELETE"

                }

            );


        const dados =
            await lerRespostaJson(
                resposta
            );


        if(!resposta.ok){

            console.error(
                "Erro ao apagar:",
                dados
            );


            alert(
                obterMensagemErro(
                    dados,
                    "Não foi possível apagar a despesa."
                )
            );

            return;

        }


        alert(
            "Despesa removida com sucesso."
        );


        await carregarMinhasDespesas();

    }
    catch(error){

        console.error(
            "Erro ao apagar despesa:",
            error
        );


        alert(
            "Erro de comunicação com o servidor."
        );

    }

};


// =====================================================
// FECHAR MODAL CLICANDO FORA
// =====================================================

window.addEventListener(
    "click",
    function(event){

        const modal =
            document.getElementById(
                "modal-despesas"
            );


        if(
            modal &&
            event.target === modal
        ){

            fecharDespesas();

        }

    }
);
