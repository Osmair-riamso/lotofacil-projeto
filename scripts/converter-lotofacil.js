import fs from 'fs';
import path from 'path';

// caminhos
const arquivoEntrada = path.resolve('data', 'lotofacil.csv');
const arquivoSaida = path.resolve('data', 'bd-loto.json');

// ler arquivo bruto
const conteudo = fs.readFileSync(arquivoEntrada, 'utf-8');

// quebrar linhas
const linhas = conteudo.split(/\r?\n/);

// remover cabeçalho
const dados = linhas.slice(1);

const resultados = [];

dados.forEach(linha => {
  if (!linha.trim()) return;

  const partes = linha.split(';');

  const concurso = Number(partes[0]);
  const data = partes[1];

  const numeros = partes
    .slice(2, 17)
    .map(n => String(n).padStart(2, '0'))
    .sort();

  resultados.push({
    concurso,
    data,
    numeros
  });
});

// ordenar do mais recente para o mais antigo
resultados.sort((a, b) => b.concurso - a.concurso);

// salvar JSON
fs.writeFileSync(arquivoSaida, JSON.stringify(resultados, null, 2), 'utf-8');

console.log(`✅ Conversão concluída: ${resultados.length} concursos`);
