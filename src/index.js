// src/index.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { simularHistorico } from './simulacao/simulador.js';


// ===== CORE =====
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

// ===== DESENHO =====
import { analisarSequencias } from './desenho/sequencia.js';
import { jogoValido } from './desenho/validacao.js';
import { ajustarJogo } from './desenho/ajuste.js';

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
// FASE 1 — ESTATÍSTICA
// =======================

// Últimos 10 sorteios
const ultimos10 = bd.slice(0, 10);

// Frequências
const freq = contarFrequencias(ultimos10);
const faixas = agruparPorFaixa(freq);
const faixasOrd = faixasOrdenadas(faixas);

// =======================
// FASE 1 — SELEÇÃO
// =======================

// Extremos
const tresMais = selecionarTresMais(faixasOrd, faixas);
const doisMenos = selecionarDoisMenos(faixasOrd, faixas);

// Base 20
const base20 = criarBase20(tresMais, doisMenos);

// Seleção inicial dos 10 (curto prazo)
let dezSelecionados = selecionarDezNumeros(base20, faixasOrd, faixas);

// Complemento histórico (se faltar)
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
// JOGO INICIAL (15)
// =======================

const jogoInicial = [
  ...tresMais,
  ...doisMenos,
  ...dezSelecionados
];

// =======================
// FASE 2.1 — DESENHO
// =======================

const analiseSeq = analisarSequencias(jogoInicial);
const validacao = jogoValido(jogoInicial);

// =======================
// FASE 2.2 — AJUSTE
// =======================

let jogoFinal = jogoInicial;
let infoAjuste = null;

if (!validacao.valido) {
  const resultadoAjuste = ajustarJogo({
    jogo: jogoInicial,
    tresMais,
    base20
  });

  if (resultadoAjuste.ajustado) {
    jogoFinal = resultadoAjuste.jogo;
    infoAjuste = resultadoAjuste;
  }
}

// =======================
// SAÍDA
// =======================

console.log('📊 Faixas:', faixasOrd);
console.log('🔥 3 Mais:', tresMais);
console.log('📉 2 Menos:', doisMenos);
console.log('🧩 Base 20:', base20);
console.log('✖️ 10 Selecionados:', dezSelecionados);

console.log('\n🎯 Jogo Inicial:', jogoInicial);
console.log('🔍 Análise de Sequência:', analiseSeq);
console.log('🧠 Validação do Desenho:', validacao);

if (infoAjuste) {
  console.log('\n🛠️ Ajuste aplicado:', {
    removido: infoAjuste.removido,
    adicionado: infoAjuste.adicionado
  });
  console.log('✅ Jogo Ajustado:', jogoFinal);
} else {
  console.log('\n✅ Jogo Final (sem ajuste):', jogoFinal);
}

console.log('\n🧪 SIMULAÇÃO HISTÓRICA (últimos 200 concursos)');
const resultadoSimulacao = simularHistorico(bd, 200);

console.log('📈 Máximo de acertos encontrado:', resultadoSimulacao.maxAcertos);
console.table(resultadoSimulacao.estatisticas);

// ===== FASE B — FATORAÇÃO =====
import { criarGruposABCDE } from './fatoracao/grupos.js';
import { gerarJogosFatorados } from './fatoracao/fatorador.js';

const grupos = criarGruposABCDE(jogoFinal);
const jogosFatorados = gerarJogosFatorados(grupos);

console.log('\n🧩 Grupos ABCDE:', grupos);
console.log('\n🧮 Jogos Fatorados:');
console.table(jogosFatorados);

