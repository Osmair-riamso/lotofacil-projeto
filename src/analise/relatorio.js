// src/analise/relatorio.js

function toNumberArray(jogo) {
  return jogo.map(n => Number(n)).sort((a, b) => a - b);
}

// 🔗 Sequências
export function analisarSequencias(jogo) {
  const nums = toNumberArray(jogo);

  let maior = [];
  let atual = [nums[0]];

  for (let i = 1; i < nums.length; i++) {
    if (nums[i] === nums[i - 1] + 1) {
      atual.push(nums[i]);
    } else {
      if (atual.length > maior.length) maior = [...atual];
      atual = [nums[i]];
    }
  }

  if (atual.length > maior.length) maior = [...atual];

  return {
    maiorTamanho: maior.length,
    maiorSequencia: maior.map(n => String(n).padStart(2, '0'))
  };
}

// 📊 Distribuição por faixas
export function distribuicaoPorFaixa(jogo) {
  const faixas = {
    '01-05': 0,
    '06-10': 0,
    '11-15': 0,
    '16-20': 0,
    '21-25': 0
  };

  jogo.forEach(n => {
    const num = Number(n);
    if (num <= 5) faixas['01-05']++;
    else if (num <= 10) faixas['06-10']++;
    else if (num <= 15) faixas['11-15']++;
    else if (num <= 20) faixas['16-20']++;
    else faixas['21-25']++;
  });

  return faixas;
}

// ⚖️ Leitura simples
export function avaliarEquilibrio(faixas) {
  const valores = Object.values(faixas);
  const max = Math.max(...valores);
  const min = Math.min(...valores);

  if (max - min <= 2) return 'equilibrado';
  if (max - min <= 4) return 'atenção';
  return 'concentrado';
}
