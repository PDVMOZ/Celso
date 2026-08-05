// dashboard.js

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



        const resposta =
        await fetch(
            API +
            "/vendas/dashboard/vendas-vendedores"
        );



        if(!resposta.ok){

            throw new Error(
                "Erro ao buscar detalhes"
            );

        }



        const dados =
        await resposta.json();



        let html = `

        <table class="table table-sm table-bordered mt-3">

            <thead>

                <tr>

                    <th>
                    Vendedor
                    </th>


                    <th>
                    Total vendido
                    </th>


                </tr>

            </thead>


            <tbody>

        `;



        dados.forEach(v=>{


            html += `

            <tr>

                <td>
                    ${v.vendedor}
                </td>


                <td>
                    ${Number(v.total).toFixed(2)} MT
                </td>


            </tr>

            `;


        });



        html += `

            </tbody>

        </table>

        `;



        tabela.innerHTML = html;



    }
    catch(error){


        console.error(
            "ERRO DETALHES:",
            error
        );


    }


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
