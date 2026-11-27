// src/desenho/sequencia.js

/**
 * Analisa sequências consecutivas em um jogo de 15 números.
 * Retorna a maior sequência encontrada e seu tamanho.
 */
export function analisarSequencias(jogo) {
  const numeros = jogo.map(n => Number(n)).sort((a, b) => a - b);

  let maiorSequencia = [];
  let sequenciaAtual = [numeros[0]];

  for (let i = 1; i < numeros.length; i++) {
    if (numeros[i] === numeros[i - 1] + 1) {
      sequenciaAtual.push(numeros[i]);
    } else {
      if (sequenciaAtual.length > maiorSequencia.length) {
        maiorSequencia = [...sequenciaAtual];
      }
      sequenciaAtual = [numeros[i]];
    }
  }

  if (sequenciaAtual.length > maiorSequencia.length) {
    maiorSequencia = [...sequenciaAtual];
  }

  return {
    maiorSequencia: maiorSequencia.map(n => String(n).padStart(2, '0')),
    maiorTamanho: maiorSequencia.length
  };
}
