// src/index.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  contarFrequencias,
  agruparPorFaixa,
  faixasOrdenadas
} from './core/estatistica.js';

import {
  selecionarTresMais,
  selecionarDoisMenos,
  criarBase20,
  selecionarDezNumeros,
  complementarComHistorico
} from './core/selecao.js';

import {
  contarFrequenciaHistorica,
  classificarZonas
} from './core/historico.js';

// =======================
// SETUP
// =======================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler BD LOTO
const bdPath = path.resolve(__dirname, '../data/bd-loto.json');
const bd = JSON.parse(fs.readFileSync(bdPath, 'utf-8'));

// Ordenar do mais recente para o mais antigo
bd.sort((a, b) => b.concurso - a.concurso);

// =======================
// CURTO PRAZO — ÚLTIMOS 10
// =======================

const ultimos10 = bd.slice(0, 10);

// Estatística
const freq = contarFrequencias(ultimos10);
const faixas = agruparPorFaixa(freq);
const faixasOrd = faixasOrdenadas(faixas);

// =======================
// SELEÇÃO BASE
// =======================

const tresMais = selecionarTresMais(faixasOrd, faixas);
const doisMenos = selecionarDoisMenos(faixasOrd, faixas);
const base20 = criarBase20(tresMais, doisMenos);

// Seleção inicial dos 10 (curto prazo)
let dezSelecionados = selecionarDezNumeros(base20, faixasOrd, faixas);

// =======================
// COMPLEMENTO HISTÓRICO (SE FALTAR)
// =======================

if (dezSelecionados.length < 10) {
  const freqHist = contarFrequenciaHistorica(bd);
  const zonas = classificarZonas(freqHist);

  dezSelecionados = complementarComHistorico(
    dezSelecionados,
    base20,
    zonas
  );
}

// =======================
// SAÍDA
// =======================

console.log('📊 Faixas:', faixasOrd);
console.log('🔥 3 Mais:', tresMais);
console.log('📉 2 Menos:', doisMenos);
console.log('🧩 Base 20:', base20);
console.log('✖️ 10 Selecionados:', dezSelecionados);
console.log('🎯 Jogo Parcial (sem desenho):', [
  ...tresMais,
  ...doisMenos,
  ...dezSelecionados
]);
import { analisarSequencias } from './desenho/sequencia.js';

const jogoTeste = [
  ...tresMais,
  ...doisMenos,
  ...dezSelecionados
];

const analiseSeq = analisarSequencias(jogoTeste);

console.log('🔍 Análise de Sequência:', analiseSeq);
