import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolver caminho correto (necessário no ES Module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar BD LOTO
const bdLotoPath = path.resolve(__dirname, '../data/bd-loto.json');
const bdLoto = JSON.parse(fs.readFileSync(bdLotoPath, 'utf-8'));

// Garantir ordenação do mais recente para o mais antigo
bdLoto.sort((a, b) => b.concurso - a.concurso);

// Números fixos da Lotofácil (01 a 25)
const NUMEROS = Array.from({ length: 25 }, (_, i) =>
  String(i + 1).padStart(2, '0')
);

// Função: contar frequências
function contarFrequencias(concursos) {
  const freq = Object.fromEntries(NUMEROS.map(n => [n, 0]));

  concursos.forEach(concurso => {
    concurso.numeros.forEach(n => {
      freq[n]++;
    });
  });

  return freq;
}

// Função: pegar últimos concursos
function ultimosConcursos(qtd = 10) {
  return bdLoto.slice(0, qtd);
}
// Converter objeto de frequências em array
function freqParaArray(freq) {
  return Object.entries(freq).map(([numero, qtd]) => ({
    numero,
    qtd
  }));
}

// 🔥 Identificar quentes (maiores frequências - curto prazo)
function identificarQuentes(freqUltimos10, quantidade = 3) {
  return freqParaArray(freqUltimos10)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, quantidade)
    .map(i => i.numero);
}

// 📉 Identificar azarões (menores frequências, excluindo quentes)
function identificarAzaroes(freqUltimos10, quentes, quantidade = 2) {
  return freqParaArray(freqUltimos10)
    .filter(i => !quentes.includes(i.numero))
    .sort((a, b) => a.qtd - b.qtd)
    .slice(0, quantidade)
    .map(i => i.numero);
}

// Criar base de 20 números (remove quentes e azarões)
function criarBase20(quentes, azaroes) {
  return NUMEROS.filter(
    n => !quentes.includes(n) && !azaroes.includes(n)
  );
}

// Frequência histórica (BD inteiro)
function frequenciaHistorica() {
  return contarFrequencias(bdLoto);
}

// Ranking histórico ordenado
function rankingHistorico(freqHist) {
  return freqParaArray(freqHist)
    .sort((a, b) => b.qtd - a.qtd);
}

// Cruzamento estatístico da base
function cruzarBase(base20, freqUltimos10, freqHist, quantidade = 10) {
  const lista = base20.map(n => ({
    numero: n,
    curto: freqUltimos10[n],
    longo: freqHist[n],
    score: freqUltimos10[n] + freqHist[n] // equilíbrio simples
  }));

  return lista
    .sort((a, b) => b.score - a.score)
    .slice(0, quantidade)
    .map(i => i.numero);
}


/// ===== EXECUÇÃO COMPLETA DO MÉTODO =====

const ultimos10 = ultimosConcursos(10);
const freqUltimos10 = contarFrequencias(ultimos10);

// Etapa 1: extremos (curto prazo)
const quentes = identificarQuentes(freqUltimos10, 3);
const azaroes = identificarAzaroes(freqUltimos10, quentes, 2);

// Etapa 2: base equilibrada
const base20 = criarBase20(quentes, azaroes);

// Etapa 3: histórico
const freqHist = frequenciaHistorica();

// Etapa 4: cruzamento
const cruzados = cruzarBase(base20, freqUltimos10, freqHist, 10);

// Etapa 5: jogo final
const jogoFinal = [...quentes, ...azaroes, ...cruzados];

console.log('🔥 Quentes:', quentes);
console.log('📉 Azarões:', azaroes);
console.log('🧩 Base 20:', base20);
console.log('✖️ Cruzados (10):', cruzados);
console.log('🎯 Jogo Final (15):', jogoFinal);
