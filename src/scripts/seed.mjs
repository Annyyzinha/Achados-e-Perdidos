// src/scripts/seed.mjs
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

// Gera automaticamente imagens vetoriais (SVG) para itens que não possuíam arquivo JPEG
function gerarImagensFaltantes() {
  const publicDir = path.resolve(process.cwd(), 'public');

  // 1. Chave de Carro (chave.svg)
  const chaveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
    <defs>
      <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0"/>
        <stop offset="50%" stop-color="#94a3b8"/>
        <stop offset="100%" stop-color="#64748b"/>
      </linearGradient>
      <linearGradient id="body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <!-- Argola metálica -->
    <circle cx="150" cy="50" r="32" fill="none" stroke="url(#metal)" stroke-width="10"/>
    <circle cx="150" cy="50" r="22" fill="none" stroke="#cbd5e1" stroke-width="2"/>
    <!-- Corpo da Chave Canivete / Telecomando -->
    <rect x="105" y="80" width="90" height="150" rx="24" fill="url(#body)" stroke="#1e293b" stroke-width="3" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"/>
    <!-- Botões de Trava/Destrava -->
    <circle cx="150" cy="115" r="14" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <path d="M145 116 v-4 a5 5 0 0 1 10 0 v4 h-10 z" fill="none" stroke="#ffffff" stroke-width="2"/>
    <circle cx="150" cy="155" r="14" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <path d="M145 156 v-4 a5 5 0 0 1 10 0 v4" fill="none" stroke="#ffffff" stroke-width="2"/>
    <rect x="143" y="156" width="14" height="8" rx="2" fill="#ffffff"/>
    <circle cx="150" cy="195" r="11" fill="#1e293b" stroke="#475569" stroke-width="2"/>
    <!-- Lâmina metálica da chave -->
    <path d="M142 230 v50 l8 6 l8 -6 v-50 z" fill="url(#metal)" stroke="#475569" stroke-width="2"/>
    <path d="M146 240 v30" stroke="#475569" stroke-width="2"/>
  </svg>`;

  // 2. Cartão de Estudante (cartao.svg)
  const cartaoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
    <!-- Cordão Azul UTFPR -->
    <path d="M110 0 L140 70 L150 78 L160 70 L190 0" fill="none" stroke="#1e3a8a" stroke-width="16"/>
    <!-- Clipe metálico -->
    <rect x="138" y="70" width="24" height="18" rx="3" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
    <!-- Cartão Plástico -->
    <rect x="65" y="85" width="170" height="195" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
    <!-- Faixa Superior Azul UTFPR -->
    <path d="M65 97 a12 12 0 0 1 12 -12 h146 a12 12 0 0 1 12 12 v38 h-170 z" fill="#1e3a8a"/>
    <text x="150" y="110" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">UTFPR CÂMPUS CP</text>
    <text x="150" y="125" fill="#93c5fd" font-size="8" font-family="sans-serif" text-anchor="middle">CARTÃO DE ESTUDANTE</text>
    <!-- Foto Avatar -->
    <rect x="80" y="140" width="50" height="60" rx="4" fill="#f1f5f9" stroke="#cbd5e1"/>
    <circle cx="105" cy="160" r="12" fill="#94a3b8"/>
    <path d="M90 195 a15 15 0 0 1 30 0 z" fill="#94a3b8"/>
    <!-- Linhas de Dados do Aluno -->
    <rect x="140" y="148" width="80" height="7" rx="3" fill="#1e293b"/>
    <rect x="140" y="162" width="60" height="6" rx="3" fill="#64748b"/>
    <rect x="140" y="174" width="70" height="6" rx="3" fill="#94a3b8"/>
    <!-- Chip Dourado -->
    <rect x="80" y="210" width="30" height="22" rx="3" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
    <!-- Código de Barras -->
    <line x1="80" y1="250" x2="80" y2="268" stroke="#1e293b" stroke-width="3"/>
    <line x1="86" y1="250" x2="86" y2="268" stroke="#1e293b" stroke-width="1"/>
    <line x1="91" y1="250" x2="91" y2="268" stroke="#1e293b" stroke-width="4"/>
    <line x1="100" y1="250" x2="100" y2="268" stroke="#1e293b" stroke-width="2"/>
    <line x1="106" y1="250" x2="106" y2="268" stroke="#1e293b" stroke-width="5"/>
    <line x1="116" y1="250" x2="116" y2="268" stroke="#1e293b" stroke-width="2"/>
    <line x1="123" y1="250" x2="123" y2="268" stroke="#1e293b" stroke-width="3"/>
    <line x1="130" y1="250" x2="130" y2="268" stroke="#1e293b" stroke-width="4"/>
    <line x1="140" y1="250" x2="140" y2="268" stroke="#1e293b" stroke-width="2"/>
    <line x1="146" y1="250" x2="146" y2="268" stroke="#1e293b" stroke-width="4"/>
    <line x1="155" y1="250" x2="155" y2="268" stroke="#1e293b" stroke-width="1"/>
    <line x1="162" y1="250" x2="162" y2="268" stroke="#1e293b" stroke-width="3"/>
  </svg>`;

  // 3. Estojo Preto (estojo.svg)
  const estojoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
    <!-- Canetas saindo discretamente -->
    <rect x="75" y="110" width="12" height="60" rx="3" fill="#2563eb" transform="rotate(-15 75 110)"/>
    <rect x="95" y="105" width="10" height="65" rx="3" fill="#dc2626" transform="rotate(-5 95 105)"/>
    <!-- Corpo Principal do Estojo Preto -->
    <rect x="50" y="130" width="200" height="90" rx="36" fill="#1e293b" stroke="#0f172a" stroke-width="4" filter="drop-shadow(0 6px 8px rgba(0,0,0,0.25))"/>
    <!-- Costura Decorativa -->
    <rect x="56" y="136" width="188" height="78" rx="30" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="6,4"/>
    <!-- Trilho do Zíper -->
    <line x1="60" y1="170" x2="240" y2="170" stroke="#94a3b8" stroke-width="4" stroke-dasharray="3,2"/>
    <!-- Cursor do Zíper em Metal -->
    <rect x="90" y="162" width="16" height="16" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    <path d="M98 178 v16 a6 6 0 0 0 12 0 v-16 z" fill="#cbd5e1" stroke="#64748b" stroke-width="2"/>
  </svg>`;

  fs.writeFileSync(path.join(publicDir, 'chave.svg'), chaveSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'cartao.svg'), cartaoSvg, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'estojo.svg'), estojoSvg, 'utf8');
  console.log('✔ Arquivos chave.svg, cartao.svg e estojo.svg gerados em public/.');
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

// Itens com as fotos canônicas correspondentes (sem garrafa duplicada)
const itensIniciais = [
  // 1. Destaques do Catálogo (PageMenu.png)
  {
    title: 'Garrafa de Água Azul',
    category: 'Outros',
    locationFound: 'Biblioteca',
    dateFound: new Date('2026-04-16T10:00:00Z'),
    description: 'Garrafa de água azul esportiva em alumínio com alça.',
    imageUrl: '/garrafaAzul.jpeg',
    status: 'NoDERDI',
    reportedBy: 'lucas.aluno@alunos.utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'lucas.aluno@alunos.utfpr.edu.br', date: new Date('2026-04-16T10:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-16T11:00:00Z') }
    ]
  },
  {
    title: 'Calculadora Científica',
    category: 'Eletrônicos',
    locationFound: 'Bloco A',
    dateFound: new Date('2026-04-15T14:30:00Z'),
    description: 'Calculadora científica marca Casio com visor de matriz.',
    imageUrl: '/calcCient.jpeg',
    status: 'NoDERDI',
    reportedBy: 'joao.pedro@alunos.utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'joao.pedro@alunos.utfpr.edu.br', date: new Date('2026-04-15T14:30:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-15T16:00:00Z') }
    ]
  },
  {
    title: 'Casaco Moletom Preto UTFPR',
    category: 'Vestuário',
    locationFound: 'Pátio Central / Cantina',
    dateFound: new Date('2026-04-14T18:00:00Z'),
    description: 'Casaco moletom preto tamanho M com logotipo amarelo.',
    imageUrl: '/casaco.jpeg',
    status: 'Reivindicado',
    reportedBy: 'felipe.atleta@alunos.utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'felipe.atleta@alunos.utfpr.edu.br', date: new Date('2026-04-14T18:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-14T19:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_REIVINDICADO', performedBy: 'lucas.aluno@alunos.utfpr.edu.br', date: new Date('2026-04-15T09:20:00Z') }
    ]
  },
  {
    title: 'Caderno Universitário',
    category: 'Documentos',
    locationFound: 'Cantina',
    dateFound: new Date('2026-04-13T11:00:00Z'),
    description: 'Caderno espiral capa dura azul com anotações de aula.',
    imageUrl: '/caderno.jpeg',
    status: 'Devolvido',
    reportedBy: 'beatriz.cardoso@alunos.utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'beatriz.cardoso@alunos.utfpr.edu.br', date: new Date('2026-04-13T11:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-13T12:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_DEVOLVIDO', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-14T14:40:00Z') }
    ]
  },

  // 2. Os 3 Itens do Perfil de Anny (PagePerfil.png: com imagens exclusivas)
  {
    title: 'Chave de Carro',
    category: 'Outros',
    locationFound: 'Estacionamento de Alunos - Bloco B',
    dateFound: new Date('2026-04-10T08:00:00Z'),
    description: 'Chave automotiva com telecomando e chaveiro.',
    imageUrl: '/chave.svg', // Imagem exclusiva de Chave
    status: 'NoDERDI',
    reportedBy: 'annycosta@alunos.utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-10T08:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-10T09:30:00Z') }
    ]
  },
  {
    title: 'Cartão de Estudante',
    category: 'Documentos',
    locationFound: 'Pátio Central / Cantina',
    dateFound: new Date('2026-04-12T11:45:00Z'),
    description: 'Cartão de identificação com cordão azul da universidade.',
    imageUrl: '/cartao.svg', // Imagem exclusiva de Cartão
    status: 'Devolvido',
    reportedBy: 'annycosta@alunos.utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-12T11:45:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-12T13:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_DEVOLVIDO', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-13T10:00:00Z') }
    ]
  },
  {
    title: 'Estojo Preto',
    category: 'Outros',
    locationFound: 'Bloco A - Sala 104',
    dateFound: new Date('2026-04-14T16:00:00Z'),
    description: 'Estojo de tecido preto com canetas e materiais escolares.',
    imageUrl: '/estojo.svg', // Imagem exclusiva de Estojo
    status: 'Pendente',
    reportedBy: 'annycosta@alunos.utfpr.edu.br',
    validatedBy: null,
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'annycosta@alunos.utfpr.edu.br', date: new Date('2026-04-14T16:00:00Z') }
    ]
  },

  // 3. Itens de Auditoria Adicionais para a Máquina de Estados
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
  },
  {
    title: 'Guarda-chuva Dobrável Preto',
    category: 'Outros',
    locationFound: 'Portaria Principal do Câmpus',
    dateFound: new Date('2026-01-10T07:45:00Z'),
    description: 'Objeto esquecido há mais de 180 dias sem procura.',
    imageUrl: '/casaco.jpeg',
    status: 'Expirado',
    reportedBy: 'servico.limpeza@utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'servico.limpeza@utfpr.edu.br', date: new Date('2026-01-10T07:45:00Z') },
      { action: 'MUDANCA_STATUS_PARA_NODERDI', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-01-10T09:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_EXPIRADO', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-07-10T08:00:00Z') }
    ]
  },
  {
    title: 'Folha de Anotações Rasgada',
    category: 'Documentos',
    locationFound: 'Pátio Aberto',
    dateFound: new Date('2026-04-09T12:00:00Z'),
    description: 'Papéis inutilizados sem dados de identificação.',
    imageUrl: '/caderno.jpeg',
    status: 'Rejeitado',
    reportedBy: 'aluno.anonimo@alunos.utfpr.edu.br',
    validatedBy: 'derdi-cp@utfpr.edu.br',
    auditTrail: [
      { action: 'CADASTRO_INICIAL', performedBy: 'aluno.anonimo@alunos.utfpr.edu.br', date: new Date('2026-04-09T12:00:00Z') },
      { action: 'MUDANCA_STATUS_PARA_REJEITADO', performedBy: 'derdi-cp@utfpr.edu.br', date: new Date('2026-04-09T13:10:00Z') }
    ]
  }
];

async function executarCarga() {
  console.log('\n======================================================');
  console.log('   POVOANDO BANCO COM IMAGENS E DADOS CONGRUENTES');
  console.log('======================================================\n');

  try {
    // 1. Gera os vetores em public/
    gerarImagensFaltantes();

    await mongoose.connect(MONGODB_URI);
    console.log(' Conectado com sucesso ao MongoDB.');

    const contagemAnterior = await Item.countDocuments();
    await Item.deleteMany({});
    console.log(` Histórico anterior limpo: ${contagemAnterior} itens removidos.`);

    const itensCompletos = itensIniciais.map(item => {
      const mockBuffer = Buffer.from(item.title + item.dateFound.toISOString());
      const imageHash = crypto.createHash('sha256').update(mockBuffer).digest('hex');
      return { ...item, imageHash };
    });

    const inseridos = await Item.insertMany(itensCompletos);
    console.log(`\x1b[32m✔ Sucesso:\x1b[0m ${inseridos.length} itens cadastrados com imagens específicas.`);

    console.log('\n--- DISTRIBUIÇÃO OPERACIONAL NOVO ACERVO ---');
    console.log(`Total de Itens:      ${inseridos.length}`);
    console.log('======================================================\n');

  } catch (erro) {
    console.error(' Falha ao inicializar o banco:', erro.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

executarCarga();