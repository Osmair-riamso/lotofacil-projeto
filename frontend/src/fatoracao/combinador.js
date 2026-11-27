// src/fatoracao/combinador.js

import { sortear } from './aleatorio.js';

const CHAVES = [
  'ABC', 'ABD', 'ABE', 'ACD', 'ACE', 'ADE',
  'BCD', 'BCE', 'BDE', 'CDE', 'X1', 'X2',
  'ALE1', 'ALE2', 'ALE3'
];

/**
 * Garante um array de 15 números únicos, preenchendo com a base20 se faltar.
 */
function garantir15Unicos(jogo, base20) {
  const unicos = [...new Set(jogo.map(n => String(n).padStart(2, '0')))];
  const usados = new Set(unicos);

  for (const n of base20) {
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

/**
 * Gera os 12 números fatorados para cada chave ABCDE, X1/X2 e ALE.
 */
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
    const nums = combinacoes[chave].flat();
    mapa[chave] = [...new Set(nums.map(n => String(n).padStart(2, '0')))]
      .sort((a, b) => Number(a) - Number(b));
  }

  return mapa;
}

/**
 * Combina 12 números fatorados com 3 fixos (sem duplicar) e garante 15 únicos.
 */
export function combinarComFixos(jogosFatorados, fixos5, base20) {
  const jogosFinais = {};

  for (const chave in jogosFatorados) {
    const fatorado = jogosFatorados[chave].map(n => String(n).padStart(2, '0'));
    const fixosSorteados = sortear(fixos5, 3).map(n => String(n).padStart(2, '0'));
    const combinado = [...new Set([...fatorado, ...fixosSorteados])];
    jogosFinais[chave] = garantir15Unicos(combinado, base20);
  }

  return jogosFinais;
}
