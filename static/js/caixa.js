// =====================================
// ABRIR MODAL CAIXA
// =====================================
console.log("CAIXA.JS FOI CARREGADO");
let historicoCompleto = [];

// =====================================
// ABRIR MODAL CAIXA
// =====================================

async function abrirCaixa(){

    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );


    // Sem login: ignora
    if(!usuario){

        return;

    }



    const modal =
    document.getElementById(
        "caixa-panel"
    );


    modal.style.display="flex";



    if(
        usuario.tipo=="admin" ||
        usuario.tipo=="gerente"
    ){

        await carregarTodasCaixas();

    }
    else{

        await carregarMinhaCaixa(
            usuario.id
        );

    }

}

// =====================================
// FECHAR MODAL
// =====================================

function fecharCaixa(){

    document
    .getElementById("caixa-panel")
    .style.display="none";


    fecharOperacaoCaixa();

}





// =====================================
// CARREGAR TODAS AS CAIXAS
// =====================================

async function carregarTodasCaixas(){

    const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );

    if(!usuario){
        return;
    }

    const resposta =
        await fetch(
            `/caixa/todas?usuario_id=${usuario.id}`
        );

    if(!resposta.ok){

        console.error(
            "Erro ao carregar caixas:",
            resposta.status
        );

        return;
    }

    const caixas =
        await resposta.json();


    const area =
        document.getElementById(
            "lista-caixas"
        );

    if(!area){
        return;
    }


    area.innerHTML = "";


    caixas.forEach(c => {

        // =====================================
        // GERENTE
        // =====================================
        // Gerente só pode ver vendedores
        // =====================================

        if(usuario.tipo === "gerente"){

            if(c.tipo !== "vendedor"){
                return;
            }

        }


        // =====================================
        // ADMIN
        // =====================================
        // Admin não precisa mostrar caixa
        // de gerente no resumo
        // =====================================

        if(
            usuario.tipo === "admin" &&
            c.tipo === "gerente"
        ){

            return;

        }


        let botao = "";


        // =====================================
        // ADMIN NA PRÓPRIA CAIXA
        // =====================================

        if(
            usuario.tipo === "admin" &&
            c.usuario_id == usuario.id
        ){

            botao = `

                <button
                    class="btn btn-warning w-100 mt-2"
                    onclick="abrirRetirada()"
                >
                    Retirar
                </button>

            `;

        }


        // =====================================
        // ADMIN OU GERENTE RECOLHENDO
        // SOMENTE VENDEDORES
        // =====================================

        else if(
            (
                usuario.tipo === "admin" ||
                usuario.tipo === "gerente"
            )
            &&
            c.tipo === "vendedor"
        ){

            botao = `

                <button
                    class="btn btn-danger w-100 mt-2"
                    onclick="abrirRecolha(
                        ${c.usuario_id},
                        '${c.nome}'
                    )"
                >
                    Recolher
                </button>

            `;

        }


        // =====================================
        // MOSTRAR CAIXA
        // =====================================

        area.innerHTML += `

            <div class="caixa-item">

                <h5>
                    ${c.nome}
                </h5>

                Tipo:
                ${c.tipo}

                <br><br>

                Vendas:
                ${c.vendas ?? 0} MT

                <br>

                Despesas:
                ${c.despesas ?? 0} MT

                <br>

                Retirado:
                ${c.retirado ?? 0} MT

                <br><br>

                <b>
                    Saldo:
                    ${c.saldo ?? 0} MT
                </b>

                ${botao}

            </div>

        `;

    });


    await carregarHistoricoGeral();

}


// =====================================
// CARREGAR MINHA CAIXA
// =====================================

// =====================================
// CARREGAR MINHA CAIXA
// =====================================

