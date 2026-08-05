// =====================================================
// STOCK
// =====================================================



window.abrirStock = async function(){


    document.getElementById(
        "stock-panel"
    ).style.display="flex";



    await carregarStock();



};





window.fecharStock = function(){


    document.getElementById(
        "stock-panel"
    ).style.display="none";



};







window.carregarStock = async function(){

    try{


        const resposta =
        await fetch(
            API + "/stock/"
        );



        const produtos =
        await resposta.json();





        const tabela =
        document.getElementById(
            "lista-stock"
        );



        if(!tabela)
            return;



        tabela.innerHTML="";





        const usuario =
        JSON.parse(
            localStorage.getItem(
                "usuario"
            )
        );





        produtos.forEach(p=>{


            let estado = "";

            let classe = "";





            if(
                p.quantidade == 0
            ){


                estado =
                "Sem Stock";


                classe =
                "bg-danger";


            }



            else if(
                p.quantidade <=
                p.stock_minimo
            ){


                estado =
                "Baixo";


                classe =
                "bg-warning text-dark";


            }



            else{


                estado =
                "Normal";


                classe =
                "bg-success";


            }







            let botaoEntrada = "";





            if(
                usuario &&
                (
                    usuario.tipo === "admin" ||
                    usuario.tipo === "gerente"
                )
            ){



                botaoEntrada = `


                <button

                    class="btn btn-success btn-sm"

                    onclick="abrirEntradaStock(
                    ${p.id},
                    '${p.nome}'
                    )">


                    <i class="bi bi-plus-circle"></i>


                    Entrada


                </button>


                `;



            }







            tabela.innerHTML += `


            <tr>



                <td>

                    ${p.id}

                </td>




                <td>

                    ${p.nome}

                </td>




                <td>

                    ${p.categoria_id}

                </td>




                <td>

                    ${p.quantidade}

                </td>




                <td>

                    ${p.stock_minimo}

                </td>




                <td>


                    <span class="badge ${classe}">

                        ${estado}

                    </span>


                </td>




                <td>

                    ${botaoEntrada}

                </td>



            </tr>


            `;




        });




    }


    catch(error){



        console.error(error);



        alert(
            "Erro ao carregar stock"
        );



    }



};








window.abrirEntradaStock = function(
id,
nome
){

    document.getElementById(
        "entrada-produto-id"
    ).value=id;



    document.getElementById(
        "entrada-produto"
    ).value=nome;



    document.getElementById(
        "entrada-quantidade"
    ).value="";



    document.getElementById(
        "entrada-stock-panel"
    ).style.display="flex";



};



window.fecharEntradaStock = function(){

    document.getElementById(
        "entrada-stock-panel"
    ).style.display="none";



};








window.salvarEntradaStock = async function(){

    const id =
    document.getElementById(
        "entrada-produto-id"
    ).value;




    const quantidade =
    document.getElementById(
        "entrada-quantidade"
    ).value;





    if(
        !quantidade ||
        quantidade <= 0
    ){



        alert(
            "Informe uma quantidade válida."
        );


        return;


    }






    const resposta =
    await fetch(

        API +
        "/stock/entrada/" +
        id +
        "?quantidade=" +
        quantidade,

        {

            method:"PUT"

        }

    );






    const resultado =
    await resposta.json();






    if(resposta.ok){



        alert(
            resultado.mensagem
        );



        fecharEntradaStock();



        await carregarStock();



        await carregarDashboard();



    }


    else{



        alert(
            resultado.detail ||
            "Erro ao atualizar stock"
        );



    }




};

// =====================================================
// CONTROLAR MENU STOCK
// =====================================================

window.mostrarStock = function(valor){

    const menuStock = document.getElementById(
        "menu-stock"
    );


    if(!menuStock)
        return;


    if(valor){

        menuStock.style.display = "flex";
        menuStock.style.visibility = "visible";
        menuStock.style.opacity = "1";

    }
    else{

        menuStock.style.display = "none";

    }

};

