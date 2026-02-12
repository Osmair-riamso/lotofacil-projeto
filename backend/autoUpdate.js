import cron from 'node-cron';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// caminho do banco JSON
const bdPath = path.resolve('../data/bd-loto.json');

/**
 * Função que busca último resultado oficial
 */
async function buscarUltimoResultado() {
  const res = await fetch(
    'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil'
  );

  const data = await res.json();

  return {
    concurso: data.numero,
    data: data.dataApuracao,
    numeros: data.listaDezenas.map(n =>
      String(n).padStart(2, '0')
    )
  };
}

/**
 * Atualiza o banco local se necessário
 */
async function atualizarBanco() {
  try {
    const novo = await buscarUltimoResultado();

    const bd = JSON.parse(fs.readFileSync(bdPath, 'utf-8'));

    const jaExiste = bd.some(c => c.concurso === novo.concurso);

    if (jaExiste) {
      console.log('🟡 Banco já está atualizado.');
      return;
    }

    bd.unshift(novo); // adiciona no início

    fs.writeFileSync(bdPath, JSON.stringify(bd, null, 2));

    console.log(`✅ Novo concurso ${novo.concurso} salvo automaticamente!`);
  } catch (err) {
    console.error('❌ Erro na atualização automática:', err.message);
  }
}

/**
 * AGENDAMENTO
 * Todo dia às 21:05
 */
cron.schedule('5 21 * * *', () => {
  console.log('⏰ Executando atualização automática...');
  atualizarBanco();
});

console.log('🤖 Auto-update da Lotofácil ativo...');

//TESTE IMEDIATO
atualizarBanco();

