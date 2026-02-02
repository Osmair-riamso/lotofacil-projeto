// frontend/src/App.jsx

import { useState } from 'react';
import { gerarJogosComAnalise } from './services/motor';

function App() {
  const [jogos, setJogos] = useState([]);

  function gerar() {
    const resultado = gerarJogosComAnalise();
    setJogos(resultado);
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>osmAIr 🎯</h1>
      <p>Análise estatística e desenho dos jogos</p>

      <button onClick={gerar} style={{ padding: 10, marginBottom: 20 }}>
        Gerar jogos
      </button>

      {/* GRID DOS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16
        }}
      >
        {jogos.map(jogo => (
          <div
            key={jogo.chave}
            style={{
              border: '1px solid #ccc',
              padding: 15,
              borderRadius: 8
            }}
          >
            <h3>Jogo {jogo.chave}</h3>

            <strong>Números:</strong>
            <div>{jogo.numeros.join(' ')}</div>

            <p>
              <strong>Maior sequência:</strong>{' '}
              {jogo.sequencia.maiorSequencia.join(' ')} (
              {jogo.sequencia.maiorTamanho})
            </p>

            <p>
              <strong>Equilíbrio:</strong> {jogo.equilibrio}
            </p>

            <strong>Comentário osmAIr:</strong>
            <ul>
              {jogo.comentario.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
