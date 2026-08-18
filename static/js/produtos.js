// =====================================================
// PRODUTOS
// =====================================================



async function abrirProdutos(){


    document.getElementById(
        "produtos-panel"
    ).style.display="flex";



    await carregarCategoriasProduto();


    await carregarProdutos();



}






async function carregarCategoriasProduto(){


    try{


        const resposta =
        await fetch(
            API + "/categorias/"
        );



        const categorias =
        await resposta.json();




        const select =
        document.getElementById(
            "produto-categoria"
        );



        if(!select)
            return;




        select.innerHTML = `

        <option value="">
            Selecionar categoria
        </option>

        `;




        categorias.forEach(c=>{


            select.innerHTML += `

            <option value="${c.id}">

                ${c.nome}

            </option>

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







async function carregarProdutos(){


    try{


        const resposta =
        await fetch(
            API + "/produtos/"
        );



        const produtos =
        await resposta.json();




        const tabela =
        document.getElementById(
            "lista-produtos"
        );



        if(!tabela)
            return;



        tabela.innerHTML="";





        produtos.forEach(p=>{



            tabela.innerHTML += `


            <tr>


                <td>
                    ${p.id}
                </td>



                <td>
                    ${p.categoria_id}
                </td>



                <td>
                    ${p.nome}
                </td>



                <td>
                    ${p.descricao ?? ""}
                </td>



                <td>
                    ${Number(
                    p.preco_compra
                    ).toFixed(2)} MT
                </td>



                <td>
                    ${Number(
                    p.preco_venda
                    ).toFixed(2)} MT
                </td>



                <td>
                    ${p.quantidade}
                </td>



                <td>
                    ${p.stock_minimo}
                </td>



                <td>
                    ${p.unidade}
                </td>



                <td>

                ${
                    p.ativo

                    ?

                    '<span class="badge bg-success">Ativo</span>'

                    :

                    '<span class="badge bg-danger">Inativo</span>'

                }


                </td>




                <td>

                    ${new Date(
                    p.criado_em
                    )
                    .toLocaleDateString("pt-PT")}


                </td>





                <td>


                    <button
                    class="btn btn-warning btn-sm"
                    onclick="editarProduto(
                    ${p.id},
                    ${p.categoria_id},
                    '${p.nome}',
                    '${p.descricao ?? ""}',
                    ${p.preco_compra},
                    ${p.preco_venda},
                    ${p.quantidade},
                    ${p.stock_minimo},
                    '${p.unidade}'
                    )">


                    <i class="bi bi-pencil"></i>


                    </button>





                    <button
                    class="btn btn-danger btn-sm"
                    onclick="apagarProduto(${p.id})">


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
            "Erro ao carregar produtos"
        );


    }



}








async function salvarProduto(){



    const id =
    document.getElementById(
        "produto-id"
    ).value;




    const dados = {



        categoria_id:
        Number(
            document.getElementById(
                "produto-categoria"
            ).value
        ),




        nome:
        document.getElementById(
            "produto-nome"
        ).value,




        descricao:
        document.getElementById(
            "produto-descricao"
        ).value,




        preco_compra:
        document.getElementById(
            "produto-compra"
        ).value,




        preco_venda:
        document.getElementById(
            "produto-venda"
        ).value,




        quantidade:
        Number(
            document.getElementById(
                "produto-quantidade"
            ).value
        ),




        stock_minimo:
        Number(
            document.getElementById(
                "produto-minimo"
            ).value
        ),




        unidade:
        document.getElementById(
            "produto-unidade"
        ).value


    };






    let url;

    let metodo;





    if(id){



        url =
        API +
        "/produtos/" +
        id;



        metodo =
        "PUT";



    }

    else{


        url =
        API +
        "/produtos/";



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

                "Produto atualizado"

                :

                "Produto cadastrado"

            );



            fecharFormularioProduto();



            await carregarProdutos();



        }

        else{


            alert(
                resultado.detail ||
                "Erro ao salvar produto"
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








function editarProduto(
id,
categoria,
nome,
descricao,
compra,
venda,
quantidade,
minimo,
unidade
){



    document.getElementById(
        "produto-id"
    ).value=id;



    document.getElementById(
        "produto-categoria"
    ).value=categoria;



    document.getElementById(
        "produto-nome"
    ).value=nome;



    document.getElementById(
        "produto-descricao"
    ).value=descricao;



    document.getElementById(
        "produto-compra"
    ).value=compra;



    document.getElementById(
        "produto-venda"
    ).value=venda;



    document.getElementById(
        "produto-quantidade"
    ).value=quantidade;



    document.getElementById(
        "produto-minimo"
    ).value=minimo;



    document.getElementById(
        "produto-unidade"
    ).value=unidade;



    document.getElementById(
        "form-produto"
    ).style.display="block";



}







async function apagarProduto(id){



    if(!confirm(
        "Deseja apagar este produto?"
    ))

    return;





    const resposta =
    await fetch(

        API +
        "/produtos/" +
        id,

        {

            method:"DELETE"

        }

    );





    const resultado =
    await resposta.json();





    if(resposta.ok){



        alert(
            "Produto apagado"
        );



        carregarProdutos();



    }

    else{


        alert(
            resultado.detail ||
            "Erro ao apagar"
        );


    }



}








function fecharProdutos(){



    document.getElementById(
        "produtos-panel"
    ).style.display="none";



    fecharFormularioProduto();



}








function mostrarFormularioProduto(){



    document.getElementById(
        "form-produto"
    ).style.display="block";



}








function fecharFormularioProduto(){



    document.getElementById(
        "form-produto"
    ).style.display="none";



    document.getElementById(
        "produto-id"
    ).value="";



    document.getElementById(
        "produto-categoria"
    ).value="";



    document.getElementById(
        "produto-nome"
    ).value="";



    document.getElementById(
        "produto-descricao"
    ).value="";



    document.getElementById(
        "produto-compra"
    ).value="";



    document.getElementById(
        "produto-venda"
    ).value="";



    document.getElementById(
        "produto-quantidade"
    ).value="0";



    document.getElementById(
        "produto-minimo"
    ).value="5";



    document.getElementById(
        "produto-unidade"
    ).value="unidade";



}
