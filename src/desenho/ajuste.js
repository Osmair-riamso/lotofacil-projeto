// src/desenho/ajuste.js

import { analisarSequencias } from './sequencia.js';

/**
 * Ajusta o jogo quebrando a maior sequência
 * Regras refinadas:
 * - não mexe nos 3 mais
 * - evita extremidades da sequência
 * - prioriza o meio
 * - troca no máximo 1 número
 */
export function ajustarJogo({
  jogo,
  tresMais,
  base20,
  limiteSequencia = 5
}) {
  const analise = analisarSequencias(jogo);

  // Se já é válido, não mexe
  if (analise.maiorTamanho <= limiteSequencia) {
    return { ajustado: false, jogo };
  }

  const seq = analise.maiorSequencia;

  // Candidatos à remoção (tirando 3 mais)
  let candidatos = seq.filter(n => !tresMais.includes(n));

  if (candidatos.length === 0) {
    return { ajustado: false, jogo };
  }

  // 🔹 Priorizar o meio da sequência
  const meio = candidatos.slice(1, -1);
  if (meio.length > 0) {
    candidatos = meio;
  }

  // Tentar remover seguindo prioridade
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

