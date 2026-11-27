// src/core/estatistica.js

export const NUMEROS = Array.from({ length: 25 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);

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

export function agruparPorFaixa(freq) {
  const faixas = {};

  Object.entries(freq).forEach(([numero, qtd]) => {
    if (!faixas[qtd]) faixas[qtd] = [];
    faixas[qtd].push(numero);
  });

  return faixas;
}

export function faixasOrdenadas(faixas) {
  return Object.keys(faixas)
    .map(Number)
    .sort((a, b) => b - a);
}
