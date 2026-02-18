import fs from 'fs';
import fetch from 'node-fetch';

const URL =
  'https://servicebus2.caixa.gov.br/portaldeloterias/api/resultados/download?modalidade=Lotofacil';

const caminho = 'data/lotofacil.csv';

async function baixar() {
  console.log('⬇️ Baixando CSV oficial...');

  const res = await fetch(URL);

  if (!res.ok) {
    throw new Error('Falha ao baixar CSV da Caixa');
  }

  const buffer = await res.buffer();

  fs.writeFileSync(caminho, buffer);

  console.log('✅ CSV atualizado com sucesso');
}

baixar();
