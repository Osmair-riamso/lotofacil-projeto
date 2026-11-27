// src/core/selecao.js

import { NUMEROS } from './estatistica.js';

/**
 * Conta a frequência de cada número em uma lista de concursos.
 */
function calcularFrequencia(concursos) {
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
 * Ordena os números da mais frequente para a menos frequente.
 */
function ordenarPorFrequencia(freq) {
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1] || Number(a[0]) - Number(b[0]))
    .map(([n]) => n);
}

/**
 * Garante que a lista base20 tenha exatamente 20 números únicos,
 * completando com os demais números disponíveis se necessário.
 */
export function completarBase20(base20) {
  const resultado = base20
    .filter(Boolean)
    .map(n => String(n).padStart(2, '0'))
    .slice(0, 20);

  const usados = new Set(resultado);

  for (const n of NUMEROS) {
    if (!usados.has(n)) {
      resultado.push(n);
      usados.add(n);
      if (resultado.length === 20) break;
    }
  }

  return resultado;
}

/**
 * Seleciona os números base para alimentar o motor ABCDE.
 *
 * Estratégia:
 * - Top 10 dos últimos 10 sorteios (curto prazo)
 * - Top 10 dos últimos 300 sorteios (longo prazo)
 * - 3 fixos = 3 mais frequentes dos últimos 10
 * - 2 azarões = 2 menos frequentes dos últimos 10
 * - Base20 = top 20 dos últimos 10 sorteios
 */
export function selecionarNumeros(curtoPrazo, longoPrazo) {
  const freqCurto = calcularFrequencia(curtoPrazo);
  const freqLongo = calcularFrequencia(longoPrazo);

  const ordenadosCurto = ordenarPorFrequencia(freqCurto);
  const ordenadosLongo = ordenarPorFrequencia(freqLongo);

  // Top 10 curto e longo prazo
  const top10Curto = ordenadosCurto.slice(0, 10);
  const top10Longo = ordenadosLongo.slice(0, 10);

  // 3 mais frequentes dos últimos 10 (fixos principais)
  const tresMais = ordenadosCurto.slice(0, 3);

  // 2 menos frequentes dos últimos 10 (azarões)
  const doisMenos = ordenadosCurto.slice(-2);

  // Azarões de todos os tempos (menos frequentes no histórico completo)
  const azaroesCurto = ordenadosCurto.slice(-5);

  // Base20: top 20 dos últimos 10 sorteios
  const base20 = completarBase20(ordenadosCurto.slice(0, 20));

  return {
    top10Curto,
    top10Longo,
    tresMais,
    doisMenos,
    azaroesCurto,
    base20
  };
}
