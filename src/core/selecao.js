// src/core/selecao.js

import { NUMEROS } from './estatistica.js';

/**
 * Seleciona os 3 mais frequentes (travados)
 */
export function selecionarTresMais(faixasOrd, faixas) {
  const resultado = [];

  for (const faixa of faixasOrd) {
    const numeros = faixas[faixa] || [];

    for (const n of numeros) {
      if (!resultado.includes(n)) {
        resultado.push(n);
      }

      if (resultado.length === 3) {
        return resultado;
      }
    }
  }

  // 🔒 GARANTIA MATEMÁTICA FINAL
  // Se não conseguiu 3 pelas faixas, completa com 01–25
  if (resultado.length < 3) {
    const todos = Array.from({ length: 25 }, (_, i) =>
      String(i + 1).padStart(2, '0')
    );

    for (const n of todos) {
      if (!resultado.includes(n)) {
        resultado.push(n);
      }

      if (resultado.length === 3) break;
    }
  }

  return resultado;
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
