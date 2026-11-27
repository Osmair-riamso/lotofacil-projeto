// src/desenho/ajuste.js

import { analisarSequencias } from './sequencia.js';

export function ajustarJogo({ jogo, tresMais, base20, limiteSequencia = 5 }) {
  const analise = analisarSequencias(jogo);

  if (analise.maiorTamanho <= limiteSequencia) {
    return { ajustado: false, jogo };
  }

  let candidatos = analise.maiorSequencia.filter(n => !tresMais.includes(n));

  if (candidatos.length === 0) {
    return { ajustado: false, jogo };
  }

  const meio = candidatos.slice(1, -1);
  if (meio.length > 0) {
    candidatos = meio;
  }

  for (const remover of candidatos) {
    const jogoSem = jogo.filter(n => n !== remover);

    for (const candidato of base20) {
      if (jogoSem.includes(candidato)) continue;

      const jogoTeste = [...jogoSem, candidato];
      const novaAnalise = analisarSequencias(jogoTeste);

      if (novaAnalise.maiorTamanho <= limiteSequencia) {
        return {
          ajustado: true,
          removido: remover,
          adicionado: candidato,
          jogo: jogoTeste
            .map(n => Number(n))
            .sort((a, b) => a - b)
            .map(n => String(n).padStart(2, '0'))
        };
      }
    }
  }

  return { ajustado: false, jogo };
}
