import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

/**
 * URL base da API pública das loterias
 * (estável e já testada)
 */
const API_BASE = 'https://loteriascaixa-api.herokuapp.com/api';

/* =====================================================
   1️⃣ ÚLTIMO SORTEIO DA LOTOFÁCIL
===================================================== */
app.get('/lotofacil/ultimo', async (req, res) => {
  try {
    const response = await fetch(`${API_BASE}/lotofacil/latest`);
    const data = await response.json();

    const numeros = data.dezenas.map(n =>
      String(n).padStart(2, '0')
    );

    res.json({
      concurso: data.concurso,
      data: data.data,
      numeros
    });
  } catch (err) {
    console.error('Erro ao buscar último sorteio:', err);
    res.status(500).json({ erro: 'Falha ao buscar último sorteio' });
  }
});

/* =====================================================
   2️⃣ BUSCAR CONCURSO ESPECÍFICO
===================================================== */
app.get('/lotofacil/:concurso', async (req, res) => {
  try {
    const { concurso } = req.params;

    const response = await fetch(`${API_BASE}/lotofacil/${concurso}`);

    if (!response.ok) {
      return res.status(404).json({ erro: 'Concurso não encontrado' });
    }

    const data = await response.json();

    const numeros = data.dezenas.map(n =>
      String(n).padStart(2, '0')
    );

    res.json({
      concurso: data.concurso,
      data: data.data,
      numeros
    });
  } catch (err) {
    console.error('Erro ao buscar concurso:', err);
    res.status(500).json({ erro: 'Falha ao buscar concurso' });
  }
});

/* =====================================================
   3️⃣ BUSCAR ÚLTIMOS N CONCURSOS
   Ex: /lotofacil/ultimos/10
===================================================== */
app.get('/lotofacil/ultimos/:qtd', async (req, res) => {
  try {
    const qtd = Number(req.params.qtd);

    const response = await fetch(`${API_BASE}/lotofacil`);
    const data = await response.json();

    const ultimos = data
      .slice(0, qtd)
      .map(c => ({
        concurso: c.concurso,
        data: c.data,
        numeros: c.dezenas.map(n =>
          String(n).padStart(2, '0')
        )
      }));

    res.json(ultimos);
  } catch (err) {
    console.error('Erro ao buscar últimos concursos:', err);
    res.status(500).json({ erro: 'Falha ao buscar últimos concursos' });
  }
});

/* =====================================================
   SERVIDOR ONLINE
===================================================== */
app.listen(PORT, () => {
  console.log(`🚀 Backend osmAIr rodando em http://localhost:${PORT}`);
});
