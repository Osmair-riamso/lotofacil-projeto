// src/desenho/sequencia.js

/**
 * Converte array de strings "01".."25" para números ordenados
 */
function normalizarEOrdenar(jogo) {
  return jogo
    .map(n => Number(n))
    .sort((a, b) => a - b);
}

/**
 * Analisa sequências consecutivas em um jogo
 * Retorna a maior sequência encontrada
 */
export function analisarSequencias(jogo) {
  const nums = normalizarEOrdenar(jogo);

  let maiorSequencia = [];
  let sequenciaAtual = [nums[0]];

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1] + 1) {
      sequenciaAtual.push(nums[i]);
    } else {
      if (sequenciaAtual.length > maiorSequencia.length) {
        maiorSequencia = [...sequenciaAtual];
      }
      sequenciaAtual = [nums[i]];
    }
  }

  // checar a última sequência
  if (sequenciaAtual.length > maiorSequencia.length) {
    maiorSequencia = [...sequenciaAtual];
  }

  return {
    maiorTamanho: maiorSequencia.length,
    maiorSequencia: maiorSequencia.map(n =>
      String(n).padStart(2, '0')
    )
  };
}
