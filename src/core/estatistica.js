// src/core/estatistica.js

// Números fixos da Lotofácil
export const NUMEROS = Array.from({ length: 25 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);

/**
 * Conta frequência dos números em um conjunto de concursos
 */
export function contarFrequencias(concursos) {
  const freq = Object.fromEntries(NUMEROS.map(n => [n, 0]));

  concursos.forEach(concurso => {
    concurso.numeros.forEach(n => {
      const num = String(n).padStart(2, '0');
      freq[num]++;
    });
  });

  return freq;
}

/**
 * Agrupa números por faixa de ocorrência
 * Ex: { '10': ['25'], '9': ['10','14'], '8': [...] }
 */
export function agruparPorFaixa(freq) {
  const faixas = {};

  Object.entries(freq).forEach(([numero, qtd]) => {
    if (!faixas[qtd]) faixas[qtd] = [];
    faixas[qtd].push(numero);
  });

  return faixas;
}

/**
 * Retorna as faixas ordenadas da maior para a menor
 * Ex: [10, 9, 8, 7, 6, ...]
 */
export function faixasOrdenadas(faixas) {
  return Object.keys(faixas)
    .map(Number)
    .sort((a, b) => b - a);
}
