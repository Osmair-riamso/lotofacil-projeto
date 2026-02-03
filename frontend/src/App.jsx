import { useState } from 'react';

/**
 * Função que chama o motor (backend local)
 * Ela já retorna:
 * - tresMais
 * - doisMenos
 * - jogos (com números e análises)
 */
import { gerarJogosComAnalise } from './services/motor';

/**
 * COMPONENTE: Último Sorteio
 * Equivale à linha 24 da planilha
 */
import UltimoSorteio from './components/UltimoSorteio';

/**
 * COMPONENTE: Resumo dos extremos
 * Mostra claramente os 3 mais e 2 menos
 */
import ResumoExtremos from './components/ResumoExtremos';

function App() {
  // Jogos gerados pelo motor
  const [jogos, setJogos] = useState([]);

  // Guarda 3 mais e 2 menos vindos do motor
  const [tresMais, setTresMais] = useState([]);
  const [doisMenos, setDoisMenos] = useState([]);

  // Último sorteio (manual ou futuro API)
  const [ultimoSorteio, setUltimoSorteio] = useState(null);

  /**
   * Dispara o motor e atualiza o front
   */
  function gerar() {
    const resultado = gerarJogosComAnalise(ultimoSorteio);

    setJogos(resultado.jogos);
    setTresMais(resultado.tresMais);
    setDoisMenos(resultado.doisMenos);
  }

  /**
   * Define a cor de cada número conforme o método
   * Verde = 3 mais
   * Vermelho = 2 menos
   * Azul = restante
   */
  function corNumero(n) {
    if (tresMais.includes(n)) return 'green';
    if (doisMenos.includes(n)) return 'red';
    return '#0077cc';
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>osmAIr 🎯</h1>
      <p>Análise estatística e desenho dos jogos</p>

      {/* ===== ETAPA 1 — ÚLTIMO SORTEIO ===== */}
      <UltimoSorteio onAtualizar={setUltimoSorteio} />

      {/* Mostra o sorteio informado (igual planilha) */}
      {ultimoSorteio && (
        <div style={{ marginTop: 10 }}>
          <strong>Concurso:</strong> {ultimoSorteio.concurso}
          <br />
          <strong>Números:</strong>{' '}
          {ultimoSorteio.numeros.join(' ')}
        </div>
      )}

      {/* Botão principal */}
      <button
        onClick={gerar}
        style={{ padding: 10, margin: '20px 0' }}
      >
        Gerar jogos
      </button>

      {/* ===== ETAPA 2 — RESUMO DO MÉTODO ===== */}
      <ResumoExtremos
        tresMais={tresMais}
        doisMenos={doisMenos}
      />

      {/* ===== ETAPA 3 — JOGOS DESENHADOS ===== */}
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
            <h3>Jogo {jogo.chave}</h3>

            {jogo.acertos !== null && (
              <p>
                <strong>Acertos no último sorteio:</strong> {jogo.acertos}
              </p>
            )}

            {/* NÚMEROS COLORIDOS (DESENHO DO JOGO) */}
            <div style={{ marginBottom: 10 }}>
              {jogo.numeros.map(n => (
                <span
                  key={n}
                  style={{
                    color: corNumero(n),
                    marginRight: 6,
                    fontWeight: 'bold'
                  }}
                >
                  {n}
                </span>
              ))}
            </div>

            {/* ANÁLISE DE SEQUÊNCIA */}
            <p>
              <strong>Maior sequência:</strong>{' '}
              {jogo.sequencia.maiorSequencia.join(' ')} (
              {jogo.sequencia.maiorTamanho})
            </p>

            {/* EQUILÍBRIO */}
            <p>
              <strong>Equilíbrio:</strong>{' '}
              {jogo.equilibrio}
            </p>

            {/* COMENTÁRIO DA IA */}
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
