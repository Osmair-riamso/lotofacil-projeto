// src/index.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ===== SIMULAÇÃO =====
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

// ===== FATORAÇÃO =====
import { criarGruposABCDE } from './fatoracao/grupos.js';
import { gerarJogosFatorados } from './fatoracao/fatorador.js';
import { combinarComFixos } from './fatoracao/combinador.js';

// ===== ANÁLISE =====
import {
  distribuicaoPorFaixa,
  avaliarEquilibrio
} from './analise/relatorio.js';

// ===== IA =====
import { comentarJogo } from './ia/analista.js';

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

const ultimos10 = bd.slice(0, 10);

const freq = contarFrequencias(ultimos10);
const faixas = agruparPorFaixa(freq);
const faixasOrd = faixasOrdenadas(faixas);

// =======================
// FASE 1 — SELEÇÃO
// =======================

const tresMais = selecionarTresMais(faixasOrd, faixas);
const doisMenos = selecionarDoisMenos(faixasOrd, faixas);

const base20 = criarBase20(tresMais, doisMenos);

let dezSelecionados = selecionarDezNumeros(base20, faixasOrd, faixas);

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
// JOGO INICIAL
// =======================

const jogoInicial = [
  ...tresMais,
  ...doisMenos,
  ...dezSelecionados
];

// =======================
// DESENHO + AJUSTE
// =======================

const analiseSeq = analisarSequencias(jogoInicial);
const validacao = jogoValido(jogoInicial);

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
// SAÍDA BASE
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

// =======================
// FASE B — FATORAÇÃO
// =======================

const fixos5 = [...tresMais, ...doisMenos];

const grupos = criarGruposABCDE(base20);
const jogosFatorados = gerarJogosFatorados(grupos);
const jogosFinais = combinarComFixos(jogosFatorados, fixos5);

console.log('\n🧩 Grupos ABCDE:', grupos);
console.log('\n🧮 Jogos Fatorados (12):');
console.table(jogosFatorados);

console.log('\n🎯 Jogos Finais (15 números):');
console.table(jogosFinais);

// =======================
// FASE C — ANÁLISE
// =======================

console.log('\n📋 ANÁLISE DOS JOGOS\n');

for (const chave in jogosFinais) {
  const jogo = jogosFinais[chave];

  const seq = analisarSequencias(jogo);
  const dist = distribuicaoPorFaixa(jogo);
  const eq = avaliarEquilibrio(dist);

  console.log(`🧩 Jogo ${chave}`);
  console.log('Maior sequência:', seq.maiorSequencia, `(${seq.maiorTamanho})`);
  console.log('Distribuição:', dist);
  console.log('Equilíbrio:', eq);

  if (seq.maiorTamanho > 5) {
    console.log('🚨 Alerta: sequência longa');
  }

  console.log('-----------------------------');
}

// =======================
// FASE D — IA (osmAIr)
// =======================

console.log('\n🤖 osmAIr — Comentário Analítico\n');

for (const chave in jogosFinais) {
  const jogo = jogosFinais[chave];

  const comentario = comentarJogo({
    chave,
    sequencia: analisarSequencias(jogo),
    distribuicao: distribuicaoPorFaixa(jogo),
    equilibrio: avaliarEquilibrio(distribuicaoPorFaixa(jogo))
  });

  console.log(`🧠 Jogo ${chave}`);
  comentario.leitura.forEach(l => console.log('•', l));
  console.log('-----------------------------');
}

// =======================
// SIMULAÇÃO (OPCIONAL)
// =======================

console.log('\n🧪 SIMULAÇÃO HISTÓRICA (últimos 200 concursos)');
const resultadoSimulacao = simularHistorico(bd, 200);

console.log('📈 Máximo de acertos encontrado:', resultadoSimulacao.maxAcertos);
console.table(resultadoSimulacao.estatisticas);
