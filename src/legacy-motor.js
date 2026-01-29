import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// =======================
// SETUP
// =======================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar BD LOTO
const bdLotoPath = path.resolve(__dirname, '../data/bd-loto.json');
const bdLoto = JSON.parse(fs.readFileSync(bdLotoPath, 'utf-8'));

// Ordenar do mais recente para o mais antigo
bdLoto.sort((a, b) => b.concurso - a.concurso);

// Números fixos da Lotofácil (01 a 25)
const NUMEROS = Array.from({ length: 25 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);

// =======================
// FUNÇÕES BÁSICAS
// =======================

function contarFrequencias(concursos) {
  const freq = Object.fromEntries(NUMEROS.map(n => [n, 0]));

  concursos.forEach(concurso => {
    concurso.numeros.forEach(n => {
      freq[n]++;
    });
  });

  return freq;
}

function freqParaArray(freq) {
  return Object.entries(freq).map(([numero, qtd]) => ({
    numero,
    qtd
  }));
}

// =======================
// CURTO PRAZO
// =======================

function identificarQuentes(freqUltimos10, quantidade = 3) {
  return freqParaArray(freqUltimos10)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, quantidade)
    .map(i => i.numero);
}

function identificarAzaroes(freqUltimos10, quentes, quantidade = 2) {
  return freqParaArray(freqUltimos10)
    .filter(i => !quentes.includes(i.numero))
    .sort((a, b) => a.qtd - b.qtd)
    .slice(0, quantidade)
    .map(i => i.numero);
}

// =======================
// BASE E CRUZAMENTO
// =======================

function criarBase20(quentes, azaroes) {
  return NUMEROS.filter(
    n => !quentes.includes(n) && !azaroes.includes(n)
  );
}

function cruzarBase(base20, freqUltimos10, freqHist, quantidade = 10) {

  const rankCurto = [...base20]
    .sort((a, b) => freqUltimos10[b] - freqUltimos10[a]);

  const rankLongo = [...base20]
    .sort((a, b) => freqHist[b] - freqHist[a]);

  const score = base20.map(n => {
    const posCurto = rankCurto.indexOf(n);
    const posLongo = rankLongo.indexOf(n);

    return {
      numero: n,
      score: posCurto + posLongo // menor = melhor
    };
  });

  return score
    .sort((a, b) => a.score - b.score)
    .slice(0, quantidade)
    .map(i => i.numero);
}


// =======================
// CONFERÊNCIA
// =======================

function conferirAcertos(jogo, resultado) {
  const resultadoStr = resultado.map(n => String(n).padStart(2, '0'));
  return jogo.filter(n => resultadoStr.includes(n)).length;
}


// =======================
// SIMULAÇÃO HISTÓRICA (SANIDADE)
// =======================

function simularMetodo(qtdSimulacoes = 200) {
  const estatisticas = {};

  for (let i = 0; i < Math.min(qtdSimulacoes, bdLoto.length - 11); i++) {

    const resultadoReal = bdLoto[i].numeros;

    const ultimos10 = bdLoto.slice(i + 1, i + 11);
    const freqUltimos10 = contarFrequencias(ultimos10);

    const quentes = identificarQuentes(freqUltimos10, 3);
    const azaroes = identificarAzaroes(freqUltimos10, quentes, 2);
    const base20 = criarBase20(quentes, azaroes);

    const historico = bdLoto.slice(i + 1);
    const freqHist = contarFrequencias(historico);

    const cruzados = cruzarBase(base20, freqUltimos10, freqHist, 10);
    const jogo = [...quentes, ...azaroes, ...cruzados];

    const acertos = conferirAcertos(jogo, resultadoReal);

    estatisticas[acertos] = (estatisticas[acertos] || 0) + 1;
  }

  return estatisticas;
}

// =======================
// EXECUÇÃO ATUAL
// =======================

const ultimos10Atual = bdLoto.slice(0, 10);
const freqUltimos10Atual = contarFrequencias(ultimos10Atual);

const quentesAtual = identificarQuentes(freqUltimos10Atual, 3);
const azaroesAtual = identificarAzaroes(freqUltimos10Atual, quentesAtual, 2);
const base20Atual = criarBase20(quentesAtual, azaroesAtual);

const freqHistAtual = contarFrequencias(bdLoto);
const cruzadosAtual = cruzarBase(base20Atual, freqUltimos10Atual, freqHistAtual, 10);

const jogoFinalAtual = [...quentesAtual, ...azaroesAtual, ...cruzadosAtual];

console.log('🔥 Quentes:', quentesAtual);
console.log('📉 Azarões:', azaroesAtual);
console.log('🧩 Base 20:', base20Atual);
console.log('✖️ Cruzados (10):', cruzadosAtual);
console.log('🎯 Jogo Final (15):', jogoFinalAtual);

console.log('\n🧪 SIMULAÇÃO HISTÓRICA (TESTE DE SANIDADE)');
const resultadoSimulacao = simularMetodo(200);
console.table(resultadoSimulacao);
