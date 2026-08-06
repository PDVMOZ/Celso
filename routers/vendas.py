# =====================================================
# DASHBOARD - VENDAS POR VENDEDOR / DIA / PRODUTOS
# =====================================================


@router.get("/dashboard/vendas-vendedores")
async def vendas_por_vendedor(

    usuario_id:int,

    db:AsyncSession = Depends(get_db)

):


    usuario_resultado = await db.execute(

        select(Usuario)
        .where(
            Usuario.id == usuario_id
        )

    )


    usuario = usuario_resultado.scalar_one_or_none()


    if usuario is None:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )



    consulta = select(Venda).options(

        selectinload(Venda.usuario),

        selectinload(Venda.itens)
        .selectinload(ItemVenda.produto)

    )



    # vendedor vê só ele

    if usuario.tipo == "vendedor":

        consulta = consulta.where(

            Venda.usuario_id == usuario.id

        )



    # gerente vê vendedores

    elif usuario.tipo == "gerente":

        consulta = consulta.join(

            Usuario,

            Venda.usuario_id == Usuario.id

        ).where(

            Usuario.tipo == "vendedor"

        )



    # admin vê todos

    resultado = await db.execute(
        consulta.order_by(
            Venda.data_venda.desc()
        )
    )


    vendas = resultado.scalars().all()



    dados = {}



    for venda in vendas:


        nome = venda.usuario.nome

        data = venda.data_venda.strftime(
            "%d/%m/%Y"
        )



        chave = nome + "_" + data



        if chave not in dados:

            dados[chave] = {

                "vendedor": nome,

                "data": data,

                "total":0,

                "produtos":[]

            }



        dados[chave]["total"] += float(
            venda.total
        )



        for item in venda.itens:

            dados[chave]["produtos"].append({

                "produto": item.produto.nome,

                "quantidade": item.quantidade,

                "subtotal": float(
                    item.subtotal
                )

            })



    return list(dados.values())
