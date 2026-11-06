import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    let limit = parseInt(searchParams.get("limit") || "50", 10);

    const MAX_LIMIT = 100;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 1) limit = 50;

    const skip = (page - 1) * limit;

    const filter = {};
    const statusParam = searchParams.get("status");
    if (statusParam) {
      filter.status = statusParam;
    }

    const [items, totalItems] = await Promise.all([
      Item.find(filter)
        .sort({ dateFound: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json(
      {
        success: true,
        data: items,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao listar itens paginados:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor ao carregar os itens." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (!body.reportedBy || body.reportedBy.trim() === '') {
      return NextResponse.json(
        { error: 'Violação de Auditoria: O e-mail institucional do reportador é obrigatório.' },
        { status: 400 }
      );
    }

    const newItem = await Item.create({
      title: body.nome,
      description: body.descricao,
      category: body.categoria,
      locationFound: body.local,
      dateFound: new Date(body.data),
      imageUrl: body.imageUrl || '/garrafaAzul.jpeg',
      imageHash: body.imageHash || '',
      status: 'Pendente',
      reportedBy: body.reportedBy,
      auditTrail: [
        {
          action: 'CADASTRO_INICIAL',
          performedBy: body.reportedBy,
          date: new Date()
        }
      ]
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}