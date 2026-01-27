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

// ===== EXECUÇÃO DO MÉTODO (PARTE 1) =====

const ultimos10 = ultimosConcursos(10);
const freqUltimos10 = contarFrequencias(ultimos10);

const quentes = identificarQuentes(freqUltimos10, 3);
const azaroes = identificarAzaroes(freqUltimos10, 2);

console.log('🔥 Quentes (últimos 10):', quentes);
console.log('📉 Azarões (últimos 10):', azaroes);


// Converter objeto de frequência em array ordenável
function frequenciasParaArray(freq) {
  return Object.entries(freq).map(([numero, qtd]) => ({
    numero,
    qtd
  }));
}

// Identificar quentes (maiores frequências)
function identificarQuentes(freqUltimos10, quantidade = 3) {
  return frequenciasParaArray(freqUltimos10)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, quantidade)
    .map(item => item.numero);
}

// Identificar azarões (menores frequências)
function identificarAzaroes(freqUltimos10, quantidade = 2) {
  return frequenciasParaArray(freqUltimos10)
    .sort((a, b) => a.qtd - b.qtd)
    .slice(0, quantidade)
    .map(item => item.numero);
}