async function carregarMinhaCaixa(usuario_id){

    try{

        const resposta = await fetch(
            `/caixa/minha/${usuario_id}`
        );

        if(!resposta.ok){
            throw new Error("Erro ao carregar caixa");
        }

        const dados = await resposta.json();

        const area = document.getElementById(
            "lista-caixas"
        );

        area.innerHTML = `

        <div class="caixa-item">

            <h4>Minha Caixa</h4>

            Vendas:
            ${dados.vendas ?? 0} MT

            <br>

            Despesas:
            ${dados.despesas ?? 0} MT

            <br>

            Retirado:
            ${dados.retirado ?? 0} MT

            <br><br>

            <b>
                Saldo:
                ${dados.saldo_atual ?? 0} MT
            </b>

        </div>

        `;

        // Guarda todo o histórico para o filtro
        historicoCompleto = Array.isArray(dados.movimentos)
            ? dados.movimentos
            : [];

        // Mostra todo o histórico
        montarHistoricoCaixa(historicoCompleto);

        // Se existir texto digitado no filtro,
        // aplica automaticamente
        const filtro = document.getElementById("filtro-historico");

        if(filtro && filtro.value.trim() !== ""){
            filtrarHistorico();
        }

    }
    catch(erro){

        console.error(erro);

        document.getElementById(
            "lista-caixas"
        ).innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar a caixa.
            </div>
        `;

    }

}

// =====================================
// FILTRO HISTÓRICO EM TEMPO REAL
// =====================================

function filtrarHistorico(){

    const texto = document
        .getElementById(
            "filtro-historico"
        )
        .value
        .toLowerCase()
        .trim();



    if(texto === ""){

        montarHistoricoCaixa(
            historicoCompleto
        );

        return;

    }



    const filtrado =
        historicoCompleto.filter(item => {


        const nome =
            String(item.nome ?? "")
            .toLowerCase();


        const tipo =
            String(item.tipo ?? "")
            .toLowerCase();


        const valor =
            String(item.valor ?? "")
            .toLowerCase();


        const observacao =
            String(item.observacao ?? "")
            .toLowerCase();


        const data =
            item.data
            ?
            new Date(item.data)
            .toLocaleString()
            .toLowerCase()
            :
            "";



        return (

            nome.includes(texto) ||

            tipo.includes(texto) ||

            valor.includes(texto) ||

            observacao.includes(texto) ||

            data.includes(texto)

        );


    });



    montarHistoricoCaixa(
        filtrado
    );

}

// =====================================
// ABRIR RECOLHA
// =====================================

let vendedorSelecionado=null;



function abrirRecolha(id,nome){


    vendedorSelecionado=id;



    document
    .getElementById(
        "nome-vendedor-recolha"
    )
    .innerText=nome;



    document
    .getElementById(
        "area-recolha-caixa"
    )
    .style.display="flex";


}





// =====================================
// FECHAR POPUPS
// =====================================

function fecharOperacaoCaixa(){


    document
    .getElementById(
        "area-recolha-caixa"
    )
    .style.display="none";



    document
    .getElementById(
        "area-retirada-caixa"
    )
    .style.display="none";


}





// =====================================
// RECOLHER DINHEIRO
// =====================================

async function recolherDinheiro(){


    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );



    const valor =
    Number(
        document
        .getElementById(
            "caixa-valor-recolha"
        )
        .value
    );



    const observacao =
    document
    .getElementById(
        "caixa-observacao"
    )
    .value;



    const resposta =
    await fetch(

    `/caixa/recolher?usuario_id=${usuario.id}`,

    {

        method:"POST",

        headers:{

            "Content-Type":
            "application/json"

        },

        body:JSON.stringify({

            vendedor_id:
            vendedorSelecionado,

            valor:valor,

            observacao:observacao

        })

    }

    );



    const dados =
    await resposta.json();



    if(!resposta.ok){

        alert(
            dados.detail
        );

        return;

    }
    fecharOperacaoCaixa();
    await atualizarCaixa();


}





// =====================================
// ABRIR RETIRADA
// =====================================

function abrirRetirada(){


    document
    .getElementById(
        "area-retirada-caixa"
    )
    .style.display="flex";


}





// =====================================
// RETIRAR
// =====================================

async function retirarCaixa(){


    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );



    const valor =
    Number(
        document
        .getElementById(
            "caixa-valor-retirada"
        )
        .value
    );



    const observacao =
    document
    .getElementById(
        "caixa-observacao-retirada"
    )
    .value;



    const resposta =
    await fetch(

    `/caixa/retirar?usuario_id=${usuario.id}`,

    {

        method:"POST",

        headers:{

            "Content-Type":
            "application/json"

        },


        body:JSON.stringify({

            valor:valor,

            observacao:observacao

        })

    }

    );



    const dados =
    await resposta.json();



    if(!resposta.ok){

        alert(
            dados.detail
        );

        return;

    }

    fecharOperacaoCaixa();
    await atualizarCaixa();
}


// =====================================
// HISTÓRICO
// =====================================

function montarHistoricoCaixa(lista){

    const tabela =
        document.getElementById(
            "lista-movimentos-caixa"
        );


    if(!tabela){

        console.error(
            "Elemento lista-movimentos-caixa não encontrado."
        );

        return;

    }


    tabela.innerHTML = "";


    if(
        !Array.isArray(lista) ||
        lista.length === 0
    ){

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="text-center text-muted"
                >

                    Nenhum movimento

                </td>

            </tr>

        `;

        return;

    }


    lista.forEach(item => {


        // =====================================
        // TIPO DO MOVIMENTO
        // =====================================

        const tipoMovimento =
            String(
                item.tipo ?? ""
            )
            .trim()
            .toLowerCase();


        // =====================================
        // NOME
        // =====================================

        let nomeExibicao;


        // =====================================
        // DESPESA
        //
        // Mostrar o nome de quem criou
        // a despesa.
        // =====================================

        if(
            tipoMovimento === "despesa"
        ){

            const nomeCriador =
                item.solicitante_nome ??
                item.usuario_nome ??
                item.nome_usuario ??
                item.criado_por_nome ??
                item.nome ??
                "Não informado";


            const idDespesa =
                item.despesa_id ??
                item.id_despesa ??
                item.despesaId ??
                item.id;


            nomeExibicao = `

                ${escaparHtml(nomeCriador)}

                ${
                    idDespesa !== null &&
                    idDespesa !== undefined &&
                    idDespesa !== ""
                    ?

                    `
                        <br>

                        <small class="text-muted">

                            ID da despesa:
                            ${escaparHtml(idDespesa)}

                        </small>
                    `

                    :

                    ""
                }

            `;

        }


        // =====================================
        // OUTROS MOVIMENTOS
        // =====================================

        else{

            nomeExibicao =
                escaparHtml(
                    item.nome ?? "-"
                );

        }


        // =====================================
        // TIPO
        // =====================================

        const tipoExibicao =
            escaparHtml(
                item.tipo ?? "-"
            );


        // =====================================
        // VALOR
        // =====================================

        const valor =
            item.valor ?? 0;


        // =====================================
        // DATA
        // =====================================

        const data =
            item.data

            ?

            new Date(
                item.data
            ).toLocaleString()

            :

            "-";


        // =====================================
        // OBSERVAÇÃO
        // =====================================

        const observacao =
            escaparHtml(
                item.observacao ?? ""
            );


        // =====================================
        // MOSTRAR LINHA
        // =====================================

        tabela.innerHTML += `

            <tr>

                <td>

                    ${nomeExibicao}

                </td>


                <td>

                    ${tipoExibicao}

                </td>


                <td>

                    ${valor} MT

                </td>


                <td>

                    ${data}

                </td>


                <td>

                    ${observacao}

                </td>

            </tr>

        `;

    });

}
async function atualizarCaixa() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) return;

    if (usuario.tipo === "admin" || usuario.tipo === "gerente") {
        await carregarTodasCaixas();
    } else {
        await carregarMinhaCaixa(usuario.id);
    }
}

