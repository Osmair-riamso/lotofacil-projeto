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
  selecionarDezNumeros
} from './core/selecao.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler BD LOTO
const bdPath = path.resolve(__dirname, '../data/bd-loto.json');
const bd = JSON.parse(fs.readFileSync(bdPath, 'utf-8'));

// Ordenar do mais recente para o mais antigo
bd.sort((a, b) => b.concurso - a.concurso);

// Últimos 10 sorteios
const ultimos10 = bd.slice(0, 10);

// Estatística
const freq = contarFrequencias(ultimos10);
const faixas = agruparPorFaixa(freq);
const faixasOrd = faixasOrdenadas(faixas);

// Seleções
const tresMais = selecionarTresMais(faixasOrd, faixas);
const doisMenos = selecionarDoisMenos(faixasOrd, faixas);
const base20 = criarBase20(tresMais, doisMenos);
const dezSelecionados = selecionarDezNumeros(base20, faixasOrd, faixas);

// Saída
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
