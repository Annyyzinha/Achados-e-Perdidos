import mongoose from 'mongoose';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function carregarEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const conteudo = fs.readFileSync(envPath, 'utf8');
    conteudo.split('\n').forEach(linha => {
      const match = linha.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const chave = match[1];
        let valor = match[2] || '';
        valor = valor.trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[chave]) {
          process.env[chave] = valor;
        }
      }
    });
  }
}

carregarEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/achados_utfpr';

function removerSvgsAntigos() {
  const publicDir = path.resolve(process.cwd(), 'public');
  ['chave.svg', 'cartao.svg', 'estojo.svg'].forEach(arquivo => {
    const caminho = path.join(publicDir, arquivo);
    if (fs.existsSync(caminho)) {
      fs.unlinkSync(caminho);
    }
  });
}

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: {
    type: String,
    required: true,
    enum: ['Eletrônicos', 'Documentos', 'Vestuário', 'Outros']
  },
  locationFound: { type: String, required: true },
  dateFound: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pendente', 'NoDERDI', 'Reivindicado', 'Devolvido', 'Expirado', 'Rejeitado'],
    default: 'Pendente'
  },
  imageUrl: { type: String, default: '/garrafaAzul.jpeg' },
  imageHash: { type: String },
  reportedBy: { type: String, required: true },
  validatedBy: { type: String },
  auditTrail: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

const itensIniciais = [
  {
    title: 'Garrafa de Água Azul',
    category: 'Outros',
    locationFound: 'Biblioteca',
    dateFound: new Date('2026-04-16T10:00:00Z'),
    description: 'Garrafa de água azul esportiva em alumínio com alça.',
    imageUrl: '/garrafaAzul.jpeg',
    status: 'NoDERDI',
    reportedBy: 'lucas.aluno@alunos.utfpr.edu.br',
    validatedBy: 'annycosta@alunos.utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'lucas.aluno@alunos.utfpr.edu.br', date: new Date('2026-04-16T10:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-16T11:00:00Z') }
    ]
  },
  {
    title: 'Calculadora Científica',
    category: 'Eletrônicos',
    locationFound: 'Bloco A - Sala 102',
    dateFound: new Date('2026-04-15T14:30:00Z'),
    description: 'Calculadora científica marca Casio com visor de matriz.',
    imageUrl: '/calcCient.jpeg',
    status: 'NoDERDI',
    reportedBy: 'joao.pedro@alunos.utfpr.edu.br',
    validatedBy: 'annycosta@alunos.utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'joao.pedro@alunos.utfpr.edu.br', date: new Date('2026-04-15T14:30:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-15T16:00:00Z') }
    ]
  },
  {
    title: 'Casaco Moletom Preto UTFPR',
    category: 'Vestuário',
    locationFound: 'Pátio Central / Cantina',
    dateFound: new Date('2026-04-14T18:00:00Z'),
    description: 'Casaco moletom preto tamanho M com logotipo institucional.',
    imageUrl: '/casaco.jpeg',
    status: 'NoDERDI',
    reportedBy: 'felipe.atleta@alunos.utfpr.edu.br',
    validatedBy: 'annycosta@alunos.utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'felipe.atleta@alunos.utfpr.edu.br', date: new Date('2026-04-14T18:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-14T19:00:00Z') }
    ]
  },
  {
    title: 'Caderno Universitário',
    category: 'Documentos',
    locationFound: 'Cantina',
    dateFound: new Date('2026-04-13T11:00:00Z'),
    description: 'Caderno espiral capa dura azul com anotações de aula.',
    imageUrl: '/caderno.jpeg',
    status: 'NoDERDI',
    reportedBy: 'beatriz.cardoso@alunos.utfpr.edu.br',
    validatedBy: 'annycosta@alunos.utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'beatriz.cardoso@alunos.utfpr.edu.br', date: new Date('2026-04-13T11:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-13T12:00:00Z') }
    ]
  },
  {
    title: 'Chave de Carro',
    category: 'Outros',
    locationFound: 'Estacionamento de Alunos - Bloco B',
    dateFound: new Date('2026-04-10T08:00:00Z'),
    description: 'Chave automotiva com telecomando e chaveiro.',
    imageUrl: '/chave.webp',
    status: 'NoDERDI',
    reportedBy: 'annycosta@alunos.utfpr.edu.br',
    validatedBy: 'annycosta@alunos.utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-10T08:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-10T09:30:00Z') }
    ]
  },
  {
    title: 'Estojo Preto',
    category: 'Outros',
    locationFound: 'Bloco A - Sala 104',
    dateFound: new Date('2026-04-14T16:00:00Z'),
    description: 'Estojo de tecido preto com canetas e materiais escolares.',
    imageUrl: '/estojo.jpeg',
    status: 'NoDERDI',
    reportedBy: 'annycosta@alunos.utfpr.edu.br',
    validatedBy: 'annycosta@alunos.utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-14T16:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-14T16:30:00Z') }
    ]
  },
  {
    title: 'Cartão de Estudante',
    category: 'Documentos',
    locationFound: 'Pátio Central / Cantina',
    dateFound: new Date('2026-04-12T11:45:00Z'),
    description: 'Cartão de identificação com cordão azul da universidade.',
    imageUrl: '/cartao.jpeg',
    status: 'Devolvido',
    reportedBy: 'annycosta@alunos.utfpr.edu.br',
    validatedBy: 'annycosta@alunos.utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-12T11:45:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-12T13:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_DEVOLVIDO', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-13T10:00:00Z') }
    ]
  },
  {
    title: 'Calculadora Gráfica Avançada',
    category: 'Eletrônicos',
    locationFound: 'Laboratório de Informática 3',
    dateFound: new Date('2026-04-11T15:10:00Z'),
    description: 'Calculadora com visor de matriz para aulas práticas.',
    imageUrl: '/calcCient.jpeg',
    status: 'Pendente',
    reportedBy: 'mateus.eng@alunos.utfpr.edu.br',
    validatedBy: null,
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'mateus.eng@alunos.utfpr.edu.br', date: new Date('2026-04-11T15:10:00Z') }
    ]
  }
];

async function executarCarga() {
  try {
    removerSvgsAntigos();
    await mongoose.connect(MONGODB_URI);
    await Item.deleteMany({});

    const itensCompletos = itensIniciais.map(item => {
      const mockBuffer = Buffer.from(item.title + item.dateFound.toISOString());
      const imageHash = crypto.createHash('sha256').update(mockBuffer).digest('hex');
      return { ...item, imageHash };
    });

    const inseridos = await Item.insertMany(itensCompletos);
    console.log(`Sucesso: ${inseridos.length} itens cadastrados com as fotos originais da pasta public.`);
  } catch (erro) {
    console.error('Falha ao inicializar o banco:', erro.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

executarCarga();