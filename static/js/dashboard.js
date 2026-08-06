// dashboard.js
let vendasVendedoresCache = [];

async function carregarDashboard() {

    try {

        let urlDashboard = API + "/dashboard/";

        if(usuarioLogado && usuarioLogado.tipo === "vendedor"){

            urlDashboard += "?usuario_id=" + usuarioLogado.id;

        }


        const resposta = await fetch(urlDashboard);


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar dashboard"
            );

        }


        const dados = await resposta.json();


        console.log("STATUS:", resposta.status);
        console.log("DADOS:", dados);



        // ============================
        // BOTÃO LOGIN
        // ============================

        const botaoLogin =
        document.getElementById(
            "login-button"
        );


        if(botaoLogin){

            if(usuarioLogado){

                // usuário logado: esconder botão

                botaoLogin.style.display = "none";

            }
            else{

                // sem usuário: mostrar login

                botaoLogin.style.display = "block";

                botaoLogin.onclick =
                abrirLogin;

            }

        }
        // ============================
        // VENDAS DO DIA
        // ============================







        // ============================
        // STOCK
        // ============================


        const stock =
        dados.stock || {};



        const totalStock =
        document.getElementById(
            "total-stock"
        );


        if(totalStock){

            totalStock.innerText =
            stock.total ?? 0;

        }



        const produtosNovos =
        document.getElementById(
            "produtos-novos"
        );


        if(produtosNovos){

            produtosNovos.innerText =
            stock.produtos_novos ?? 0;

        }



        const baixoStock =
        document.getElementById(
            "baixo-stock"
        );


        if(baixoStock){

            baixoStock.innerText =
            stock.baixo_stock_total ?? 0;

        }




        // ============================
        // LUCRO
        // ============================


        const lucroHoje =
        document.getElementById(
            "lucro-hoje"
        );


        if(lucroHoje){

            lucroHoje.innerText =
            `${Number(
                dados.lucro_hoje || 0
            ).toFixed(2)} MT`;

        }




        // ============================
        // DESPESAS
        // ============================


        const despesasHoje =
        document.getElementById(
            "despesas-hoje"
        );


        if(despesasHoje){

            despesasHoje.innerText =
            `${Number(
                dados.despesas_hoje || 0
            ).toFixed(2)} MT`;

        }




        // ============================
        // ALERTAS STOCK
        // ============================


        const lista =
        document.getElementById(
            "baixo-stock-list"
        );



        if(lista){


            lista.innerHTML = "";



            if(
                Array.isArray(stock.baixo_stock)
                &&
                stock.baixo_stock.length > 0
            ){



                stock.baixo_stock.forEach(produto=>{


                    lista.innerHTML += `

                    <div class="alert-item">


                        <div>

                            <strong>
                            ${produto.nome}
                            </strong>

                            <br>

                            <small>

                            ${produto.quantidade}
                            /
                            mínimo
                            ${produto.stock_minimo}

                            </small>


                        </div>



                        <span class="badge bg-danger">

                            Baixo Stock

                        </span>


                    </div>


                    `;


                });



            }
            else{


                lista.innerHTML = `

                <div class="alert alert-success mb-0">

                    Nenhum produto com baixo stock.

                </div>

                `;


            }


        }



    }
    catch(error){


        console.error(
            "ERRO DASHBOARD:",
            error
        );


    }


}





// =====================================================
// CARREGAR DASHBOARD
// =====================================================


