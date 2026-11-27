// src/fatoracao/combinador.js

import { sortear } from './aleatorio.js';

const CHAVES = [
  'ABC', 'ABD', 'ABE', 'ACD', 'ACE', 'ADE',
  'BCD', 'BCE', 'BDE', 'CDE', 'X1', 'X2',
  'ALE1', 'ALE2', 'ALE3'
];

function garantir15Unicos(jogo, base20) {
  const entrada = Array.isArray(jogo) ? jogo : [];
  const base = Array.isArray(base20) ? base20 : [];

  const unicos = [...new Set(entrada.map(n => String(n).padStart(2, '0')))].filter(Boolean);
  const usados = new Set(unicos);

  for (const n of base) {
    const num = String(n).padStart(2, '0');
    if (!usados.has(num)) {
      unicos.push(num);
      usados.add(num);
      if (unicos.length === 15) break;
    }
  }

  return unicos
    .map(n => Number(n))
    .sort((a, b) => a - b)
    .map(n => String(n).padStart(2, '0'));
}

export function gerarJogosFatorados(grupos, x1, x2, aleatorios) {
  const [A, B, C, D, E] = grupos;
  const mapa = {};

  const combinacoes = {
    ABC: [A, B, C],
    ABD: [A, B, D],
    ABE: [A, B, E],
    ACD: [A, C, D],
    ACE: [A, C, E],
    ADE: [A, D, E],
    BCD: [B, C, D],
    BCE: [B, C, E],
    BDE: [B, D, E],
    CDE: [C, D, E],
    X1: [x1],
    X2: [x2],
    ALE1: [aleatorios[0]],
    ALE2: [aleatorios[1]],
    ALE3: [aleatorios[2]]
  };

  for (const chave of CHAVES) {
    const nums = (combinacoes[chave] || []).flat();
    mapa[chave] = [...new Set(nums.map(n => String(n).padStart(2, '0')).filter(Boolean))]
      .sort((a, b) => Number(a) - Number(b));
  }

  return mapa;
}

export function combinarComFixos(jogosFatorados, fixos5, base20) {
  const jogosFinais = {};

  let fixos = base20.slice(0, 5);
  if (Array.isArray(fixos5) && fixos5.length >= 3) {
    fixos = fixos5;
  }

  for (const chave in jogosFatorados) {
    const fatorado = jogosFatorados[chave].map(n => String(n).padStart(2, '0'));
    const fixosSorteados = sortear(fixos, 3).map(n => String(n).padStart(2, '0'));
    const combinado = [...new Set([...fatorado, ...fixosSorteados])];
    jogosFinais[chave] = garantir15Unicos(combinado, base20);
  }

  return jogosFinais;
}
