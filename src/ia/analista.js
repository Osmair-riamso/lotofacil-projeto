// src/ia/analista.js

export function comentarJogo({
  chave,
  sequencia,
  distribuicao,
  equilibrio
}) {
  const leitura = [];

  // 🔗 Sequência
  if (sequencia.maiorTamanho <= 4) {
    leitura.push('Sequência curta, desenho confortável.');
  } else if (sequencia.maiorTamanho <= 6) {
    leitura.push('Sequência moderada, dentro do aceitável.');
  } else {
    leitura.push(
      'Sequência longa. Estatisticamente mais arriscado.'
    );
  }

  // 📊 Distribuição
  const valores = Object.values(distribuicao);
  const max = Math.max(...valores);

  if (max >= 6) {
    leitura.push(
      'Concentração elevada em uma faixa.'
    );
  } else {
    leitura.push(
      'Distribuição bem espalhada.'
    );
  }

  // ⚖️ Equilíbrio
  if (equilibrio === 'equilibrado') {
    leitura.push('Desenho geral harmônico.');
  } else if (equilibrio === 'atenção') {
    leitura.push('Desenho exige atenção.');
  } else {
    leitura.push('Desenho pesado, pode ser descartado.');
  }

  return {
    jogo: chave,
    leitura
  };
}
