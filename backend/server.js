import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// permite o React acessar o backend
import cors from 'cors';
app.use(cors());

/**
 * ROTA: último resultado da Lotofácil
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

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