window.carregarDashboard = async function(){


    try{


        let urlDashboard =
        API + "/dashboard/";


        if(
            usuarioLogado &&
            usuarioLogado.tipo === "vendedor"
        ){

            urlDashboard +=
            "?usuario_id=" + usuarioLogado.id;

        }



        const resposta =
        await fetch(urlDashboard);



        if(!resposta.ok){

            throw new Error(
                "Erro ao carregar dashboard"
            );

        }



        const dados =
        await resposta.json();



        console.log(
            "DADOS DASHBOARD:",
            dados
        );

        // =====================================
        // MOSTRAR VER DETALHES DAS VENDAS
        // ADMIN E GERENTE
        // =====================================

        const verDetalhesVendas =
        document.getElementById(
            "ver-detalhes-vendas"
        );


        if(verDetalhesVendas){


            if(
                usuarioLogado &&
                (
                    usuarioLogado.tipo === "admin" ||
                    usuarioLogado.tipo === "gerente"
                )
            ){

                verDetalhesVendas.style.display = "block";

            }
            else{

                verDetalhesVendas.style.display = "none";

            }

        }



        // ============================
        // BOTÃO LOGIN
        // ============================


        const botaoLogin =
        document.getElementById(
            "login-button"
        );



        if(botaoLogin){


            if(usuarioLogado){

                botaoLogin.style.display =
                "none";

            }
            else{

                botaoLogin.style.display =
                "block";

                botaoLogin.onclick =
                abrirLogin;

            }

        }





        // ============================
        // STOCK
        // ============================


        const stock =
        dados.stock || {};



        const totalStock =
        document.getElementById(
            "total-stock"
        );


        if(totalStock){

            totalStock.innerText =
            stock.total ?? 0;

        }



        const produtosNovos =
        document.getElementById(
            "produtos-novos"
        );


        if(produtosNovos){

            produtosNovos.innerText =
            stock.produtos_novos ?? 0;

        }



        const baixoStock =
        document.getElementById(
            "baixo-stock"
        );


        if(baixoStock){

            baixoStock.innerText =
            stock.baixo_stock_total ?? 0;

        }





        // ============================
        // LUCRO
        // ============================


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





        // ============================
        // DESPESAS
        // ============================


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





        // ============================
        // ALERTAS STOCK
        // ============================


        const lista =
        document.getElementById(
            "baixo-stock-list"
        );


        if(lista){


            lista.innerHTML = "";



            if(
                Array.isArray(stock.baixo_stock)
                &&
                stock.baixo_stock.length > 0
            ){


                stock.baixo_stock.forEach(produto=>{


                    lista.innerHTML += `

                    <div class="alert-item">

                        <div>

                            <strong>
                            ${produto.nome}
                            </strong>

                            <br>

                            <small>
                            ${produto.quantidade}
                            /
                            mínimo
                            ${produto.stock_minimo}
                            </small>

                        </div>


                        <span class="badge bg-danger">
                            Baixo Stock
                        </span>


                    </div>

                    `;


                });


            }
            else{


                lista.innerHTML = `

                <div class="alert alert-success mb-0">

                    Nenhum produto com baixo stock.

                </div>

                `;

            }


        }





        // IMPORTANTE:
        // depois do dashboard carregar,
        // carregar vendas filtradas

        await carregarVendasDia();



    }
    catch(error){


        console.error(
            "ERRO DASHBOARD:",
            error
        );


    }


};







// =====================================================
// VENDAS DO DIA DO USUARIO LOGADO
// =====================================================


window.carregarVendasDia = async function(){


    try{


        const elemento =
        document.getElementById(
            "vendas-dia"
        );



        const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );



        if(!usuario){


            if(elemento){

                elemento.innerText =
                "0.00 MT";

            }


            return;

        }





        let url =
        API +
        "/vendas/dashboard/vendas-dia";





        // somente vendedor filtra pelo próprio id

        if(usuario.tipo === "vendedor"){


            url += "?usuario_id=" + usuario.id;


        }





        console.log(
            "URL VENDAS FINAL:",
            url
        );





        const resposta =
        await fetch(url);





        if(!resposta.ok){

            console.log(
                "STATUS ERRO VENDAS:",
                resposta.status
            );


            const textoErro =
            await resposta.text();


            console.log(
                "RESPOSTA SERVIDOR:",
                textoErro
            );


            throw new Error(
                "Erro vendas dia"
            );

        }






        const dados =
        await resposta.json();





        console.log(
            "VENDAS FILTRADAS:",
            dados
        );





        if(elemento){


            elemento.innerText =
            Number(
                dados.vendas_dia || 0
            )
            .toFixed(2)
            +
            " MT";


        }



    }
    catch(error){


        console.error(
            "ERRO VENDAS:",
            error
        );


    }


};



