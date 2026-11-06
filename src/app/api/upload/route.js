import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageHash = crypto.createHash('sha256').update(buffer).digest('hex');

    const ext = path.extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${imageHash.substring(0, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/${filename}`;
    return NextResponse.json({ imageUrl, imageHash }, { status: 200 });
  } catch (error) {
    console.error('Erro no upload da imagem:', error);
    return NextResponse.json({ error: 'Falha ao processar o arquivo de imagem.' }, { status: 500 });
  }
}