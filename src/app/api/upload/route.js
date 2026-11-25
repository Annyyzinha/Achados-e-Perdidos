import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'A imagem deve ter no máximo 3 MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const imageHash = crypto.createHash('sha256').update(buffer).digest('hex');

    const mimeType = file.type || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const imageUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ imageUrl, imageHash }, { status: 200 });
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    return NextResponse.json(
      { error: 'Falha ao processar o arquivo de imagem.' },
      { status: 500 }
    );
  }
}