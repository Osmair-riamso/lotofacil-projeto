# 🎯 Lotofácil - Motor ABCDE

Frontend em React + Vite para geração e análise de jogos da Lotofácil.

## Como rodar

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Fontes de dados

O sistema pode carregar dados de três formas:

1. **API local** (`http://localhost:3001`) — busca os últimos concursos automaticamente
2. **Upload de arquivo** — selecione um `bd-loto.json`
3. **Dados de exemplo** — para testes rápidos sem depender de API ou arquivo

## Estrutura de pastas

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── services/
    │   ├── motor.js
    │   └── api.js
    ├── core/
    │   ├── estatistica.js
    │   ├── historico.js
    │   └── selecao.js
    ├── desenho/
    │   ├── sequencia.js
    │   ├── validacao.js
    │   └── ajuste.js
    ├── fatoracao/
    │   ├── combinador.js
    │   └── aleatorio.js
    ├── analise/
    │   └── relatorio.js
    └── simulacao/
        └── simulador.js
```

## Observações importantes

- A API deve estar rodando em `http://localhost:3001`.
- O backend precisa permitir CORS para `http://localhost:5173`, ou o navegador bloqueará as requisições.
- A API é usada para buscar os últimos 300 concursos, suficiente para estatísticas e simulação histórica.