async function carregarHistoricoGeral(){

    const usuario = JSON.parse(
        localStorage.getItem("usuario")
    );

    const resposta = await fetch(
        `/caixa/historico?usuario_id=${usuario.id}`
    );

    if(!resposta.ok){
        console.error("Erro ao carregar histórico");
        return;
    }

    historicoCompleto = await resposta.json();

    montarHistoricoCaixa(historicoCompleto);
}


// =====================================
// DEBUG + SALDO DO CAIXA NO DASHBOARD
// =====================================

// =====================================
// SALDO DO CAIXA NO DASHBOARD
// =====================================

window.atualizarSaldoCaixaDashboard = async function(){

    console.log("=====================================");
    console.log(" INICIANDO SALDO DO CAIXA");
    console.log("=====================================");

    // =====================================
    // 1. USUARIO
    // =====================================

    const usuarioStorage =
        localStorage.getItem("usuario");

    if(!usuarioStorage){

        console.error(
            "ERRO: usuario não existe no localStorage"
        );

        return;
    }

    let usuario;

    try{

        usuario =
            JSON.parse(usuarioStorage);

    }
    catch(erro){

        console.error(
            "ERRO AO LER USUARIO:",
            erro
        );

        return;
    }

    console.log("USUARIO:", usuario);
    console.log("ID:", usuario.id);
    console.log("TIPO:", usuario.tipo);


    // =====================================
    // 2. ELEMENTOS
    // =====================================

    const saldoElemento =
        document.getElementById(
            "saldo-caixa"
        );

    if(!saldoElemento){

        console.error(
            "ERRO: #saldo-caixa não existe"
        );

        return;
    }

    const detalhesElemento =
        document.getElementById(
            "ver-detalhes-caixa"
        );


    try{

        // =====================================
        // VENDEDOR
        // =====================================

        if(
            usuario.tipo !== "admin" &&
            usuario.tipo !== "gerente"
        ){

            console.log(
                "====================================="
            );

            console.log(
                " MODO VENDEDOR"
            );

            console.log(
                "=====================================");


            const url =
                API +
                "/caixa/minha/" +
                usuario.id;


            console.log(
                "URL MINHA CAIXA:",
                url
            );


            const resposta =
                await fetch(url);


            console.log(
                "STATUS:",
                resposta.status
            );


            if(!resposta.ok){

                const erroTexto =
                    await resposta.text();

                console.error(
                    "ERRO BACKEND:",
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
                "DADOS DA MINHA CAIXA:",
                dados
            );


            // =====================================
            // MOSTRAR TODOS OS CAMPOS RECEBIDOS
            // =====================================

            console.log(
                "VENDAS:",
                dados.vendas
            );

            console.log(
                "DESPESAS:",
                dados.despesas
            );

            console.log(
                "RETIRADO:",
                dados.retirado
            );

            console.log(
                "SALDO_ATUAL:",
                dados.saldo_atual
            );


            // =====================================
            // SALDO DO VENDEDOR
            // =====================================

            const saldo =
                Number(
                    dados.saldo_atual ?? 0
                );


            console.log(
                "SALDO FINAL DO VENDEDOR:",
                saldo
            );


            saldoElemento.innerText =
                saldo.toFixed(2) +
                " MT";


            // =====================================
            // VENDEDOR NÃO VÊ DETALHES GERAIS
            // =====================================

            if(detalhesElemento){

                detalhesElemento.style.display =
                    "none";
            }


            console.log(
                "SALDO DO VENDEDOR ATUALIZADO:",
                saldoElemento.innerText
            );


            return;
        }


        // =====================================
        // ADMIN / GERENTE
        // =====================================

        console.log(
            "====================================="
        );

        console.log(
            " MODO ADMIN / GERENTE"
        );

        console.log(
            "====================================="
        );


        const url =
            API +
            "/caixa/todas?usuario_id=" +
            usuario.id;


        console.log(
            "URL TODAS AS CAIXAS:",
            url
        );


        const resposta =
            await fetch(url);


        console.log(
            "STATUS:",
            resposta.status
        );


        if(!resposta.ok){

            const erroTexto =
                await resposta.text();

            console.error(
                "ERRO BACKEND:",
                erroTexto
            );

            throw new Error(
                "Erro HTTP " +
                resposta.status
            );
        }


        const caixas =
            await resposta.json();


        console.log(
            "CAIXAS RECEBIDAS:",
            caixas
        );


        let saldoTotal = 0;


        caixas.forEach(
            (caixa, index) => {

                console.log(
                    "CAIXA #" + index,
                    caixa
                );


                // =====================================
                // NÃO SOMAR CAIXA DO GERENTE
                // =====================================

                if(
                    caixa.tipo === "gerente"
                ){

                    console.log(
                        "CAIXA DO GERENTE IGNORADA"
                    );

                    return;
                }


                const saldoCaixa =
                    Number(
                        caixa.saldo ?? 0
                    );


                saldoTotal +=
                    saldoCaixa;

            }
        );


        console.log(
            "SALDO TOTAL ADMIN/GERENTE:",
            saldoTotal
        );


        saldoElemento.innerText =
            saldoTotal.toFixed(2) +
            " MT";


        // =====================================
        // ADMIN / GERENTE PODE VER DETALHES
        // =====================================

        if(detalhesElemento){

            detalhesElemento.style.display =
                "block";
        }


        console.log(
            "SALDO ADMIN/GERENTE ATUALIZADO:",
            saldoElemento.innerText
        );


    }
    catch(erro){

        console.error(
            "====================================="
        );

        console.error(
            "ERRO SALDO CAIXA:"
        );

        console.error(erro);

        console.error(
            "====================================="
        );


        saldoElemento.innerText =
            "0.00 MT";
    }

};