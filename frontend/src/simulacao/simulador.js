// src/simulacao/simulador.js

/**
 * Simula quantos acertos o jogo teria dado em cada concurso do histórico.
 * Retorna estatísticas de acertos (11, 12, 13, 14, 15) e o máximo atingido.
 */
export function simularContraHistorico(jogo, historico, limite = 200) {
  const base = historico.slice(0, limite);
  const estatisticas = {};

  let maxAcertos = 0;

  base.forEach(concurso => {
    const sorteado = new Set(concurso.numeros.map(n => String(n).padStart(2, '0')));
    const acertos = jogo.filter(n => sorteado.has(n)).length;

    if (acertos > maxAcertos) maxAcertos = acertos;

    estatisticas[acertos] = (estatisticas[acertos] || 0) + 1;
  });

  return {
    maxAcertos,
    estatisticas
  };
}

/**
 * Simula o melhor jogo contra o histórico e devolve no formato usado pela UI.
 */
export function simularMelhorJogo(jogo, historico, limite = 200) {
  const { maxAcertos, estatisticas } = simularContraHistorico(jogo, historico, limite);

  // Garante que todas as faixas de acertos apareçam, mesmo com 0
  const detalhes = {};
  for (let i = 11; i <= 15; i++) {
    detalhes[i] = estatisticas[i] || 0;
  }

  return {
    maximo: maxAcertos,
    total: limite,
    detalhes
  };
}
