import { useState } from 'react';

/**
 * Motor
 */
import { gerarJogosComAnalise } from './services/motor';

/**
 * Componentes
 */
import UltimoSorteio from './components/UltimoSorteio';
import ResumoExtremos from './components/ResumoExtremos';

function App() {
  const [jogos, setJogos] = useState([]);
  const [tresMais, setTresMais] = useState([]);
  const [doisMenos, setDoisMenos] = useState([]);
  const [ultimoSorteio, setUltimoSorteio] = useState(null);

  function gerar() {
    const resultado = gerarJogosComAnalise(ultimoSorteio || null);

    setJogos(resultado.jogos);
    setTresMais(resultado.tresMais);
    setDoisMenos(resultado.doisMenos);
  }

  /**
   * Define estilo visual dos números
   */
  function estiloNumero(n) {
    const acertou = ultimoSorteio?.numeros?.includes(n);

    if (acertou) {
      return {
        background: '#ffd700',
        color: '#000',
        fontWeight: 'bold',
        borderRadius: 4,
        padding: '2px 4px'
      };
    }

    if (tresMais.includes(n))
      return { color: 'green', fontWeight: 'bold' };

    if (doisMenos.includes(n))
      return { color: 'red', fontWeight: 'bold' };

    return { color: '#0077cc' };
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>osmAIr 🎯</h1>
      <p>Análise estatística e desenho dos jogos</p>

      {/* ===== ETAPA 1 — ÚLTIMO SORTEIO ===== */}
      <UltimoSorteio onAtualizar={setUltimoSorteio} />

      {ultimoSorteio && (
        <div style={{ marginTop: 10 }}>
          <strong>Concurso:</strong> {ultimoSorteio.concurso}
          <br />
          <strong>Números:</strong> {ultimoSorteio.numeros.join(' ')}
        </div>
      )}

      {/* BOTÃO */}
      <button
        onClick={gerar}
        style={{ padding: 10, margin: '20px 0' }}
      >
        Gerar jogos
      </button>

      {/* ===== ETAPA 2 — EXTREMOS ===== */}
      <ResumoExtremos
        tresMais={tresMais}
        doisMenos={doisMenos}
      />

      {/* ===== ETAPA 3 — JOGOS ===== */}
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

            {jogo.acertos !== null && (
              <p style={{ fontWeight: 'bold' }}>
                🎯 Acertos no último sorteio: {jogo.acertos}
              </p>
            )}

            {/* NÚMEROS */}
            <div style={{ marginBottom: 10 }}>
              {jogo.numeros.map(n => (
                <span
                  key={n}
                  style={{
                    ...estiloNumero(n),
                    marginRight: 6
                  }}
                >
                  {n}
                </span>
              ))}
            </div>

            {/* SEQUÊNCIA */}
            <p>
              <strong>Maior sequência:</strong>{' '}
              {jogo.sequencia.maiorSequencia.join(' ')} (
              {jogo.sequencia.maiorTamanho})
            </p>

            {/* EQUILÍBRIO */}
            <p>
              <strong>Equilíbrio:</strong> {jogo.equilibrio}
            </p>

            {/* IA */}
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
