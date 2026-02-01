// src/fatoracao/combinador.js

function sortear(array, quantidade) {
  const copia = [...array];
  const resultado = [];

  while (resultado.length < quantidade && copia.length > 0) {
    const idx = Math.floor(Math.random() * copia.length);
    resultado.push(copia.splice(idx, 1)[0]);
  }

  return resultado;
}

/**
 * Combina jogos fatorados (12) com 3 fixos sorteados
 */
export function combinarComFixos(jogosFatorados, fixos5) {
  const jogosFinais = {};

  for (const chave in jogosFatorados) {
    const fatorado = jogosFatorados[chave];

    const fixosSorteados = sortear(fixos5, 3);

    const jogoFinal = [...fatorado, ...fixosSorteados]
      .map(n => Number(n))
      .sort((a, b) => a - b)
      .map(n => String(n).padStart(2, '0'));

    jogosFinais[chave] = jogoFinal;
  }

  return jogosFinais;
}
