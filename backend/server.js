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

// ===============================
// ÚLTIMOS 10 CONCURSOS ANTERIORES
// ===============================
app.get('/lotofacil/ultimos/:concurso', (req, res) => {
  const numero = Number(req.params.concurso);

  const index = bd.findIndex(c => c.concurso === numero);

  if (index === -1) {
    return res.status(404).json({ erro: 'Concurso não encontrado' });
  }

  const ultimos = bd.slice(index, index + 10).map(c => ({
    concurso: c.concurso,
    numeros: c.numeros.map(n => String(n).padStart(2, '0'))
  }));

  res.json(ultimos);
});

app.get('/lotofacil/:concurso/anteriores', (req, res) => {
  const numero = Number(req.params.concurso);

  const index = bd.findIndex(c => c.concurso === numero);

  if (index === -1) {
    return res.status(404).json({ erro: 'Concurso não encontrado' });
  }

  const ultimos = bd.slice(index + 1, index + 11);

  res.json(ultimos);
});



