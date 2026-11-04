import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET(request) {
  try {
    await connectToDatabase();

    // 1. Extrair parâmetros de busca da URL
    const { searchParams } = new URL(request.url);

    // Ler page e limit das query params com valores padrão
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    let limit = parseInt(searchParams.get("limit") || "10", 10);

    // Definir um teto máximo de segurança (ex: no máximo 50 itens por requisição)
    const MAX_LIMIT = 50;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 1) limit = 10;

    // Calcular offset (quantos documentos pular)
    const skip = (page - 1) * limit;

    // Filtros opcionais 
    const filter = {};
    const statusParam = searchParams.get("status");
    if (statusParam) {
      filter.status = statusParam;
    }

    // 2. Executar em paralelo a busca paginada e a contagem total de documentos
    const [items, totalItems] = await Promise.all([
      Item.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(filter)
    ]);

    // 3. Calcular os metadados da paginação
    const totalPages = Math.ceil(totalItems / limit);

    // 4. Retornar os dados formatados
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

    // Validação Estrita LGPD/Auditoria (Resolve o CT-14)
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