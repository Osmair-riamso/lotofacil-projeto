import fs from 'fs';
import path from 'path';

// caminhos
const arquivoEntrada = path.resolve('data', 'lotofacil.csv');
const arquivoSaida = path.resolve('data', 'bd-loto.json');

// lê CSV bruto
const conteudo = fs.readFileSync(arquivoEntrada, 'utf-8');

// quebra linhas
const linhas = conteudo.split(/\r?\n/);

// remove cabeçalho
const dados = linhas.slice(1);

const resultados = [];

dados.forEach(linha => {
  if (!linha.trim()) return;

  // detecta separador automaticamente
  const partes = linha.includes(';')
    ? linha.split(';')
    : linha.split(',');

  const concurso = Number(partes[0]);

  // ignora linhas inválidas
  if (!concurso || isNaN(concurso)) return;

  const data = partes[1];

  const numeros = partes
    .slice(2, 17)
    .map(n => String(n).padStart(2, '0'))
    .sort();

  // garante exatamente 15 números
  if (numeros.length !== 15) return;

  resultados.push({
    concurso,
    data,
    numeros
  });
});

// ordena do mais recente → mais antigo
resultados.sort((a, b) => b.concurso - a.concurso);

// salva JSON COMPLETO
fs.writeFileSync(
  arquivoSaida,
  JSON.stringify(resultados, null, 2),
  'utf-8'
);

console.log(`✅ Conversão concluída: ${resultados.length} concursos salvos`);
