// src/tests/load_stress.mjs
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:3000';
const TOTAL_REQUISICOES = 500;
const CONCORRENCIA = 50;

async function dispararRequisicao(id) {
  const inicio = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/api/items`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const duracao = performance.now() - inicio;
    return { id, status: res.status, duracao, sucesso: res.ok };
  } catch (err) {
    const duracao = performance.now() - inicio;
    return { id, status: 500, duracao, sucesso: false, erro: err.message };
  }
}

async function rodarTesteCarga() {
  console.log('\n======================================================');
  console.log('   [CT-11] TESTE DE CARGA, GARGALOS E CONCORRÊNCIA (RNF04)');
  console.log(`   Carga: ${TOTAL_REQUISICOES} requisições | Lotes concorrentes: ${CONCORRENCIA}`);
  console.log('======================================================\n');

  const resultados = [];
  const tempoInicioTotal = performance.now();

  for (let i = 0; i < TOTAL_REQUISICOES; i += CONCORRENCIA) {
    const lote = [];
    for (let j = 0; j < CONCORRENCIA && i + j < TOTAL_REQUISICOES; j++) {
      lote.push(dispararRequisicao(i + j + 1));
    }
    const respostasLote = await Promise.all(lote);
    resultados.push(...respostasLote);
    process.stdout.write(`\rProcessadas: ${resultados.length}/${TOTAL_REQUISICOES} requisições...`);
  }

  const tempoTotalGasto = (performance.now() - tempoInicioTotal) / 1000;
  console.log('\n\nFinalizado! Processando métricas de latência...');

  const tempos = resultados.map(r => r.duracao).sort((a, b) => a - b);
  const sucessos = resultados.filter(r => r.sucesso).length;
  const falhas = resultados.filter(r => !r.sucesso).length;

  const tempoMedio = tempos.reduce((acc, v) => acc + v, 0) / tempos.length;
  const tempoMinimo = tempos[0];
  const tempoMaximo = tempos[tempos.length - 1];

  const p95 = tempos[Math.floor(tempos.length * 0.95)];
  const p99 = tempos[Math.floor(tempos.length * 0.99)];
  const vazao = (TOTAL_REQUISICOES / tempoTotalGasto).toFixed(2);

  console.log('\n--- RESULTADOS OBTIDOS (MÉTRICAS DO RNF04) ---');
  console.log(`Taxa de Sucesso:             ${((sucessos / TOTAL_REQUISICOES) * 100).toFixed(1)}% (${sucessos} OK / ${falhas} Erros)`);
  console.log(`Vazão Estimada:              ${vazao} requisições/segundo`);
  console.log(`Tempo Mínimo:                ${tempoMinimo.toFixed(2)} ms`);
  console.log(`Tempo Médio:                 ${tempoMedio.toFixed(2)} ms`);
  console.log(`Percentil 95 (P95):          ${p95.toFixed(2)} ms`);
  console.log(`Percentil 99 (P99):          ${p99.toFixed(2)} ms`);
  console.log(`Tempo Máximo (Pior caso):    ${tempoMaximo.toFixed(2)} ms`);

  console.log('\n--- AVALIAÇÃO DE GARGALOS (BOTTLENECK ANALYSIS) ---');
  if (p95 < 3000) {
    console.log('\x1b[32m[CONFORME]\x1b[0m O tempo de resposta P95 está abaixo do limite estipulado de 3.000 ms (RNF04).');
  } else {
    console.log('\x1b[31m[GARGALO]\x1b[0m O P95 ultrapassou 3.000 ms.');
  }

  if (falhas > 0) {
    console.log('\x1b[31m[GARGALO DETECTADO]\x1b[0m Houve recusa de conexões sob concorrência.');
  } else {
    console.log('\x1b[32m[CONFORME]\x1b[0m Nenhuma falha de conexão ou esgotamento de sockets HTTP.');
  }
  console.log('======================================================\n');
}

rodarTesteCarga();