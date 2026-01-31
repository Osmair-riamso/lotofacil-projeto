// src/core/historico.js

import { NUMEROS } from './estatistica.js';

/**
 * Conta frequência histórica completa
 */
export function contarFrequenciaHistorica(bd) {
  const freq = Object.fromEntries(NUMEROS.map(n => [n, 0]));

  bd.forEach(concurso => {
    concurso.numeros.forEach(n => {
      const num = String(n).padStart(2, '0');
      freq[num]++;
    });
  });

  return freq;
}

/**
 * Classifica números em zonas históricas
 * topo, meio e fundo
 */
export function classificarZonas(freqHist) {
  const ordenados = Object.entries(freqHist)
    .sort((a, b) => b[1] - a[1])
    .map(([n]) => n);

  const total = ordenados.length;
  const topo = ordenados.slice(0, Math.floor(total * 0.2));   // 20%
  const fundo = ordenados.slice(Math.floor(total * 0.8));     // 20%
  const meio = ordenados.slice(
    Math.floor(total * 0.2),
    Math.floor(total * 0.8)
  );

  return { topo, meio, fundo };
}
