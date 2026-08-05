// =====================================================
// ABRIR ÁREA DE DESPESAS
// =====================================================

window.abrirDespesas = function(){

    const modal =
    document.getElementById(
        "modal-despesas"
    );


    if(modal){

        modal.style.display = "flex";

        configurarPermissaoDespesas();

    }

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


    if(!usuario)
        return;



    const formulario =
    document.getElementById(
        "formulario-despesa"
    );


    const botao =
    document.getElementById(
        "btn-nova-despesa"
    );




    // ==========================
    // ADMIN / GERENTE
    // ==========================

    if(
        usuario.tipo === "admin" ||
        usuario.tipo === "gerente"
    ){


        if(formulario){

            formulario.style.display =
            "none";

        }


        if(botao){

            botao.style.display =
            "none";

        }


        carregarSolicitacoesDespesas();


    }



    // ==========================
    // VENDEDOR
    // ==========================

    else{


        if(botao){

            botao.style.display =
            "block";


            botao.innerHTML =
            `
            <i class="bi bi-send"></i>
            Solicitar despesa
            `;

        }


        carregarMinhasDespesas();


    }


}







// =====================================================
// CARREGAR DESPESAS DO VENDEDOR
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



        mostrarTabelaDespesas(
            dados,
            false
        );


    }
    catch(error){


        console.error(
            "Erro:",
            error
        );


    }


}







// =====================================================
// ADMIN / GERENTE - PENDENTES
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



        mostrarTabelaDespesas(
            dados,
            true
        );


    }
    catch(error){


        console.error(
            "Erro solicitações:",
            error
        );


    }


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


    if(!lista)
        return;



    if(!Array.isArray(dados)){


        lista.innerHTML =
        `
        <div class="alert alert-danger">
        Erro ao carregar despesas
        </div>
        `;


        return;

    }



    let html = `


    <table class="table table-bordered">


    <thead>

    <tr>

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

    `;



    if(admin){

        html +=

        `
        <th>
        Ação
        </th>
        `;

    }



    html +=

    `
    </tr>

    </thead>

    <tbody>
    `;





    dados.forEach(d=>{


        html +=

        `

        <tr data-id="${d.id}">


        <td class="descricao">
        ${d.descricao}
        </td>



        <td class="categoria">
        ${d.categoria}
        </td>




        <td class="valor">

        ${

        Number(
            d.valor_proposto
        ).toFixed(2)

        }
        MT

        </td>




        <td>

        ${
            d.valor_aprovado == null

            ?

            "-"

            :

            Number(
                d.valor_aprovado
            ).toFixed(2)
            +" MT"

        }

        </td>




        <td>
        ${d.estado}
        </td>



        <td>

        ${
        new Date(
            d.data_despesa
        ).toLocaleDateString()

        }

        </td>


        `;




        if(admin){

            if(d.estado === "pendente"){

                html +=
                `
                <td>

                <button
                class="btn btn-success btn-sm"
                onclick="aprovarDespesa(${d.id})">

                Aprovar

                </button>

                </td>
                `;

            }
            else{

                html +=
                `
                <td>
                Aprovada
                </td>
                `;

            }

        }
        else if(d.estado === "pendente"){


            html +=


            `

            <td>


            <button
            class="btn btn-warning btn-sm"
            onclick="editarDespesa(${d.id})">

            Editar

            </button>



            <button
            class="btn btn-danger btn-sm"
            onclick="
            apagarDespesa(${d.id})
            ">

            Apagar

            </button>


            </td>

            `;


        }
        else{


            html +=


            `

            <td>

            </td>

            `;


        }



        html +=

        `

        </tr>

        `;


    });





    html +=

    `

    </tbody>

    </table>

    `;



    lista.innerHTML = html;


}




window.salvarEdicaoDespesa = async function(id){


    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );


    const dados = {

        descricao:
        document.getElementById(
            "edit-desc-"+id
        ).value,


        categoria:
        document.getElementById(
            "edit-cat-"+id
        ).value,


        valor_proposto:
        Number(
            document.getElementById(
                "edit-val-"+id
            ).value
        )

    };



    const resposta =
    await fetch(

        API +
        "/despesas/" +
        id +
        "?usuario_id=" +
        usuario.id,

        {

            method:"PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(dados)

        }

    );


    if(resposta.ok){

        carregarMinhasDespesas();

    }

};



// =====================================================
// ABRIR FORMULÁRIO VENDEDOR
// =====================================================

