// =====================================================
// CATEGORIAS
// =====================================================



async function abrirCategorias(){


    document.getElementById(
        "categorias-panel"
    ).style.display="flex";



    await carregarCategorias();



}






function fecharCategorias(){


    document.getElementById(
        "categorias-panel"
    ).style.display="none";



    fecharFormularioCategoria();



}






function mostrarFormularioCategoria(){


    document.getElementById(
        "form-categoria"
    ).style.display="block";



}






function fecharFormularioCategoria(){



    document.getElementById(
        "form-categoria"
    ).style.display="none";



    document.getElementById(
        "categoria-id"
    ).value="";



    document.getElementById(
        "categoria-nome"
    ).value="";



    document.getElementById(
        "categoria-descricao"
    ).value="";



}







async function carregarCategorias(){



    try{



        const resposta =
        await fetch(
            API + "/categorias/"
        );



        const categorias =
        await resposta.json();




        const tabela =
        document.getElementById(
            "lista-categorias"
        );



        if(!tabela)
            return;



        tabela.innerHTML="";




        categorias.forEach(c=>{


            tabela.innerHTML += `

            <tr>


                <td>
                    ${c.nome}
                </td>



                <td>
                    ${c.descricao ?? ""}
                </td>



                <td>


                    <button
                    class="btn btn-warning btn-sm"
                    onclick="editarCategoria(
                    ${c.id},
                    '${c.nome}',
                    '${c.descricao ?? ""}'
                    )">


                    <i class="bi bi-pencil"></i>


                    </button>





                    <button
                    class="btn btn-danger btn-sm"
                    onclick="apagarCategoria(${c.id})">


                    <i class="bi bi-trash"></i>


                    </button>



                </td>


            </tr>


            `;



        });




    }

    catch(error){


        console.error(error);



        alert(
            "Erro ao carregar categorias"
        );


    }



}







async function salvarCategoria(){



    const id =
    document.getElementById(
        "categoria-id"
    ).value;




    const dados = {


        nome:
        document.getElementById(
            "categoria-nome"
        ).value,



        descricao:
        document.getElementById(
            "categoria-descricao"
        ).value


    };





    let url;

    let metodo;






    if(id){



        url =
        API +
        "/categorias/" +
        id;



        metodo =
        "PUT";



    }

    else{



        url =
        API +
        "/categorias/";



        metodo =
        "POST";


    }







    try{



        const resposta =
        await fetch(
            url,
            {


                method:metodo,


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



            alert(

                id ?

                "Categoria atualizada com sucesso"

                :

                "Categoria criada com sucesso"

            );



            fecharFormularioCategoria();



            carregarCategorias();



        }

        else{



            alert(
                resultado.detail ||
                "Erro ao salvar categoria"
            );



        }




    }

    catch(error){


        console.error(error);



        alert(
            "Erro de conexão"
        );


    }





}








function editarCategoria(
id,
nome,
descricao
){



    document.getElementById(
        "categoria-id"
    ).value=id;



    document.getElementById(
        "categoria-nome"
    ).value=nome;



    document.getElementById(
        "categoria-descricao"
    ).value=descricao;



    mostrarFormularioCategoria();



}







async function apagarCategoria(id){



    if(!confirm(
        "Deseja apagar esta categoria?"
    ))

    return;





    const resposta =
    await fetch(

        API +
        "/categorias/" +
        id,

        {

            method:"DELETE"

        }

    );





    const resultado =
    await resposta.json();





    if(resposta.ok){



        alert(
            "Categoria apagada"
        );



        await carregarCategorias();



    }

    else{



        alert(
            resultado.detail ||
            "Erro ao apagar"
        );



    }



}