window.carregarDetalhesVendedores = async function(){

    try{


        const tabela =
        document.getElementById(
            "tabela-vendedores"
        );


        if(!tabela)
            return;



        const usuario =
        JSON.parse(
            localStorage.getItem("usuario")
        );



        if(!usuario){

            tabela.innerHTML =
            "Usuário não encontrado";

            return;

        }



        const resposta =
        await fetch(
            API +
            "/vendas/dashboard/vendas-vendedores?usuario_id="
            +
            usuario.id
        );



        if(!resposta.ok){

            throw new Error(
                "Erro ao carregar detalhes"
            );

        }



        const dados =
        await resposta.json();


        // guarda para filtro de data

        vendasVendedoresCache = dados;



        let html = "";



        dados.forEach(vendedor=>{


            html += `

            <div class="card mb-4">


                <div class="card-header bg-dark text-white">

                    <strong>

                    ${vendedor.vendedor}
                    -
                    ${vendedor.data}

                    </strong>


                </div>



                <div class="card-body">


                    <p>

                    <strong>
                    Total vendido:
                    </strong>

                    ${Number(
                        vendedor.total
                    ).toFixed(2)}

                    MT

                    </p>



                    <table class="table table-sm table-bordered">


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



            vendedor.produtos.forEach(produto=>{


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
                            produto.subtotal
                        ).toFixed(2)}

                        MT

                        </td>


                    </tr>


                `;


            });



            html += `


                        </tbody>


                    </table>


                </div>


            </div>


            `;


        });



        tabela.innerHTML = html;



    }
    catch(error){


        console.error(
            "ERRO DETALHES:",
            error
        );


    }


};

window.filtrarVendasData = function(){


    const campo =
    document.getElementById(
        "filtro-data-vendas"
    );


    const texto =
    campo.value.trim();



    if(texto === ""){

        mostrarVendasVendedores(
            vendasVendedoresCache
        );

        return;

    }



    const filtradas =
    vendasVendedoresCache.filter(venda=>{


        return venda.data.includes(
            texto
        );


    });



    mostrarVendasVendedores(
        filtradas
    );


};

window.mostrarVendasVendedores = function(dados){


    const tabela =
    document.getElementById(
        "tabela-vendedores"
    );


    if(!tabela)
        return;



    // ================================
    // AGRUPAR VENDEDOR + DATA
    // ================================

    let agrupado = {};



    dados.forEach(venda=>{


        let chave =
        venda.vendedor +
        "_" +
        venda.data;



        if(!agrupado[chave]){


            agrupado[chave] = {

                vendedor:
                venda.vendedor,

                data:
                venda.data,

                total:0,

                produtos:[]

            };


        }



        agrupado[chave].total +=
        Number(venda.total || 0);



        venda.produtos.forEach(produto=>{


            agrupado[chave].produtos.push(
                produto
            );


        });


    });



    let vendasOrganizadas =
    Object.values(agrupado);



    let html = "";



    vendasOrganizadas.forEach(venda=>{


        html += `

        <div class="card mb-4">


            <div class="card-header bg-dark text-white">


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



                <table class="table table-sm table-bordered">


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



        venda.produtos.forEach(produto=>{


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
                        produto.subtotal
                    ).toFixed(2)}

                    MT

                    </td>


                </tr>


            `;


        });



        html += `


                    </tbody>


                </table>



            </div>


        </div>


        `;


    });



    tabela.innerHTML = html;


};

// =====================================================
// MODAL VENDAS POR VENDEDOR
// =====================================================


window.abrirModalVendedores = function(){

    const modal =
    document.getElementById(
        "modal-vendedores"
    );


    if(modal){

        modal.style.display = "flex";

        carregarDetalhesVendedores();

    }

};



window.fecharModalVendedores = function(){

    const modal =
    document.getElementById(
        "modal-vendedores"
    );


    if(modal){

        modal.style.display = "none";

    }

};
// =====================================================
// INICIALIZAÇÃO
// =====================================================


window.addEventListener(
"DOMContentLoaded",
async function(){


    const usuario =
    localStorage.getItem("usuario");


    if(usuario){

        usuarioLogado =
        JSON.parse(usuario);

        await carregarDashboard();

    }


});
