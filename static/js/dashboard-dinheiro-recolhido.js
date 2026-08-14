// ============================================================
// ABRIR DETALHES DINHEIRO RECOLHIDO
// ============================================================

async function abrirDetalhesDinheiroRecolhido(){

    const usuario =
        obterUsuarioDashboard();


    // ========================================================
    // SEGURANÇA
    // ========================================================

    if(!usuario){

        console.warn(
            "Usuário não encontrado."
        );

        return;

    }


    // ========================================================
    // SOMENTE ADMIN
    // ========================================================

    if(
        usuario.tipo !== "admin" &&
        usuario.tipo !== "administrador"
    ){

        console.warn(
            "Somente o admin pode visualizar estes detalhes."
        );

        return;

    }


    // ========================================================
    // ELEMENTOS
    // ========================================================

    const modal =
        document.getElementById(
            "modal-detalhes-dinheiro-recolhido"
        );


    const lista =
        document.getElementById(
            "lista-dinheiro-recolhido-gerentes"
        );


    const totalElemento =
        document.getElementById(
            "total-detalhes-recolhido"
        );


    if(
        !modal ||
        !lista ||
        !totalElemento
    ){

        console.error(
            "Elementos do modal de detalhes não encontrados."
        );

        return;

    }


    // ========================================================
    // ABRIR MODAL
    // ========================================================

    modal.style.display = "flex";


    // ========================================================
    // CARREGANDO
    // ========================================================

    lista.innerHTML = `

        <div class="text-center text-muted">

            Carregando...

        </div>

    `;


    totalElemento.innerText =
        "0.00 MT";


    try{

        // ====================================================
        // CHAMAR ENDPOINT
        // ====================================================

        const resposta =
            await fetch(
                `/caixa/dashboard/dinheiro-recolhido-gerentes?usuario_id=${usuario.id}`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        // ====================================================
        // ERRO HTTP
        // ====================================================

        if(!resposta.ok){

            const erro =
                await resposta.text();

            console.error(
                "Erro ao carregar detalhes:",
                erro
            );


            lista.innerHTML = `

                <div class="alert alert-danger">

                    Erro ao carregar os detalhes.

                </div>

            `;

            return;

        }


        // ====================================================
        // JSON
        // ====================================================

        const dados =
            await resposta.json();


        console.log(
            "DETALHES DINHEIRO RECOLHIDO:",
            dados
        );


        // ====================================================
        // DADOS DO ADMIN
        // ====================================================

        const admin =
            dados.admin ?? {};


        const retiradoAdmin =
            Number(
                admin.retirado ?? 0
            );


        const recolhidoAdmin =
            Number(
                admin.recolhido ?? 0
            );


        const recebidoGerentesAdmin =
            Number(
                admin.recebido_gerentes ?? 0
            );


        const despesasAdmin =
            Number(
                admin.despesas ?? 0
            );


        const totalAdmin =
            Number(
                admin.total ?? 0
            );


        // ====================================================
        // GERENTES
        // ====================================================

        const gerentes =
            Array.isArray(
                dados.gerentes
            )
            ?
            dados.gerentes
            :
            [];


        // ====================================================
        // LIMPAR
        // ====================================================

        lista.innerHTML = "";


        // ====================================================
        // ADMIN
        // ====================================================

        lista.innerHTML += `

            <div
                style="
                    margin-bottom:15px;
                    padding-bottom:12px;
                    border-bottom:2px solid #ddd;
                "
            >

                <h5 style="margin-bottom:10px;">

                    ${escaparHtml(
                        admin.nome ?? "Admin"
                    )}

                </h5>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        padding:4px 0;
                    "
                >

                    <span>
                        Recolhido pelo admin
                    </span>

                    <strong>
                        ${recolhidoAdmin.toFixed(2)} MT
                    </strong>

                </div>


                <!-- =========================================
                     RECEBIDO DOS GERENTES
                ========================================== -->

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        padding:4px 0;
                    "
                >

                    <span>
                        Recebido dos gerentes
                    </span>

                    <strong
                        style="
                            color:#198754;
                        "
                    >

                        + ${recebidoGerentesAdmin.toFixed(2)} MT

                    </strong>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        padding:4px 0;
                    "
                >

                    <span>
                        Retirado pelo admin
                    </span>

                    <strong>
                        ${retiradoAdmin.toFixed(2)} MT
                    </strong>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        padding:4px 0;
                    "
                >

                    <span>
                        Despesas aprovadas
                    </span>

                    <strong style="color:#dc3545;">

                        - ${despesasAdmin.toFixed(2)} MT

                    </strong>

                </div>


                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        padding:6px 0;
                        font-weight:bold;
                        border-top:1px solid #ddd;
                        margin-top:5px;
                    "
                >

                    <span>
                        Disponível do admin
                    </span>

                    <strong style="color:#198754;">

                        ${totalAdmin.toFixed(2)} MT

                    </strong>

                </div>

            </div>

        `;


        // ====================================================
        // TÍTULO GERENTES
        // ====================================================

        lista.innerHTML += `

            <h5 style="margin-bottom:10px;">

                Recolhas dos gerentes

            </h5>

        `;


        // ====================================================
        // SEM GERENTES
        // ====================================================

        if(
            gerentes.length === 0
        ){

            lista.innerHTML += `

                <div class="text-center text-muted">

                    Nenhum gerente possui recolhas.

                </div>

            `;

        }
        else{

            // =================================================
            // GERENTES
            // =================================================

            gerentes.forEach(
                gerente => {

                    // =========================================
                    // RECOLHIDO
                    // =========================================

                    const recolhido =
                        Number(
                            gerente.recolhido ?? 0
                        );


                    // =========================================
                    // DESPESAS
                    // =========================================

                    const despesas =
                        Number(
                            gerente.despesas ?? 0
                        );


                    // =========================================
                    // ENTREGUE AO ADMIN
                    // =========================================

                    const entregue =
                        Number(
                            gerente.entregue ?? 0
                        );


                    // =========================================
                    // DISPONÍVEL
                    //
                    // O backend já calcula:
                    //
                    // recolhido
                    // - despesas
                    // - entregue
                    //
                    // em total_recolhido.
                    // =========================================

                    const disponivel =
                        Number(
                            gerente.total_recolhido ?? 0
                        );


                    // =========================================
                    // ID
                    // =========================================

                    const gerenteId =
                        Number(
                            gerente.id ??
                            gerente.usuario_id ??
                            gerente.gerente_id ??
                            0
                        );


                    // =========================================
                    // NOME
                    // =========================================

                    const nomeGerente =
                        String(
                            gerente.nome ?? "-"
                        );


                    // =========================================
                    // LOG
                    // =========================================

                    console.log(
                        "================"
                    );

                    console.log(
                        "GERENTE ID:",
                        gerenteId
                    );

                    console.log(
                        "GERENTE:",
                        nomeGerente
                    );

                    console.log(
                        "RECOLHIDO:",
                        recolhido
                    );

                    console.log(
                        "DESPESAS:",
                        despesas
                    );

                    console.log(
                        "ENTREGUE AO ADMIN:",
                        entregue
                    );

                    console.log(
                        "DISPONÍVEL:",
                        disponivel
                    );


                    // =================================================
                    // BOTÃO RECOLHER
                    // =================================================

                    let botaoRecolher = "";


                    if(
                        gerenteId > 0 &&
                        disponivel > 0
                    ){

                        botaoRecolher = `

                            <button
                                type="button"
                                class="btn btn-danger btn-sm"
                                style="
                                    margin-top:8px;
                                    width:100%;
                                "
                                onclick="abrirRecolhaGerente(
                                    ${gerenteId},
                                    '${escaparHtml(nomeGerente)}',
                                    ${disponivel}
                                )"
                            >

                                Recolher

                            </button>

                        `;

                    }
                    else if(
                        gerenteId > 0
                    ){

                        botaoRecolher = `

                            <button
                                type="button"
                                class="btn btn-secondary btn-sm"
                                style="
                                    margin-top:8px;
                                    width:100%;
                                "
                                disabled
                            >

                                Sem saldo para recolher

                            </button>

                        `;

                    }


                    // =================================================
                    // MOSTRAR GERENTE
                    // =================================================

                    lista.innerHTML += `

                        <div
                            style="
                                padding:10px 0;
                                border-bottom:1px solid #eee;
                            "
                        >

                            <!-- =====================================
                                 NOME + DISPONÍVEL
                            ====================================== -->

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    gap:10px;
                                "
                            >

                                <strong>

                                    ${escaparHtml(
                                        nomeGerente
                                    )}

                                </strong>


                                <strong
                                    style="
                                        color:#198754;
                                    "
                                >

                                    ${disponivel.toFixed(2)} MT

                                </strong>

                            </div>


                            <!-- =====================================
                                 RECOLHIDO + DESPESAS
                            ====================================== -->

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    font-size:13px;
                                    color:#666;
                                    margin-top:5px;
                                "
                            >

                                <span>

                                    Recolhido:
                                    ${recolhido.toFixed(2)} MT

                                </span>


                                <span
                                    style="
                                        color:#dc3545;
                                    "
                                >

                                    Despesas:
                                    - ${despesas.toFixed(2)} MT

                                </span>

                            </div>


                            <!-- =====================================
                                 ENTREGUE AO ADMIN
                            ====================================== -->

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:center;
                                    font-size:13px;
                                    margin-top:5px;
                                "
                            >

                                <span>

                                    Entregue ao admin:

                                </span>


                                <strong
                                    style="
                                        color:#dc3545;
                                    "
                                >

                                    - ${entregue.toFixed(2)} MT

                                </strong>

                            </div>


                            <!-- =====================================
                                 DISPONÍVEL
                            ====================================== -->

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    font-size:13px;
                                    font-weight:bold;
                                    margin-top:6px;
                                    padding-top:5px;
                                    border-top:1px solid #eee;
                                "
                            >

                                <span>

                                    Disponível:

                                </span>


                                <strong
                                    style="
                                        color:#198754;
                                    "
                                >

                                    ${disponivel.toFixed(2)} MT

                                </strong>

                            </div>


                            <!-- =====================================
                                 BOTÃO
                            ====================================== -->

                            ${botaoRecolher}

                        </div>

                    `;

                }
            );

        }


        // ====================================================
        // TOTAL DOS GERENTES
        // ====================================================

        const totalGerentes =
            Number(
                dados.total_gerentes ?? 0
            );


        lista.innerHTML += `

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    margin-top:12px;
                    padding-top:10px;
                    border-top:2px solid #ddd;
                    font-weight:bold;
                "
            >

                <span>

                    Total disponível dos gerentes

                </span>

                <span
                    style="
                        color:#198754;
                    "
                >

                    ${totalGerentes.toFixed(2)} MT

                </span>

            </div>

        `;


        // ====================================================
        // TOTAL GERAL
        //
        // IMPORTANTE:
        //
        // Este valor deve ser:
        //
        // Disponível Admin
        // +
        // Disponível Gerentes
        //
        // Uma recolha:
        //
        // Gerente  -> Admin
        //
        // diminui um lado e aumenta o outro.
        //
        // Portanto o total não muda.
        // ====================================================

        const totalGeral =
            Number(
                dados.total_geral ?? 0
            );


        totalElemento.innerText =
            totalGeral.toFixed(2) +
            " MT";


        console.log(
            "====================================="
        );

        console.log(
            "TOTAL ADMIN:",
            totalAdmin
        );

        console.log(
            "TOTAL GERENTES:",
            totalGerentes
        );

        console.log(
            "TOTAL GERAL DISPONÍVEL:",
            totalGeral
        );

        console.log(
            "====================================="

        );

    }
    catch(erro){

        console.error(
            "Erro ao carregar os detalhes:",
            erro
        );


        lista.innerHTML = `

            <div class="alert alert-danger">

                Erro ao carregar os detalhes.

            </div>

        `;

    }

}


// ============================================================
// ABRIR RECOLHA DO GERENTE
// ============================================================

function abrirRecolhaGerente(
    gerenteId,
    nome,
    disponivel
){

    console.log(
        "====================================="
    );

    console.log(
        "ABRIR RECOLHA DO GERENTE"
    );

    console.log(
        "GERENTE ID:",
        gerenteId
    );

    console.log(
        "GERENTE:",
        nome
    );

    console.log(
        "DISPONÍVEL:",
        disponivel
    );

    console.log(
        "====================================="
    );


    // ========================================================
    // GUARDAR GERENTE
    // ========================================================

    gerenteSelecionadoRecolha =
        Number(gerenteId);


    // ========================================================
    // ELEMENTOS
    // ========================================================

    const modal =
        document.getElementById(
            "modal-recolha-gerente"
        );


    const nomeElemento =
        document.getElementById(
            "nome-gerente-recolha"
        );


    const disponivelElemento =
        document.getElementById(
            "valor-disponivel-gerente"
        );


    const valorElemento =
        document.getElementById(
            "valor-recolha-gerente"
        );


    const observacaoElemento =
        document.getElementById(
            "observacao-recolha-gerente"
        );


    // ========================================================
    // VALIDAR HTML
    // ========================================================

    if(!modal){

        console.error(
            "Modal #modal-recolha-gerente não encontrado."
        );

        return;

    }


    // ========================================================
    // NOME
    // ========================================================

    if(nomeElemento){

        nomeElemento.innerText =
            nome || "-";

    }


    // ========================================================
    // DISPONÍVEL
    // ========================================================

    if(disponivelElemento){

        disponivelElemento.innerText =
            Number(disponivel).toFixed(2) +
            " MT";

    }


    // ========================================================
    // VALOR
    // ========================================================

    if(valorElemento){

        valorElemento.value = "";

        valorElemento.max =
            Number(disponivel).toFixed(2);

    }


    // ========================================================
    // OBSERVAÇÃO
    // ========================================================

    if(observacaoElemento){

        observacaoElemento.value = "";

    }


    // ========================================================
    // GUARDAR DISPONÍVEL NO MODAL
    // ========================================================

    modal.dataset.disponivel =
        Number(disponivel);


    // ========================================================
    // ABRIR
    // ========================================================

    modal.style.display = "flex";


    // ========================================================
    // FOCAR VALOR
    // ========================================================

    setTimeout(
        () => {

            if(valorElemento){

                valorElemento.focus();

            }

        },
        100
    );

}


// ============================================================
// FECHAR RECOLHA DO GERENTE
// ============================================================

function fecharRecolhaGerente(){

    const modal =
        document.getElementById(
            "modal-recolha-gerente"
        );


    if(modal){

        modal.style.display =
            "none";

    }


    gerenteSelecionadoRecolha =
        null;

}


// ============================================================
// CONFIRMAR RECOLHA DO GERENTE
// ============================================================

async function recolherDinheiroGerente(){

    // ========================================================
    // USUÁRIO
    // ========================================================

    const usuario =
        obterUsuarioDashboard();


    if(!usuario){

        alert(
            "Usuário não encontrado."
        );

        return;

    }


    // ========================================================
    // SOMENTE ADMIN
    // ========================================================

    if(
        usuario.tipo !== "admin" &&
        usuario.tipo !== "administrador"
    ){

        alert(
            "Somente o admin pode recolher dinheiro do gerente."
        );

        return;

    }


    // ========================================================
    // GERENTE
    // ========================================================

    if(
        !gerenteSelecionadoRecolha
    ){

        alert(
            "Nenhum gerente selecionado."
        );

        return;

    }


    // ========================================================
    // ELEMENTOS
    // ========================================================

    const valorElemento =
        document.getElementById(
            "valor-recolha-gerente"
        );


    const observacaoElemento =
        document.getElementById(
            "observacao-recolha-gerente"
        );


    const modal =
        document.getElementById(
            "modal-recolha-gerente"
        );


    if(!valorElemento){

        alert(
            "Campo de valor não encontrado."
        );

        return;

    }


    // ========================================================
    // VALOR
    // ========================================================

    const valor =
        Number(
            String(
                valorElemento.value
            ).replace(",", ".")
        );


    // ========================================================
    // DISPONÍVEL
    // ========================================================

    const disponivel =
        Number(
            modal?.dataset?.disponivel ?? 0
        );


    // ========================================================
    // OBSERVAÇÃO
    // ========================================================

    const observacao =
        observacaoElemento
        ?
        observacaoElemento.value.trim()
        :
        "";


    // ========================================================
    // VALIDAR VALOR
    // ========================================================

    if(
        !Number.isFinite(valor) ||
        valor <= 0
    ){

        alert(
            "Informe um valor maior que zero."
        );

        return;

    }


    // ========================================================
    // NÃO PERMITIR MAIS QUE O DISPONÍVEL
    // ========================================================

    if(
        valor > disponivel
    ){

        alert(
            "O valor informado é maior que o disponível do gerente.\n\n" +
            "Disponível: " +
            disponivel.toFixed(2) +
            " MT"
        );

        return;

    }


    // ========================================================
    // CONFIRMAÇÃO
    // ========================================================

    const confirmar =
        confirm(
            "Confirmar recolha?\n\n" +

            "Gerente ID: " +
            gerenteSelecionadoRecolha +
            "\n" +

            "Valor: " +
            valor.toFixed(2) +
            " MT\n\n" +

            "O valor será retirado do disponível do gerente " +
            "e ficará disponível para o admin."
        );


    if(!confirmar){

        return;

    }


    // ========================================================
    // DESABILITAR BOTÃO
    // ========================================================

    const botoes =
        modal
        ?
        modal.querySelectorAll(
            "button"
        )
        :
        [];


    botoes.forEach(
        botao => {

            botao.disabled = true;

        }
    );


    try{

        console.log(
            "====================================="
        );

        console.log(
            "RECOLHENDO DINHEIRO DO GERENTE"
        );

        console.log(
            "ADMIN ID:",
            usuario.id
        );

        console.log(
            "GERENTE ID:",
            gerenteSelecionadoRecolha
        );

        console.log(
            "VALOR:",
            valor
        );

        console.log(
            "====================================="
        );


        // ====================================================
        // CHAMAR ROTA
        // ====================================================

        const resposta =
            await fetch(
                `/caixa/recolher?usuario_id=${usuario.id}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            vendedor_id:
                                gerenteSelecionadoRecolha,

                            valor:
                                valor,

                            observacao:
                                observacao

                        })
                }
            );


        // ====================================================
        // LER RESPOSTA
        // ====================================================

        let dados = {};

        try{

            dados =
                await resposta.json();

        }
        catch(erro){

            console.error(
                "Resposta não é JSON:",
                erro
            );

        }


        // ====================================================
        // ERRO
        // ====================================================

        if(!resposta.ok){

            console.error(
                "ERRO AO RECOLHER:",
                dados
            );


            alert(
                dados.detail ||
                "Erro ao realizar recolha."
            );


            return;

        }


        // ====================================================
        // SUCESSO
        // ====================================================

        console.log(
            "RECOLHA REALIZADA:",
            dados
        );


        alert(
            "Recolha realizada com sucesso!\n\n" +

            "Valor recolhido: " +

            Number(
                dados.valor_recolhido ??
                valor
            ).toFixed(2) +

            " MT"
        );


        // ====================================================
        // FECHAR POPUP
        // ====================================================

        fecharRecolhaGerente();


        // ====================================================
        // ATUALIZAR DETALHES
        // ====================================================

        await abrirDetalhesDinheiroRecolhido();


        // ====================================================
        // ATUALIZAR DASHBOARD
        // ====================================================

        if(
            typeof window.atualizarDinheiroRecolhido ===
            "function"
        ){

            await window.atualizarDinheiroRecolhido();

        }


        if(
            typeof window.atualizarDadosCaixaDashboard ===
            "function"
        ){

            await window.atualizarDadosCaixaDashboard();

        }

    }
    catch(erro){

        console.error(
            "Erro ao realizar recolha do gerente:",
            erro
        );


        alert(
            "Erro ao realizar a recolha."
        );

    }
    finally{

        // ====================================================
        // REATIVAR BOTÕES
        // ====================================================

        botoes.forEach(
            botao => {

                botao.disabled = false;

            }
        );

    }

}


// ============================================================
// FECHAR DETALHES DINHEIRO RECOLHIDO
// ============================================================

function fecharDetalhesDinheiroRecolhido(){

    const modal =
        document.getElementById(
            "modal-detalhes-dinheiro-recolhido"
        );


    if(modal){

        modal.style.display =
            "none";

    }

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHtml(valor){

    if(
        valor === null ||
        valor === undefined
    ){

        return "";

    }


    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// OBTER USUÁRIO DO DASHBOARD
// ============================================================

function obterUsuarioDashboard(){

    const usuarioStorage =
        localStorage.getItem(
            "usuario"
        );


    if(!usuarioStorage){

        return null;

    }


    try{

        return JSON.parse(
            usuarioStorage
        );

    }
    catch(erro){

        console.error(
            "Erro ao ler usuário:",
            erro
        );

        return null;

    }

}


// ============================================================
// EXPOR FUNÇÕES GLOBALMENTE
// ============================================================
//
// Isso garante que os onclick="" criados dinamicamente
// consigam encontrar as funções.
// ============================================================

window.abrirDetalhesDinheiroRecolhido =
    abrirDetalhesDinheiroRecolhido;


window.fecharDetalhesDinheiroRecolhido =
    fecharDetalhesDinheiroRecolhido;


window.abrirRecolhaGerente =
    abrirRecolhaGerente;


window.fecharRecolhaGerente =
    fecharRecolhaGerente;


window.recolherDinheiroGerente =
    recolherDinheiroGerente;


window.obterUsuarioDashboard =
    obterUsuarioDashboard;


window.escaparHtml =
    escaparHtml;
