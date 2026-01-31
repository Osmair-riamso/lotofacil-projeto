// src/desenho/validacao.js

import { analisarSequencias } from './sequencia.js';

/**
 * Valida o jogo com base no desenho (sequência)
 * Regra:
 * - sequência máxima aceitável = 5
 */
export function jogoValido(jogo, limiteSequencia = 5) {
  const analise = analisarSequencias(jogo);

  return {
    valido: analise.maiorTamanho <= limiteSequencia,
    analise
  };
}
