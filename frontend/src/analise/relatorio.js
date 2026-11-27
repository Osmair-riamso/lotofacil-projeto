// src/analise/relatorio.js

function safeEntries(obj) {
  return Object.entries(obj || {});
}

export function gerarComentarios(chave, jogo, analise, tresMais = [], doisMenos = []) {
  const leitura = [];
  const numeros = (jogo || []).map(n => String(n).padStart(2, '0')).sort((a, b) => Number(a) - Number(b));

  if (numeros.length === 0) {
    return { leitura: ['Jogo vazio — não há números para analisar.'] };
  }

  leitura.push(`Chave ${chave}: ${numeros.join(', ')}`);

  if (analise?.seq?.maiorTamanho > 0) {
    leitura.push(`Maior sequência de números consecutivos: ${analise.seq.maiorTamanho}.`);
  }

  if (typeof analise?.impares === 'number' && typeof analise?.pares === 'number') {
    leitura.push(`Distribuição ímpar/par: ${analise.impares}/${analise.pares}.`);
  }

  const faixas = safeEntries(analise?.faixas);
  if (faixas.length > 0) {
    const faixaMais = faixas.sort((a, b) => b[1] - a[1])[0];
    const faixaMenos = faixas.sort((a, b) => a[1] - b[1])[0];
    leitura.push(`Faixa mais presente: ${faixaMais[0]} (${faixaMais[1]} números).`);
    leitura.push(`Faixa menos presente: ${faixaMenos[0]} (${faixaMenos[1]} números).`);
  }

  const fixosNoJogo = numeros.filter(n => (tresMais || []).includes(n)).length;
  const azaroesNoJogo = numeros.filter(n => (doisMenos || []).includes(n)).length;

  leitura.push(`Fixos principais no jogo: ${fixosNoJogo}.`);
  leitura.push(`Azarões no jogo: ${azaroesNoJogo}.`);

  if (analise?.eq?.label) {
    leitura.push(`Equilíbrio entre faixas: ${analise.eq.label}.`);
  }

  return { leitura };
}

export function gerarRelatorio(chave, jogo, analise, { tresMais, doisMenos } = {}) {
  return gerarComentarios(chave, jogo, analise, tresMais, doisMenos);
}
