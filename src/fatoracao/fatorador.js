// src/fatoracao/fatorador.js

/**
 * Gera jogos fatorados a partir dos grupos ABCDE
 */
export function gerarJogosFatorados(grupos) {
  const { A, B, C, D, E } = grupos;

  return {
    ABC: [...A, ...B, ...C],
    ABD: [...A, ...B, ...D],
    ABE: [...A, ...B, ...E],
    ACD: [...A, ...C, ...D],
    ACE: [...A, ...C, ...E],
    ADE: [...A, ...D, ...E],
    BCD: [...B, ...C, ...D],
    BDE: [...B, ...D, ...E]
  };
}
