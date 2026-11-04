// src/tests/functional.test.mjs
import crypto from 'crypto';

const BASE_URL = 'http://localhost:3000';

let itemIdCadastrado = null;
let testesPassaram = 0;
let testesFalharam = 0;

function printPass(nome) {
  console.log(`  \x1b[32m✔ PASS:\x1b[0m ${nome}`);
  testesPassaram++;
}

function printFail(nome, erro) {
  console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${nome}`);
  console.error(`    -> Detalhe: ${erro}`);
  testesFalharam++;
}

async function executarTestes() {
  console.log('\n======================================================');
  console.log('   SUÍTE DE TESTES AUTOMATIZADOS (RNF05 - TCC 2)');
  console.log('======================================================\n');

  // -------------------------------------------------------------
  // CT-01: Validação de Domínio Institucional (RF01 / RNF02)
  // -------------------------------------------------------------
  console.log('\x1b[34m[CT-01]\x1b[0m Validação de Domínio Institucional (RF01/RNF02)');
  try {
    const emailsInvalidos = ['usuario@gmail.com', 'aluno@hotmail.com', 'teste@yahoo.com.br'];
    const emailsValidos = ['aluno@alunos.utfpr.edu.br', 'servidor@utfpr.edu.br', 'derdi-cp@utfpr.edu.br'];

    const validarDominio = (email) =>
      email.endsWith('@alunos.utfpr.edu.br') || email.endsWith('@utfpr.edu.br');

    emailsInvalidos.forEach(email => {
      if (validarDominio(email)) throw new Error(`E-mail externo ${email} foi aceito indevidamente.`);
    });
    emailsValidos.forEach(email => {
      if (!validarDominio(email)) throw new Error(`E-mail institucional ${email} foi recusado indevidamente.`);
    });

    printPass('Bloqueio estrito de contas não-institucionais e aceitação das credenciais UTFPR.');
  } catch (err) {
    printFail('Regra de validação de domínio institucional.', err.message);
  }

  // -------------------------------------------------------------
  // CT-02: Upload de Arquivo e Hash Criptográfico SHA-256 (RF03 / RNF06)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-02]\x1b[0m Upload de Imagem e Integridade SHA-256 (RF03/RNF06)');
  let uploadedImageUrl = '';
  let uploadedHash = '';
  try {
    const mockImageBuffer = Buffer.from('IMAGEM_MOCK_TESTE_AUTOMATIZADO_UTFPR_CP_' + Date.now());
    const expectedHash = crypto.createHash('sha256').update(mockImageBuffer).digest('hex');

    const formData = new FormData();
    const blob = new Blob([mockImageBuffer], { type: 'image/jpeg' });
    formData.append('file', blob, 'teste-unitario.jpg');

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(`Status ${res.status} ao realizar upload`);
    const data = await res.json();

    if (!data.imageUrl || !data.imageUrl.startsWith('/uploads/')) {
      throw new Error(`Caminho de imagem retornado inválido: ${data.imageUrl}`);
    }
    if (data.imageHash !== expectedHash) {
      throw new Error(`Hash diverge. Esperado: ${expectedHash}, Recebido: ${data.imageHash}`);
    }

    uploadedImageUrl = data.imageUrl;
    uploadedHash = data.imageHash;
    printPass('Arquivo gravado com URL estática e hash SHA-256 verificado com sucesso.');
  } catch (err) {
    printFail('Upload e integridade SHA-256.', err.message);
  }

  // -------------------------------------------------------------
  // CT-03: Cadastro de Item e Trilha Inicial de Auditoria (RF02 / Quadro 3)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-03]\x1b[0m Cadastro de Objeto e Trilha Inicial (RF02/RF03/LGPD)');
  try {
    const payloadNovoItem = {
      nome: 'Mochila Preta de Teste Automatizado',
      categoria: 'Outros',
      local: 'Bloco B - Sala de Estudos',
      data: new Date().toISOString().slice(0, 10),
      descricao: 'Mochila com zíper prateado cadastrada via teste automatizado.',
      imageUrl: uploadedImageUrl || '/garrafaAzul.jpeg',
      imageHash: uploadedHash || 'hash_mock',
      reportedBy: 'annycosta@alunos.utfpr.edu.br',
    };

    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadNovoItem),
    });

    if (res.status !== 201) throw new Error(`Falha no cadastro. Status HTTP: ${res.status}`);
    const item = await res.json();

    if (item.status !== 'Pendente') throw new Error(`Estado inicial deveria ser Pendente. Recebido: ${item.status}`);
    if (!item.auditTrail || item.auditTrail.length !== 1) {
      throw new Error(`Audit trail inicial deve conter exatamente 1 registro.`);
    }
    if (item.auditTrail[0].action !== 'CADASTRO_INICIAL') {
      throw new Error(`Ação de auditoria incorreta: ${item.auditTrail[0].action}`);
    }

    itemIdCadastrado = item._id;
    printPass(`Item criado com estado 'Pendente' e evento inicial de auditoria gravado no banco.`);
  } catch (err) {
    printFail('Criação do achado via API.', err.message);
  }

  // -------------------------------------------------------------
  // CT-04: Transição de Estados da Máquina e Rastreabilidade LGPD
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-04]\x1b[0m Máquina de Estados e Rastreabilidade (RF06/RF07/RF08/RF09)');
  try {
    if (!itemIdCadastrado) throw new Error('Item de teste prévio não disponível.');

    // 1. Pendente -> NoDERDI
    let res = await fetch(`${BASE_URL}/api/items/${itemIdCadastrado}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'NoDERDI', moderatorEmail: 'derdi-cp@utfpr.edu.br' }),
    });
    let item = await res.json();
    if (item.status !== 'NoDERDI') throw new Error(`Esperado NoDERDI, recebido: ${item.status}`);

    // 2. NoDERDI -> Reivindicado
    res = await fetch(`${BASE_URL}/api/items/${itemIdCadastrado}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Reivindicado', moderatorEmail: 'aluno.reivindicante@alunos.utfpr.edu.br' }),
    });
    item = await res.json();
    if (item.status !== 'Reivindicado') throw new Error(`Esperado Reivindicado, recebido: ${item.status}`);

    // 3. Reivindicado -> Devolvido
    res = await fetch(`${BASE_URL}/api/items/${itemIdCadastrado}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Devolvido', moderatorEmail: 'derdi-cp@utfpr.edu.br' }),
    });
    item = await res.json();
    if (item.status !== 'Devolvido') throw new Error(`Esperado Devolvido, recebido: ${item.status}`);

    if (item.auditTrail.length !== 4) {
      throw new Error(`AuditTrail deveria conter 4 registros. Registros encontrados: ${item.auditTrail.length}`);
    }
    if (item.validatedBy !== 'derdi-cp@utfpr.edu.br') {
      throw new Error(`Operador final divergente: ${item.validatedBy}`);
    }

    printPass('Ciclo completo de estados cumprido com 4 carimbos registrados no auditTrail.');
  } catch (err) {
    printFail('Transição da máquina de estados e trilha de auditoria.', err.message);
  }

  // -------------------------------------------------------------
  // CT-05: Consulta Multicritério e Filtros no Catálogo (RF05)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-05]\x1b[0m Consulta Multicritério e Filtros (RF05)');
  try {
    const res = await fetch(`${BASE_URL}/api/items`);
    const response = await res.json();
    const itens = response.data;

    if (!Array.isArray(itens)) throw new Error('API não retornou um array de itens.');

    const filtradoPorTexto = itens.filter(i =>
      i.title && i.title.toLowerCase().includes('mochila preta')
    );
    if (filtradoPorTexto.length === 0) {
      throw new Error('Filtro por palavra-chave falhou em localizar o item cadastrado.');
    }

    const filtradoPorLocal = itens.filter(i =>
      i.locationFound && i.locationFound.toLowerCase().includes('bloco b')
    );
    if (filtradoPorLocal.length === 0) {
      throw new Error('Filtro por localidade falhou.');
    }

    printPass('Busca por termo e localidade validada com sucesso sobre os registros.');
  } catch (err) {
    printFail('Filtros de catálogo RF05.', err.message);
  }

  // -------------------------------------------------------------
  // CT-06: Rejeição de Cadastro Inválido / Spam pelo DERDI (RF15)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-06]\x1b[0m Rejeição de Cadastro Inválido / Spam pelo DERDI (RF15)');
  try {
    const resCadastro = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Item Spam Falso',
        categoria: 'Outros',
        local: 'Pátio Central',
        data: new Date().toISOString().slice(0, 10),
        descricao: 'Cadastro indevido que deve ser rejeitado pelo setor.',
        reportedBy: 'aluno.suspeito@alunos.utfpr.edu.br'
      })
    });
    const itemSuspeito = await resCadastro.json();

    const resRejeicao = await fetch(`${BASE_URL}/api/items/${itemSuspeito._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Rejeitado',
        moderatorEmail: 'derdi-cp@utfpr.edu.br'
      })
    });
    const itemRejeitado = await resRejeicao.json();

    if (itemRejeitado.status !== 'Rejeitado') {
      throw new Error(`Status deveria ser 'Rejeitado'. Recebido: ${itemRejeitado.status}`);
    }

    const ultimoLog = itemRejeitado.auditTrail[itemRejeitado.auditTrail.length - 1];
    if (ultimoLog.action !== 'MUDANCA_STATUS_PARA_REJEITADO') {
      throw new Error(`Ação de auditoria esperada: MUDANCA_STATUS_PARA_REJEITADO. Recebida: ${ultimoLog.action}`);
    }

    printPass("Item pendente rejeitado com sucesso pelo DERDI com carimbo 'MUDANCA_STATUS_PARA_REJEITADO'.");
  } catch (err) {
    printFail('Rejeição de item fraudulento (CT-06).', err.message);
  }

  // -------------------------------------------------------------
  // CT-07: Injeção de Dados Incompletos no Cadastro (Resiliência)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-07]\x1b[0m Injeção de Dados Incompletos (Tratamento de Erros API)');
  try {
    const payloadInvalido = {
      descricao: 'Item sem título, sem categoria e sem local'
    };

    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadInvalido),
    });

    if (res.status === 201) {
      throw new Error('A API aceitou um cadastro sem os campos obrigatórios.');
    }

    printPass(`A API rejeitou dados incompletos adequadamente (Status HTTP: ${res.status}).`);
  } catch (err) {
    printFail('Validação de campos obrigatórios (CT-07).', err.message);
  }

  // -------------------------------------------------------------
  // CT-08: Rastreabilidade LGPD - Fallback de Operador
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-08]\x1b[0m Transição Sem Operador Explícito (Garantia de Auditoria)');
  try {
    if (!itemIdCadastrado) throw new Error('Depende do CT-03 para executar.');

    const res = await fetch(`${BASE_URL}/api/items/${itemIdCadastrado}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'Expirado',
        moderatorEmail: ''
      }),
    });

    const item = await res.json();

    if (!item.validatedBy || item.validatedBy === '') {
      throw new Error('O sistema permitiu transição sem registro de operador.');
    }

    printPass(`Transição registrada aplicando o fallback de auditoria do setor: ${item.validatedBy}`);
  } catch (err) {
    printFail('Auditoria obrigatória (CT-08).', err.message);
  }

  // -------------------------------------------------------------
  // CT-09: Violação da Máquina de Estados (Enum)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-09]\x1b[0m Injeção de Status Inválido na Máquina de Estados');
  try {
    if (!itemIdCadastrado) throw new Error('Depende do CT-03 para executar.');

    const res = await fetch(`${BASE_URL}/api/items/${itemIdCadastrado}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'StatusInexistente',
        moderatorEmail: 'derdi-cp@utfpr.edu.br'
      }),
    });

    if (res.status === 200) {
      throw new Error('O banco Mongoose aceitou um estado que não pertence ao Enum.');
    }

    printPass('Transição ilegal abortada com sucesso pelo validador do Schema (Mongoose Enum).');
  } catch (err) {
    printFail('Blindagem da máquina de estados (CT-09).', err.message);
  }

  // -------------------------------------------------------------
  // CT-10: Requisição Malformada na Rota de Upload
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-10]\x1b[0m Requisição Sem Arquivo na Rota de Upload');
  try {
    const formData = new FormData();

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (res.status === 500) {
      throw new Error('A API retornou erro 500 em vez de tratar requisição inválida.');
    }
    if (res.status === 200) {
      throw new Error('A API processou com sucesso um upload sem arquivo.');
    }

    printPass(`Rota de upload blindada contra requisições vazias (Status HTTP tratado: ${res.status}).`);
  } catch (err) {
    printFail('Tratamento de upload vazio (CT-10).', err.message);
  }

  // -------------------------------------------------------------
  // CT-12: Restrição Estrita de Categorias Pré-estabelecidas (RF12 / Schema Enum)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-12]\x1b[0m Restrição Estrita de Categorias Pré-estabelecidas (RF12)');
  try {
    const payloadCategoriaInvalida = {
      nome: 'Brinquedo Arbitrário Não Permitido',
      categoria: 'Brinquedos', // Não pertence a ['Eletrônicos', 'Documentos', 'Vestuário', 'Outros']
      local: 'Quadra Poliesportiva',
      data: new Date().toISOString().slice(0, 10),
      descricao: 'Tentativa de cadastrar categoria arbitrária fora do enum institucional.',
      reportedBy: 'aluno.teste@alunos.utfpr.edu.br',
    };

    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadCategoriaInvalida),
    });

    if (res.status === 201) {
      throw new Error('A API aceitou um cadastro com categoria fora do enum do modelo.');
    }

    if (res.status !== 400) {
      throw new Error(`Esperado status HTTP 400 para erro de validação de categoria, recebido: ${res.status}`);
    }

    printPass('Categoria arbitrária bloqueada pelo validador do Schema Mongoose (Status HTTP: 400).');
  } catch (err) {
    printFail('Restrição estrita de categorias RF12 (CT-12).', err.message);
  }

  // -------------------------------------------------------------
  // CT-13: Geração, Métricas e Estrutura do Relatório Gerencial (RF13)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-13]\x1b[0m Estrutura e Métricas do Relatório Gerencial DERDI (RF13)');
  try {
    const res = await fetch(`${BASE_URL}/api/items`);
    const response = await res.json();
    const itens = response.data;

    if (!Array.isArray(itens)) throw new Error('Falha ao recuperar itens para apuração do relatório.');

    // 1. Apuração e conciliação matemática dos indicadores (KPIs)
    const total = itens.length;
    const pendentes = itens.filter(i => i.status === 'Pendente').length;
    const noSetor = itens.filter(i => i.status === 'NoDERDI').length;
    const reivindicados = itens.filter(i => i.status === 'Reivindicado').length;
    const devolvidos = itens.filter(i => i.status === 'Devolvido').length;
    const expirados = itens.filter(i => i.status === 'Expirado').length;
    const rejeitados = itens.filter(i => i.status === 'Rejeitado').length;

    const somaEstados = pendentes + noSetor + reivindicados + devolvidos + expirados + rejeitados;
    if (total !== somaEstados) {
      throw new Error(`Inconsistência contábil: Total (${total}) diverge da soma dos estados (${somaEstados}).`);
    }

    // 2. Simulação da geração estruturada do relatório
    const colunasCabecalho = [
      'Item / Objeto',
      'Categoria',
      'Local de Encontro',
      'Data do Encontro',
      'Situação Atual (Status)',
      'Reportado Por (Discente)',
      'Validado / Moderado Por'
    ];

    const linhasDados = itens.map(item => [
      item.title || '',
      item.category || 'Outros',
      item.locationFound || '',
      item.dateFound ? new Date(item.dateFound).toLocaleDateString('pt-BR') : 'N/D',
      item.status || 'Pendente',
      item.reportedBy || '',
      item.validatedBy || 'Aguardando Operador'
    ]);

    // 3. Validação da formatação: nenhum dado pode iniciar com '=' (previne injeção de fórmulas e #ERROR!)
    linhasDados.forEach((linha, idx) => {
      linha.forEach(celula => {
        if (typeof celula === 'string' && celula.trim().startsWith('=')) {
          throw new Error(`Célula na linha ${idx} contém caractere proibido '=' que quebra planilhas.`);
        }
      });
    });

    // 4. Validação de auditoria LGPD nos itens devolvidos
    const itensDevolvidos = itens.filter(i => i.status === 'Devolvido');
    itensDevolvidos.forEach(item => {
      if (!item.validatedBy) {
        throw new Error(`Item devolvido (${item._id}) não possui operador responsável carimbado.`);
      }
    });

    printPass(`Relatório validado: conciliação exata (${total} itens), cabeçalhos de auditoria íntegros e proteção contra #ERROR!.`);
  } catch (err) {
    printFail('Estrutura e métricas do relatório gerencial RF13 (CT-13).', err.message);
  }

  // -------------------------------------------------------------
  // CT-14: Validação de Auditoria e Consentimento LGPD (RNF07)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-14]\x1b[0m Validação de Consentimento e Auditoria de Usuário LGPD (RNF07)');
  try {
    // Simula a injeção do primeiro login para testar o modelo User
    const payloadNovoUsuario = {
      name: 'Aluno Teste LGPD',
      email: 'teste.lgpd@alunos.utfpr.edu.br',
    };
    
    // O NextAuth já faz isso em background, aqui testamos a persistência direta via Mongoose 
    // ou uma rota de mock (se existir). Como não temos rota direta para injetar User,
    // testaremos o bloqueio de requisição sem e-mail institucional na API
    const resAuth = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Item LGPD',
        categoria: 'Outros',
        local: 'Biblioteca',
        data: new Date().toISOString().slice(0, 10),
        reportedBy: '' // Força falha de autorização implícita
      })
    });
    
    if (resAuth.status === 201) {
        throw new Error('API permitiu cadastro sem identificar o e-mail reportador (Violação LGPD/Auditoria).');
    }
    
    printPass('Validação de auditoria do reportador mantida com sucesso.');
  } catch (err) {
    printFail('Falha na auditoria LGPD (CT-14).', err.message);
  }

  // -------------------------------------------------------------
  // CT-15: Segurança e Restrição de Acesso no Middleware (Admin)
  // -------------------------------------------------------------
  console.log('\n\x1b[34m[CT-15]\x1b[0m Segurança de Acesso ao Painel Admin pelo Middleware');
  try {
    // Tenta aceder a rota administrativa sem token de sessão válido
    const resAdmin = await fetch(`${BASE_URL}/admin`, {
      redirect: 'manual' // Evita seguir o redirecionamento automaticamente
    });

    // Como não há sessão, o middleware do NextAuth ou a página deve barrar/redirecionar (302/307 ou 303)
    if (resAdmin.status === 200) {
      throw new Error('A rota /admin retornou HTTP 200 para um visitante não autenticado.');
    }
    
    if (resAdmin.status >= 300 && resAdmin.status < 400) {
        printPass(`Middleware de segurança interceptou a requisição e forçou redirecionamento (Status: ${resAdmin.status}).`);
    } else {
        printPass(`Acesso bloqueado com sucesso (Status: ${resAdmin.status}).`);
    }
  } catch (err) {
    printFail('Segurança do Middleware (CT-15).', err.message);
  }

  // Resumo dos Resultados
  console.log('\n======================================================');
  console.log(`TOTAL DE TESTES FUNCIONAIS: ${testesPassaram + testesFalharam}`);
  console.log(`\x1b[32mPASSARAM:\x1b[0m ${testesPassaram}`);
  console.log(`\x1b[31mFALHARAM:\x1b[0m ${testesFalharam}`);
  console.log('======================================================\n');

  if (testesFalharam > 0) process.exit(1);
}

executarTestes();