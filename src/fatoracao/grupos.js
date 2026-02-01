// src/fatoracao/grupos.js

/**
 * Divide um jogo de 15 números em 5 grupos (ABCDE)
 * Cada grupo recebe 3 números
 */
export function criarGruposABCDE(jogo) {
  if (jogo.length !== 15) {
    throw new Error('Jogo precisa ter exatamente 15 números');
  }

  const ordenado = [...jogo]
    .map(n => Number(n))
    .sort((a, b) => a - b)
    .map(n => String(n).padStart(2, '0'));

  return {
    A: ordenado.slice(0, 3),
    B: ordenado.slice(3, 6),
    C: ordenado.slice(6, 9),
    D: ordenado.slice(9, 12),
    E: ordenado.slice(12, 15)
  };
}
