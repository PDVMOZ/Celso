// =====================================================
// ÁREA DE DESPESAS
// =====================================================


// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let despesasAtuais = [];

let modoTabelaDespesas = false;


// =====================================================
// ABRIR ÁREA DE DESPESAS
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

function configurarPermissaoDespesas(){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario){

        console.error(
            "Usuário não encontrado."
        );

        return;

    }


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    const formulario =
        document.getElementById(
            "formulario-despesa"
        );


    const botao =
        document.getElementById(
            "btn-nova-despesa"
        );


    // =================================================
    // ADMIN
    // =================================================

    if(
        tipoUsuario === "admin" ||
        tipoUsuario === "administrador"
    ){

        console.log(
            "ADMIN: pode criar despesas diretamente."
        );


        if(botao){

            botao.style.display =
                "inline-block";

            botao.style.visibility =
                "visible";

            botao.disabled =
                false;

            botao.innerHTML = `
                <i class="bi bi-plus-circle"></i>
                Nova despesa
            `;

        }


        if(formulario){

            formulario.style.display =
                "none";

        }


        carregarTodasDespesasAdmin();


        return;

    }


    // =================================================
    // GERENTE
    // =================================================

    if(
        tipoUsuario === "gerente"
    ){

        console.log(
            "GERENTE: somente aprovação."
        );


        if(botao){

            botao.style.display =
                "none";

            botao.disabled =
                true;

        }


        if(formulario){

            formulario.style.display =
                "none";

        }


        carregarSolicitacoesDespesas();


        return;

    }


    // =================================================
    // VENDEDOR
    // =================================================

    if(
        tipoUsuario === "vendedor"
    ){

        console.log(
            "VENDEDOR: pode solicitar despesas."
        );


        if(botao){

            botao.style.display =
                "inline-block";

            botao.style.visibility =
                "visible";

            botao.disabled =
                false;

            botao.innerHTML = `
                <i class="bi bi-send"></i>
                Solicitar despesa
            `;

        }


        if(formulario){

            formulario.style.display =
                "none";

        }


        carregarMinhasDespesas();


        return;

    }


    // =================================================
    // TIPO DESCONHECIDO
    // =================================================

    console.error(
        "Tipo de usuário sem permissão:",
        usuario.tipo
    );


    if(botao){

        botao.style.display =
            "none";

    }


    if(formulario){

        formulario.style.display =
            "none";

    }

}


// =====================================================
// ABRIR FORMULÁRIO
// ADMIN E VENDEDOR
// GERENTE NÃO PODE
// =====================================================

window.abrirFormularioDespesa = function(){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario){

        alert(
            "Usuário não encontrado."
        );

        return;

    }


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    // =================================================
    // GERENTE NÃO PODE
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
    // SOMENTE ADMIN OU VENDEDOR
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
// SALVAR DESPESA
// =====================================================

