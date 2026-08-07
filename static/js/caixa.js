// =====================================
// ABRIR MODAL CAIXA
// =====================================
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



    const resposta =
    await fetch(
        `/caixa/todas?usuario_id=${usuario.id}`
    );



    const caixas =
    await resposta.json();



    const area =
    document.getElementById(
        "lista-caixas"
    );



    area.innerHTML="";



    caixas.forEach(c=>{
        if (c.tipo === "gerente") {
            return;
        }

        let botao="";



        // ADMIN NA SUA PRÓPRIA CAIXA

        if(
            c.usuario_id == usuario.id
            &&
            usuario.tipo=="admin"
        ){

            botao=`

            <button

            class="btn btn-warning w-100 mt-2"

            onclick="abrirRetirada()">


            Retirar


            </button>

            `;

        }



        // OUTROS USUÁRIOS

        else if(
            usuario.tipo=="admin"
            ||
            usuario.tipo=="gerente"
        ){

            botao=`

            <button

            class="btn btn-danger w-100 mt-2"

            onclick="abrirRecolha(
                ${c.usuario_id},
                '${c.nome}'
            )">


            Recolher


            </button>

            `;

        }




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

    const tabela = document.getElementById(
        "lista-movimentos-caixa"
    );


    tabela.innerHTML = "";


    if(
        !Array.isArray(lista) ||
        lista.length === 0
    ){

        tabela.innerHTML = `

        <tr>
            <td colspan="5">
                Nenhum movimento
            </td>
        </tr>

        `;

        return;
    }



    lista.forEach(item => {


        tabela.innerHTML += `

        <tr>

            <td>
                ${item.nome ?? "-"}
            </td>


            <td>
                ${item.tipo ?? "-"}
            </td>


            <td>
                ${item.valor ?? 0} MT
            </td>


            <td>
                ${
                    item.data
                    ?
                    new Date(item.data)
                    .toLocaleString()
                    :
                    "-"
                }
            </td>


            <td>
                ${item.observacao ?? ""}
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
