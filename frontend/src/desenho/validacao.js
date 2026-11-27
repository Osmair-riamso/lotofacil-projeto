// src/desenho/validacao.js

import { analisarSequencias } from './sequencia.js';

export function jogoValido(jogo, limiteSequencia = 5) {
  const analise = analisarSequencias(jogo);

  return {
    valido: analise.maiorTamanho <= limiteSequencia,
    analise
  };
}
