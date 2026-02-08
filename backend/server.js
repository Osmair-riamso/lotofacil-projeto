import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3001;

app.use(cors());

/**
 * ===============================
 * CARREGAR BANCO LOCAL bd-loto.json
 * ===============================
 */

// necessário para usar path com ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// caminho do JSON (um nível acima do backend)
const bdPath = path.resolve(__dirname, '../data/bd-loto.json');

// lê o arquivo
const bd = JSON.parse(fs.readFileSync(bdPath, 'utf-8'));

/**
 * ===============================
 * ROTA: ÚLTIMO RESULTADO DA LOTOFÁCIL (API CAIXA)
 * ===============================
 */
app.get('/lotofacil/ultimo', async (req, res) => {
  try {
    const response = await fetch(
      'https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil'
    );

    const data = await response.json();

    const numeros = data.listaDezenas.map(n =>
      String(n).padStart(2, '0')
    );

    res.json({
      concurso: data.numero,
      numeros
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Falha ao buscar Lotofácil' });
  }
});

/**
 * ===============================
 * ROTA: BUSCAR CONCURSO ESPECÍFICO NO JSON LOCAL
 * ===============================
 */
app.get('/lotofacil/:concurso', (req, res) => {
  const numero = Number(req.params.concurso);

  const achado = bd.find(c => c.concurso === numero);

  if (!achado) {
    return res.status(404).json({ erro: 'Concurso não encontrado' });
  }

  res.json({
    concurso: achado.concurso,
    numeros: achado.numeros.map(n => String(n).padStart(2, '0'))
  });
});

/**
 * ===============================
 * START DO SERVIDOR
 * ===============================
 */
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
