// src/core/selecao.js

import { NUMEROS } from './estatistica.js';

/**
 * Seleciona os 3 mais frequentes (travados)
 */
export function selecionarTresMais(faixasOrdenadas, faixas) {
  const maiorFaixa = faixasOrdenadas[0];
  const candidatos = [...faixas[maiorFaixa]];

  return candidatos.slice(0, 3);
}

/**
 * Seleciona os 2 menos frequentes (azarões)
 */
export function selecionarDoisMenos(faixasOrdenadas, faixas) {
  const menorFaixa = faixasOrdenadas[faixasOrdenadas.length - 1];
  return [...faixas[menorFaixa]].slice(0, 2);
}

/**
 * Cria base de 20 números
 */
export function criarBase20(tresMais, doisMenos) {
  return NUMEROS.filter(
    n => !tresMais.includes(n) && !doisMenos.includes(n)
  );
}

/**
 * Seleciona os 10 números da base seguindo as faixas (≥6x)
 */
export function selecionarDezNumeros(base20, faixasOrdenadas, faixas) {
  const selecionados = [];

  for (const faixa of faixasOrdenadas) {
    if (faixa < 6) break;

    const numerosFaixa = faixas[faixa] || [];

    numerosFaixa.forEach(n => {
      if (base20.includes(n) && selecionados.length < 10) {
        selecionados.push(n);
      }
    });

    if (selecionados.length === 10) break;
  }

  return selecionados;
}

/**
 * Completa os 10 números usando zona média histórica
 */
export function complementarComHistorico(
  selecionados,
  base20,
  zonasHistoricas
) {
  const { meio } = zonasHistoricas;

  for (const n of meio) {
    if (
      base20.includes(n) &&
      !selecionados.includes(n) &&
      selecionados.length < 10
    ) {
      selecionados.push(n);
    }

    if (selecionados.length === 10) break;
  }

  return selecionados;
}
