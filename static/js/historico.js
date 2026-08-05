// historico.js


async function abrirHistoricoVendas(){

    document.getElementById(
        "historico-panel"
    ).style.display="flex";



    let resposta = await fetch(
        "/vendas/"
    );



    let vendas =
    await resposta.json();



    let tabela =
    document.getElementById(
        "lista-historico-vendas"
    );



    tabela.innerHTML="";



    vendas.forEach(venda=>{


        tabela.innerHTML += `

        <tr>


            <td>
                ${venda.id}
            </td>


            <td>
                ${venda.total} MT
            </td>


            <td>
                ${venda.valor_entregue} MT
            </td>


            <td>
                ${venda.troco} MT
            </td>


            <td>
                ${venda.data_criacao ?? ""}
            </td>


            <td>


                <button
                class="btn btn-success"
                onclick="gerarReciboVenda(${venda.id})">


                <i class="bi bi-receipt"></i>

                Recibo


                </button>


            </td>


        </tr>

        `;


    });


}





function fecharHistoricoVendas(){


    document.getElementById(
        "historico-panel"
    ).style.display="none";


}





async function gerarReciboVenda(idVenda) {


    try {


        const resposta = await fetch(
            `/vendas/${idVenda}`
        );



        if(!resposta.ok){


            throw new Error(
                "Erro ao buscar venda"
            );


        }




        const venda =
        await resposta.json();




        console.log(
            "Venda recibo:",
            venda
        );





        if(
            !venda.itens ||
            venda.itens.length === 0
        ){


            alert(
                "Venda não possui itens"
            );


            return;


        }




        const { jsPDF } =
        window.jspdf;




        const pdf =
        new jsPDF({

            orientation:"portrait",

            unit:"mm",

            format:"a4"

        });





        let y = 25;



        const centro = 105;



        pdf.setFont(
            "helvetica",
            "normal"
        );




        // CABEÇALHO


        pdf.setFontSize(22);



        pdf.text(
            "BAR DO CELSO",
            centro,
            y,
            {
                align:"center"
            }
        );



        y += 10;



        pdf.setFontSize(14);



        pdf.text(
            "RECIBO DE VENDA Nº "+venda.id,
            centro,
            y,
            {
                align:"center"
            }
        );



        y += 8;




        let dataVenda =
        "Não informada";



        if(venda.data){


            dataVenda =
            new Date(
                venda.data
            )
            .toLocaleString("pt-PT");


        }
        else if(venda.created_at){


            dataVenda =
            new Date(
                venda.created_at
            )
            .toLocaleString("pt-PT");


        }
        else if(venda.data_venda){


            dataVenda =
            new Date(
                venda.data_venda
            )
            .toLocaleString("pt-PT");


        }





        pdf.setFontSize(11);



        pdf.text(
            "Data da Venda: "+dataVenda,
            centro,
            y,
            {
                align:"center"
            }
        );



        y += 7;



        pdf.text(
            "Data de Emissão: "+
            new Date()
            .toLocaleString("pt-PT"),
            centro,
            y,
            {
                align:"center"
            }
        );



        y += 12;



        pdf.line(
            25,
            y,
            185,
            y
        );



        y += 10;




        pdf.setFontSize(12);



        pdf.text(
            "Produto",
            30,
            y
        );



        pdf.text(
            "Qtd",
            110,
            y
        );



        pdf.text(
            "Valor",
            150,
            y
        );



        y += 8;



        let total = 0;



        venda.itens.forEach(item=>{


            let nome =
            "Produto";



            if(item.produto){

                nome =
                item.produto.nome;

            }



            let quantidade =
            item.quantidade;



            let valor =
            Number(
                item.preco_unitario
            );



            let subtotal =
            valor *
            quantidade;



            total += subtotal;



            pdf.text(
                nome.substring(0,35),
                30,
                y
            );



            pdf.text(
                String(quantidade),
                115,
                y
            );



            pdf.text(
                subtotal.toFixed(2)+" MT",
                150,
                y
            );



            y += 8;


        });




        y += 5;



        pdf.line(
            25,
            y,
            185,
            y
        );



        y += 12;




        pdf.setFontSize(14);



        pdf.text(
            "Total: "+
            Number(
                venda.total || total
            )
            .toFixed(2)
            +" MT",
            30,
            y
        );



        y += 9;



        pdf.text(
            "Pago: "+
            Number(
                venda.valor_entregue || 0
            )
            .toFixed(2)
            +" MT",
            30,
            y
        );



        y += 9;



        pdf.text(
            "Troco: "+
            Number(
                venda.troco || 0
            )
            .toFixed(2)
            +" MT",
            30,
            y
        );



        y += 20;



        pdf.setFontSize(13);



        pdf.text(
            "Obrigado pela preferência!",
            centro,
            y,
            {
                align:"center"
            }
        );



        pdf.save(
            "recibo-bar-do-celso-"+venda.id+".pdf"
        );



    }


    catch(error){


        console.error(
            "Erro recibo:",
            error
        );


        alert(
            "Erro ao gerar recibo"
        );


    }


}





function mostrarHistorico(valor){


    const menuHistorico =
    document.getElementById(
        "menu-historico"
    );



    if(menuHistorico){


        menuHistorico.style.display =
        valor ? "flex" : "none";


    }


}