window.salvarDespesa = async function(){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario){

        alert(
            "Usuário não encontrado."
        );

        return;

    }


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    // =================================================
    // GERENTE NÃO PODE CRIAR
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
    // VALIDAR TIPO
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

        console.error(
            "Campos da despesa não encontrados."
        );

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
        !valor ||
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


    try{

        let endpoint;


        // =================================================
        // ADMIN
        // =================================================

        if(
            tipoUsuario === "admin" ||
            tipoUsuario === "administrador"
        ){

            endpoint =
                API +
                "/despesas/";

        }


        // =================================================
        // VENDEDOR
        // =================================================

        else{

            endpoint =
                API +
                "/despesas/solicitar";

        }


        console.log(
            "Criando despesa:",
            endpoint,
            dados
        );


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
            await resposta.json();


        if(!resposta.ok){

            console.error(
                "Erro ao criar despesa:",
                resultado
            );


            alert(
                resultado.detail ||
                "Erro ao criar despesa."
            );


            return;

        }


        console.log(
            "Despesa criada:",
            resultado
        );


        // =================================================
        // LIMPAR FORMULÁRIO
        // =================================================

        campoDescricao.value = "";

        campoCategoria.value = "";

        campoValor.value = "";

        campoObservacao.value = "";


        // =================================================
        // FECHAR FORMULÁRIO
        // =================================================

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

            await carregarTodasDespesasAdmin();

        }
        else{

            await carregarMinhasDespesas();

        }


        // =================================================
        // MENSAGEM
        // =================================================

        if(
            tipoUsuario === "admin" ||
            tipoUsuario === "administrador"
        ){

            alert(
                "Despesa criada e aprovada com sucesso."
            );

        }
        else{

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
// CARREGAR MINHAS DESPESAS
// VENDEDOR
// =====================================================

async function carregarMinhasDespesas(){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    try{

        const resposta =
            await fetch(

                API +
                "/despesas/usuario/" +
                usuario.id

            );


        const dados =
            await resposta.json();


        if(!resposta.ok){

            console.error(
                "Erro ao carregar minhas despesas:",
                dados
            );


            const lista =
                document.getElementById(
                    "lista-despesas"
                );


            if(lista){

                lista.innerHTML = `
                    <div class="alert alert-danger">
                        ${
                            dados.detail ||
                            "Erro ao carregar despesas."
                        }
                    </div>
                `;

            }

            return;

        }


        console.log(
            "Despesas do vendedor:",
            dados
        );


        // =================================================
        // GUARDAR DADOS PARA FILTRO
        // =================================================

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

    }

}


// =====================================================
// CARREGAR DESPESAS ADMIN
// ADMIN VÊ TODAS
// =====================================================

async function carregarTodasDespesasAdmin(){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    try{

        const resposta =
            await fetch(

                API +
                "/despesas/usuario/" +
                usuario.id

            );


        const dados =
            await resposta.json();


        if(!resposta.ok){

            console.error(
                "Erro ao carregar despesas do admin:",
                dados
            );


            const lista =
                document.getElementById(
                    "lista-despesas"
                );


            if(lista){

                lista.innerHTML = `
                    <div class="alert alert-danger">
                        ${
                            dados.detail ||
                            "Erro ao carregar despesas."
                        }
                    </div>
                `;

            }

            return;

        }


        console.log(
            "Despesas do ADMIN:",
            dados
        );


        // =================================================
        // GUARDAR DADOS PARA FILTRO
        // =================================================

        despesasAtuais =
            Array.isArray(dados)
                ? dados
                : [];


        modoTabelaDespesas =
            true;


        mostrarTabelaDespesas(
            despesasAtuais,
            true
        );


        configurarFiltroDespesas();

    }
    catch(error){

        console.error(
            "Erro ao carregar despesas do admin:",
            error
        );

    }

}


// =====================================================
// CARREGAR SOLICITAÇÕES
// ADMIN / GERENTE
// =====================================================

async function carregarSolicitacoesDespesas(){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    try{

        const resposta =
            await fetch(

                API +
                "/despesas/pendentes?usuario_id=" +
                usuario.id

            );


        const dados =
            await resposta.json();


        if(!resposta.ok){

            console.error(
                "Erro ao carregar solicitações:",
                dados
            );

            return;

        }


        console.log(
            "Solicitações recebidas:",
            dados
        );


        // =================================================
        // GUARDAR DADOS PARA FILTRO
        // =================================================

        despesasAtuais =
            Array.isArray(dados)
                ? dados
                : [];


        modoTabelaDespesas =
            true;


        mostrarTabelaDespesas(
            despesasAtuais,
            true
        );


        configurarFiltroDespesas();

    }
    catch(error){

        console.error(
            "Erro ao carregar solicitações:",
            error
        );

    }

}


// =====================================================
// NORMALIZAR TEXTO PARA FILTRO
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
// NORMALIZAR VALOR MONETÁRIO
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
// OBTER DATA PARA PESQUISA
// =====================================================

function obterDataDespesa(d){

    if(!d || !d.data_despesa){

        return "";

    }


    const data =
        String(
            d.data_despesa
        );


    // Exemplo:
    // 2026-08-11T14:16:13.126997Z

    const dataISO =
        data.substring(
            0,
            10
        );


    let dataFormatada =
        "";


    try{

        dataFormatada =
            new Date(
                d.data_despesa
            ).toLocaleDateString(
                "pt-PT"
            );

    }
    catch(error){

        dataFormatada =
            "";

    }


    return (
        dataISO +
        " " +
        dataFormatada
    );

}


// =====================================================
// CONFIGURAR FILTRO DE DESPESAS
// =====================================================

function configurarFiltroDespesas(){

    const campoTexto =
        document.getElementById(
            "filtro-despesas"
        );


    const campoData =
        document.getElementById(
            "filtro-data-despesas"
        );


    if(campoTexto){

        campoTexto.removeEventListener(
            "input",
            executarFiltroDespesas
        );


        campoTexto.addEventListener(
            "input",
            executarFiltroDespesas
        );

    }


    if(campoData){

        campoData.removeEventListener(
            "input",
            executarFiltroDespesas
        );


        campoData.removeEventListener(
            "change",
            executarFiltroDespesas
        );


        campoData.addEventListener(
            "input",
            executarFiltroDespesas
        );


        campoData.addEventListener(
            "change",
            executarFiltroDespesas
        );

    }

}


// =====================================================
// EXECUTAR FILTRO
//
// PESQUISA POR:
//
// Nome
// Descrição
// Categoria
// Estado
// Data
// Valor proposto
// Valor aprovado
// =====================================================

function executarFiltroDespesas(){

    const campoTexto =
        document.getElementById(
            "filtro-despesas"
        );


    const campoData =
        document.getElementById(
            "filtro-data-despesas"
        );


    const texto =
        campoTexto
            ? normalizarTexto(
                campoTexto.value
            )
            : "";


    const dataFiltro =
        campoData
            ? campoData.value.trim()
            : "";


    let dadosFiltrados =
        [...despesasAtuais];


    // =================================================
    // FILTRO POR TEXTO
    // =================================================

    if(texto){

        dadosFiltrados =
            dadosFiltrados.filter(
                function(d){

                    // ---------------------------------
                    // NOME
                    // ---------------------------------

                    const nome =
                        normalizarTexto(
                            d.solicitante_nome
                        );


                    // ---------------------------------
                    // DESCRIÇÃO
                    // ---------------------------------

                    const descricao =
                        normalizarTexto(
                            d.descricao
                        );


                    // ---------------------------------
                    // CATEGORIA
                    // ---------------------------------

                    const categoria =
                        normalizarTexto(
                            d.categoria
                        );


                    // ---------------------------------
                    // ESTADO
                    // ---------------------------------

                    const estado =
                        normalizarTexto(
                            d.estado
                        );


                    // ---------------------------------
                    // VALOR PROPOSTO
                    // ---------------------------------

                    const valorPropostoNumero =
                        d.valor_proposto !== null &&
                        d.valor_proposto !== undefined
                            ? Number(
                                d.valor_proposto
                            )
                            : 0;


                    const valorProposto =
                        normalizarValor(
                            d.valor_proposto
                        );


                    const valorPropostoPonto =
                        String(
                            valorPropostoNumero
                        );


                    const valorPropostoInteiro =
                        String(
                            valorPropostoNumero
                        )
                        .replace(
                            ".00",
                            ""
                        );


                    // ---------------------------------
                    // VALOR APROVADO
                    // ---------------------------------

                    const valorAprovado =
                        normalizarValor(
                            d.valor_aprovado
                        );


                    const valorAprovadoNumero =
                        d.valor_aprovado !== null &&
                        d.valor_aprovado !== undefined
                            ? Number(
                                d.valor_aprovado
                            )
                            : null;


                    const valorAprovadoPonto =
                        valorAprovadoNumero !== null
                            ? String(
                                valorAprovadoNumero
                            )
                            : "";


                    // ---------------------------------
                    // DATA
                    // ---------------------------------

                    const data =
                        normalizarTexto(
                            obterDataDespesa(d)
                        );


                    // ---------------------------------
                    // VERIFICAR TODOS OS CAMPOS
                    // ---------------------------------

                    return (

                        nome.includes(texto) ||

                        descricao.includes(texto) ||

                        categoria.includes(texto) ||

                        estado.includes(texto) ||

                        data.includes(texto) ||

                        valorProposto.includes(texto) ||

                        valorPropostoPonto.includes(texto) ||

                        valorPropostoInteiro.includes(texto) ||

                        valorAprovado.includes(texto) ||

                        valorAprovadoPonto.includes(texto)

                    );

                }
            );

    }


    // =================================================
    // FILTRO EXATO POR DATA
    // =================================================

    if(dataFiltro){

        dadosFiltrados =
            dadosFiltrados.filter(
                function(d){

                    if(!d.data_despesa){

                        return false;

                    }


                    const dataDespesa =
                        String(
                            d.data_despesa
                        )
                        .substring(
                            0,
                            10
                        );


                    return (
                        dataDespesa ===
                        dataFiltro
                    );

                }
            );

    }


    // =================================================
    // MOSTRAR RESULTADO
    // =================================================

    mostrarTabelaDespesas(
        dadosFiltrados,
        modoTabelaDespesas
    );

}


// =====================================================
// LIMPAR FILTROS
// =====================================================

window.limparFiltroDespesas = function(){

    const campoTexto =
        document.getElementById(
            "filtro-despesas"
        );


    const campoData =
        document.getElementById(
            "filtro-data-despesas"
        );


    if(campoTexto){

        campoTexto.value = "";

    }


    if(campoData){

        campoData.value = "";

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
    admin
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

        lista.innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar despesas.
            </div>
        `;

        return;

    }


    // =================================================
    // CABEÇALHO
    // =================================================

    let html = `

    <div class="table-responsive">

        <table class="table table-bordered table-hover">

            <thead>

                <tr>

                    <th>
                        Nome
                    </th>

                    <th>
                        Descrição
                    </th>

                    <th>
                        Categoria
                    </th>

                    <th>
                        Valor Proposto
                    </th>

                    <th>
                        Valor Aprovado
                    </th>

                    <th>
                        Estado
                    </th>

                    <th>
                        Data
                    </th>

                    <th>
                        Ação
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    // =================================================
    // NENHUMA DESPESA
    // =================================================

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


    // =================================================
    // DESPESAS
    // =================================================

    dados.forEach(
        function(d){

            const estado =
                String(
                    d.estado || ""
                )
                .trim()
                .toLowerCase();


            const nomeSolicitante =
                d.solicitante_nome ||
                "Não informado";


            html += `

            <tr data-id="${d.id}">

                <td class="nome-solicitante">

                    ${escaparHtml(
                        nomeSolicitante
                    )}

                </td>


                <td class="descricao">

                    ${escaparHtml(
                        d.descricao
                    )}

                </td>


                <td class="categoria">

                    ${escaparHtml(
                        d.categoria
                    )}

                </td>


                <td class="valor">

                    ${
                        Number(
                            d.valor_proposto || 0
                        ).toFixed(2)
                    }

                    MT

                </td>


                <td class="valor-aprovado">

                    ${
                        d.valor_aprovado == null

                        ?

                        "-"

                        :

                        Number(
                            d.valor_aprovado
                        ).toFixed(2)
                        + " MT"

                    }

                </td>


                <td class="estado">

                    ${escaparHtml(
                        d.estado
                    )}

                </td>


                <td>

                    ${
                        d.data_despesa

                        ?

                        new Date(
                            d.data_despesa
                        ).toLocaleDateString(
                            "pt-PT"
                        )

                        :

                        "-"
                    }

                </td>

            `;


            // =================================================
            // ADMIN / GERENTE
            // =================================================

            if(admin){

                if(
                    estado === "pendente"
                ){

                    html += `

                        <td>

                            <button
                                type="button"
                                class="btn btn-success btn-sm"
                                onclick="aprovarDespesa(${d.id})"
                            >

                                <i class="bi bi-check-circle"></i>

                                Aprovar

                            </button>

                        </td>

                    `;

                }
                else{

                    html += `

                        <td>

                            <span class="text-success">

                                <i class="bi bi-check-circle"></i>

                                Aprovada

                            </span>

                        </td>

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

                        <td>

                            <button
                                type="button"
                                class="btn btn-warning btn-sm me-1"
                                onclick="editarDespesa(${d.id})"
                            >

                                <i class="bi bi-pencil"></i>

                                Editar

                            </button>


                            <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                onclick="apagarDespesa(${d.id})"
                            >

                                <i class="bi bi-trash"></i>

                                Apagar

                            </button>

                        </td>

                    `;

                }
                else{

                    html += `

                        <td>

                            <span class="text-muted">

                                Bloqueada

                            </span>

                        </td>

                    `;

                }

            }


            html += `

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
// SOMENTE PENDENTE
// =====================================================

window.editarDespesa = function(id){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    if(
        tipoUsuario !== "vendedor"
    ){

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
        linha
        .querySelector(".estado")
        ?.innerText
        .trim()
        .toLowerCase();


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
        .trim();


    const descricao =
        linha
        .querySelector(".descricao")
        .innerText
        .trim();


    const categoria =
        linha
        .querySelector(".categoria")
        .innerText
        .trim();


    const valor =
        linha
        .querySelector(".valor")
        .innerText
        .replace(
            " MT",
            ""
        )
        .trim();


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
                value="${Number(
                    valor.replace(
                        ",",
                        "."
                    )
                )}"
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
// SOMENTE VENDEDOR
// =====================================================

window.salvarEdicaoDespesa = async function(id){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    if(
        tipoUsuario !== "vendedor"
    ){

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

        campoDescricao.focus();

        return;

    }


    if(!categoria){

        alert(
            "Informe a categoria."
        );

        campoCategoria.focus();

        return;

    }


    if(
        !valor ||
        valor <= 0
    ){

        alert(
            "Informe um valor válido."
        );

        campoValor.focus();

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
                usuario.id,

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
            await resposta.json();


        if(!resposta.ok){

            console.error(
                "Erro ao editar:",
                resultado
            );


            alert(
                resultado.detail ||
                "Erro ao editar despesa."
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
// APROVAR DESPESA
// ADMIN / GERENTE
// =====================================================

window.aprovarDespesa = function(id){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    if(
        tipoUsuario !== "admin" &&
        tipoUsuario !== "administrador" &&
        tipoUsuario !== "gerente"
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
        linha.querySelector(".valor");


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


    // =================================================
    // EVITAR ABRIR NOVAMENTE
    // =================================================

    if(
        document.getElementById(
            "valor-aprovado-" + id
        )
    ){

        return;

    }


    // =================================================
    // VALOR PROPOSTO
    // =================================================

    const valorProposto =
        campoValor.innerText
        .replace(
            " MT",
            ""
        )
        .trim();


    // =================================================
    // GUARDAR ESTADO ORIGINAL
    // =================================================

    colunaValorAprovado.dataset.valorOriginal =
        colunaValorAprovado.innerHTML;


    colunaAcao.dataset.acaoOriginal =
        colunaAcao.innerHTML;


    // =================================================
    // CAMPO VALOR APROVADO
    // =================================================

    colunaValorAprovado.innerHTML = `

        <input
            type="number"
            min="0.01"
            step="0.01"
            class="form-control"
            id="valor-aprovado-${id}"
            value="${Number(
                valorProposto
                .replace(
                    ",",
                    "."
                )
            )}"
        >

    `;


    // =================================================
    // BOTÕES
    // GUARDAR + CANCELAR
    // =================================================

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


    // =================================================
    // FOCAR NO CAMPO
    // =================================================

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
//
// NÃO ENVIA NADA AO BACKEND.
// APENAS RESTAURA A INTERFACE.
// =====================================================

window.cancelarAprovacaoDespesa = function(id){

    const linha =
        document.querySelector(
            `tr[data-id="${id}"]`
        );


    if(!linha){

        console.error(
            "Linha da despesa não encontrada."
        );

        return;

    }


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

        console.error(
            "Colunas da aprovação não encontradas."
        );

        return;

    }


    // =================================================
    // RESTAURAR VALOR APROVADO
    // =================================================

    if(
        colunaValorAprovado.dataset.valorOriginal !== undefined
    ){

        colunaValorAprovado.innerHTML =
            colunaValorAprovado.dataset.valorOriginal;

    }
    else{

        colunaValorAprovado.innerHTML =
            "-";

    }


    // =================================================
    // RESTAURAR BOTÃO APROVAR
    // =================================================

    if(
        colunaAcao.dataset.acaoOriginal !== undefined
    ){

        colunaAcao.innerHTML =
            colunaAcao.dataset.acaoOriginal;

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


    // =================================================
    // LIMPAR DADOS TEMPORÁRIOS
    // =================================================

    delete colunaValorAprovado.dataset.valorOriginal;

    delete colunaAcao.dataset.acaoOriginal;


    console.log(
        "Aprovação cancelada para a despesa:",
        id
    );

};


// =====================================================
// GUARDAR APROVAÇÃO
// ADMIN / GERENTE
// =====================================================

window.guardarAprovacaoDespesa = async function(id){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    if(
        tipoUsuario !== "admin" &&
        tipoUsuario !== "administrador" &&
        tipoUsuario !== "gerente"
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

        console.error(
            "Campo de valor aprovado não encontrado."
        );

        return;

    }


    const valor =
        Number(
            campo.value
        );


    if(
        !valor ||
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
                usuario.id,

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
            await resposta.json();


        if(!resposta.ok){

            console.error(
                "Erro ao aprovar:",
                dados
            );


            alert(
                dados.detail ||
                "Erro ao aprovar despesa."
            );

            return;

        }


        console.log(
            "Despesa aprovada:",
            dados
        );


        alert(
            "Despesa aprovada com sucesso."
        );


        // =================================================
        // ATUALIZAR LISTA CORRETAMENTE
        // =================================================

        if(
            tipoUsuario === "admin" ||
            tipoUsuario === "administrador"
        ){

            await carregarTodasDespesasAdmin();

        }
        else{

            await carregarSolicitacoesDespesas();

        }

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
// SOMENTE VENDEDOR
// SOMENTE PENDENTE
// =====================================================

window.apagarDespesa = async function(id){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );


    if(!usuario)
        return;


    const tipoUsuario =
        String(
            usuario.tipo || ""
        )
        .trim()
        .toLowerCase();


    if(
        tipoUsuario !== "vendedor"
    ){

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
                usuario.id,

                {

                    method: "DELETE"

                }

            );


        const dados =
            await resposta.json();


        if(!resposta.ok){

            console.error(
                "Erro ao apagar:",
                dados
            );


            alert(
                dados.detail ||
                "Não foi possível apagar a despesa."
            );

            return;

        }


        console.log(
            "Despesa removida:",
            dados
        );


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