window.abrirFormularioDespesa=function(){


    const formulario =
    document.getElementById(
        "formulario-despesa"
    );


    if(formulario){

        formulario.style.display =
        "block";

    }


};








// =====================================================
// SALVAR SOLICITAÇÃO
// =====================================================

window.salvarDespesa = async function(){


    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );


    if(!usuario)
        return;



    const dados = {


        usuario_id:
        usuario.id,


        descricao:
        document.getElementById(
            "despesa-descricao"
        ).value,


        categoria:
        document.getElementById(
            "despesa-categoria"
        ).value,


        valor_proposto:
        Number(
            document.getElementById(
                "despesa-valor"
            ).value
        ),



        observacao:
        document.getElementById(
            "despesa-observacao"
        ).value


    };





    const resposta =
    await fetch(

        API +
        "/despesas/solicitar",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:
            JSON.stringify(dados)

        }

    );





    const resultado =
    await resposta.json();





    if(resposta.ok){

        carregarMinhasDespesas();

    }
    else{

        console.error(
            resultado.detail
        );

    }
};







// =====================================================
// APROVAR DESPESA
// =====================================================

// =====================================================
// APROVAR DESPESA NA TABELA
// =====================================================

window.aprovarDespesa = function(id){

    const linha =
    document.querySelector(
        `tr[data-id="${id}"]`
    );


    if(!linha)
        return;



    const valorAtual =
    linha.children[3].innerText
    .replace(" MT","")
    .trim();



    linha.children[3].innerHTML = `

    <input
    type="number"
    class="form-control"
    id="valor-aprovado-${id}"
    value="${valorAtual === "-" ? "" : valorAtual}">

    `;



    linha.children[6].innerHTML = `

    <button
    class="btn btn-success btn-sm"
    onclick="guardarAprovacaoDespesa(${id})">

    Guardar

    </button>

    `;

};
// =====================================================
// GUARDAR APROVAÇÃO
// =====================================================

window.guardarAprovacaoDespesa = async function(id){

    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );


    const valor =
    Number(
        document.getElementById(
            "valor-aprovado-"+id
        ).value
    );



    const resposta =
    await fetch(

        API +
        "/despesas/" +
        id +
        "/aprovar?usuario_id=" +
        usuario.id,

        {

            method:"PUT",

            headers:{
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



    if(resposta.ok){

        carregarSolicitacoesDespesas();

    }
    else{

        console.error(
            dados.detail
        );

    }

};
// =====================================================
// EDITAR DESPESA PENDENTE
// =====================================================

window.editarDespesa = function(id){


    const linha =
    document.querySelector(
        `tr[data-id="${id}"]`
    );


    if(!linha)
        return;



    const descricao =
    linha.querySelector(".descricao").innerText;


    const categoria =
    linha.querySelector(".categoria").innerText;


    const valor =
    linha.querySelector(".valor").innerText.replace(" MT","");



    linha.innerHTML = `


    <td>

    <input
    class="form-control"
    id="edit-desc-${id}"
    value="${descricao}">

    </td>



    <td>

    <input
    class="form-control"
    id="edit-cat-${id}"
    value="${categoria}">

    </td>



    <td>

    <input
    class="form-control"
    id="edit-val-${id}"
    value="${valor}">

    </td>



    <td>
    -
    </td>



    <td>
    pendente
    </td>



    <td>

    <button
    class="btn btn-success btn-sm"
    onclick="salvarEdicaoDespesa(${id})">

    Guardar

    </button>


    </td>


    `;


};
// =====================================================
// APAGAR DESPESA PENDENTE
// =====================================================

window.apagarDespesa = async function(id){


    const confirmar =
    confirm(
        "Deseja apagar esta solicitação?"
    );


    if(!confirmar)
        return;



    const usuario =
    JSON.parse(
        localStorage.getItem("usuario")
    );



    const resposta =
    await fetch(

        API +
        "/despesas/" +
        id +
        "?usuario_id=" +
        usuario.id,

        {

            method:"DELETE"

        }

    );



    const dados =
    await resposta.json();



    if(resposta.ok){

        carregarMinhasDespesas();

    }
    else{

        console.error(
            dados.detail
        );

    }
};



// =====================================================
// FECHAR CLICANDO FORA
// =====================================================

window.addEventListener(
"click",
function(event){


    const modal =
    document.getElementById(
        "modal-despesas"
    );


    if(event.target === modal){

        fecharDespesas();

    }


});