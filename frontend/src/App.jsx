import { useEffect, useMemo, useState } from 'react';
import { processar } from './services/motor.js';
import { buscarBaseMotor } from './services/api.js';
import { NUMEROS } from './core/estatistica.js';

const EXEMPLO = Array.from({ length: 50 }, (_, i) => ({
  concurso: 3000 - i,
  data: '2026-01-01',
  numeros: Array.from({ length: 15 }, () => String(Math.floor(Math.random() * 25) + 1).padStart(2, '0'))
}));

function Balls({ nums, variant = '', max }) {
  const lista = useMemo(() => {
    const unicos = [...new Set((nums || []).map(n => String(n).padStart(2, '0')))].sort((a, b) => Number(a) - Number(b));
    return max ? unicos.slice(0, max) : unicos;
  }, [nums, max]);

  return (
    <div className="balls">
      {lista.map(n => (
        <span key={n} className={`ball ${variant}`}>{n}</span>
      ))}
    </div>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      {children}
    </div>
  );
}

function GameRow({ chave, jogo, score, analise, comentarios, fixos5, isBest = false }) {
  const [open, setOpen] = useState(false);

  const fixosNoJogo = jogo.filter(n => fixos5.includes(n)).length;
  const azaroesNoJogo = jogo.filter(n => ['14', '06'].includes(n)).length;

  return (
    <div className={`game-row ${isBest ? 'best' : ''}`}>
      <div className="game-header">
        <div className="game-chave">{chave}</div>
        <Balls nums={jogo} />
        <div className="game-score">
          <span className="score-badge">{score.toFixed(1)}</span>
        </div>
      </div>

      <div className="game-metrics">
        <span>Sequência: <strong>{analise.seq.maiorTamanho}</strong></span>
        <span>Ímpar/Par: <strong>{analise.impares}/{analise.pares}</strong></span>
        <span>Fixos: <strong>{fixosNoJogo}</strong></span>
        <span>Azarões: <strong>{azaroesNoJogo}</strong></span>
        <span className={`equilibrio ${analise.eq.status}`}>{analise.eq.label}</span>
      </div>

      <button className="btn-link" onClick={() => setOpen(!open)}>
        {open ? '▾ Ocultar análise osmAIr' : '▸ Ver análise osmAIr'}
      </button>

      {open && (
        <ul className="comment-list">
          {(comentarios.leitura || []).map((c, i) => (
            <li key={`${chave}-c-${i}`}>{c}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [bd, setBd] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [meuJogo, setMeuJogo] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('finais');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    carregarExemplo();
  }, []);

  function normalizar(nums) {
    return [...new Set(nums.map(n => String(n).padStart(2, '0')))].sort((a, b) => Number(a) - Number(b));
  }

  function carregarExemplo() {
    setBd(EXEMPLO);
  }

  async function carregarAPI() {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await buscarBaseMotor(300);
      setBd(dados);
    } catch (e) {
      setErro('Não foi possível carregar da API. Use os dados de exemplo ou upload.');
    } finally {
      setCarregando(false);
    }
  }

  function carregarArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        setBd(json);
      } catch {
        setErro('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  }

  function analisarMeuJogo() {
    if (!bd || meuJogo.length !== 15) return;
    setResultado(processar(bd, meuJogo));
  }

  function toggleNumero(n) {
    setMeuJogo(prev => {
      const s = String(n).padStart(2, '0');
      if (prev.includes(s)) return prev.filter(x => x !== s);
      if (prev.length >= 15) return prev;
      return normalizar([...prev, s]);
    });
  }

  const r = useMemo(() => {
    if (!bd) return null;
    return processar(bd, meuJogo.length === 15 ? meuJogo : null);
  }, [bd]);

  if (!r) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">🎯 Lotofácil - Motor ABCDE</h1>
          <p className="subtitle">Carregue os dados para iniciar.</p>
          <div className="actions">
            <button className="btn" onClick={carregarExemplo}>Dados de exemplo</button>
            <button className="btn" onClick={carregarAPI} disabled={carregando}>
              {carregando ? 'Carregando...' : 'Carregar da API'}
            </button>
            <label className="btn">
              Upload JSON
              <input type="file" accept=".json" hidden onChange={carregarArquivo} />
            </label>
          </div>
          {erro && <div className="alert" style={{ marginTop: 16 }}>{erro}</div>}
        </div>
      </div>
    );
  }

  const fixos5 = normalizar([...r.tresMais, ...r.doisMenos]);
  const rankingFinais = Object.entries(r.jogosFinais)
    .map(([chave, jogo]) => ({
      chave,
      jogo,
      score: r.scores[chave] || 0,
      analise: r.analises[chave],
      comentarios: r.comentarios[chave] || []
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="container">
      <div className="card header">
        <h1 className="title">🎯 Lotofácil - Motor ABCDE</h1>
        <div className="actions">
          <button className="btn" onClick={carregarExemplo}>Exemplo</button>
          <button className="btn" onClick={carregarAPI} disabled={carregando}>
            {carregando ? '...' : 'API'}
          </button>
          <label className="btn">
            Upload
            <input type="file" accept=".json" hidden onChange={carregarArquivo} />
          </label>
        </div>
      </div>

      {erro && <div className="alert">{erro}</div>}

      <div className="top-grid">
        <Card title="📊 Estatísticas">
          <div className="stats-row">
            <div>
              <div className="label">Top 10 - Últimos 10 concursos</div>
              <Balls nums={r.top10Curto} variant="ball-hot" />
            </div>
            <div>
              <div className="label">Top 10 - Todos os tempos</div>
              <Balls nums={r.top10Longo} variant="ball-gold" />
            </div>
          </div>
        </Card>

        <Card title="⚖️ Quentes x Azarões">
          <div className="label">3 Fixos Principais</div>
          <Balls nums={r.tresMais} variant="ball-hot" />
          <div className="label" style={{ marginTop: 12 }}>2 Azarões</div>
          <Balls nums={r.doisMenos} variant="ball-cold" />
        </Card>
      </div>

      <div className="main-grid">
        <Card title="🧩 Base 20 - Grupos ABCDE">
          <div className="base-grid">
            {r.grupos.map((grupo, i) => (
              <div key={`grupo-${i}`} className="base-col">
                <div className="base-title">Grupo {String.fromCharCode(65 + i)}</div>
                <div className="base-square">
                  {grupo.map(n => (
                    <span key={`g${i}-${n}`} className="ball">{n}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="🍀 Meu Jogo da Sorte">
          <div className="number-picker">
            {NUMEROS.map(n => {
              const selecionado = meuJogo.includes(n);
              return (
                <button
                  key={n}
                  className={`picker-ball ${selecionado ? 'selected' : ''}`}
                  onClick={() => toggleNumero(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="label">Selecionados ({meuJogo.length}/15)</div>
          <Balls nums={meuJogo} variant="ball-user" />
          <div className="actions" style={{ marginTop: 12 }}>
            <button
              className="btn"
              onClick={analisarMeuJogo}
              disabled={meuJogo.length !== 15}
            >
              Analisar meu jogo
            </button>
            <button className="btn btn-secondary" onClick={() => setMeuJogo([])}>
              Limpar
            </button>
          </div>

          {resultado?.analiseUsuario && (
            <div className="user-game-section">
              <div className="label">Score do seu jogo</div>
              <div className="success">
                <strong>{resultado.analiseUsuario.score.toFixed(1)}</strong> pontos
                {resultado.analiseUsuario.ajuste && (
                  <div style={{ marginTop: 8, fontSize: 12 }}>
                    Ajustado: removeu {resultado.analiseUsuario.ajuste.removido}, adicionou {resultado.analiseUsuario.ajuste.adicionado}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card title="🏆 Melhor Jogo do Motor" className="best-game">
        <div className="best-game-row">
          <div>
            <div className="label">Chave vencedora</div>
            <div className="best-chave">{r.melhorChave}</div>
          </div>
          <Balls nums={r.jogoFinal} variant="ball-gold" />
        </div>
        {rankingFinais[0] && (
          <GameRow
            chave={rankingFinais[0].chave}
            jogo={rankingFinais[0].jogo}
            score={rankingFinais[0].score}
            analise={rankingFinais[0].analise}
            comentarios={rankingFinais[0].comentarios}
            fixos5={fixos5}
            isBest
          />
        )}
      </Card>

      <Card>
        <div className="tabs">
          <button className={`tab ${abaAtiva === 'finais' ? 'active' : ''}`} onClick={() => setAbaAtiva('finais')}>
            Jogos Finais
          </button>
          <button className={`tab ${abaAtiva === 'fatorados' ? 'active' : ''}`} onClick={() => setAbaAtiva('fatorados')}>
            Fatorados
          </button>
          <button className={`tab ${abaAtiva === 'ranking' ? 'active' : ''}`} onClick={() => setAbaAtiva('ranking')}>
            Ranking
          </button>
        </div>

        <div className="tab-content">
          {abaAtiva === 'finais' && (
            <div className="games-list">
              {rankingFinais.map(item => (
                <GameRow
                  key={`final-${item.chave}`}
                  chave={item.chave}
                  jogo={item.jogo}
                  score={item.score}
                  analise={item.analise}
                  comentarios={item.comentarios}
                  fixos5={fixos5}
                />
              ))}
            </div>
          )}

          {abaAtiva === 'fatorados' && (
            <table>
              <thead>
                <tr>
                  <th>Chave</th>
                  <th>12 números</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(r.jogosFatorados).map(([chave, nums]) => (
                  <tr key={`fat-${chave}`}>
                    <td>{chave}</td>
                    <td><Balls nums={nums} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {abaAtiva === 'ranking' && (
            <table>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Chave</th>
                  <th>Jogo</th>
                  <th>Score</th>
                  <th>Sequência</th>
                  <th>Equilíbrio</th>
                </tr>
              </thead>
              <tbody>
                {rankingFinais.map((item, i) => (
                  <tr key={`rank-${item.chave}`} className={i === 0 ? 'highlight' : ''}>
                    <td>{i + 1}</td>
                    <td>{item.chave}</td>
                    <td><Balls nums={item.jogo} /></td>
                    <td>{item.score.toFixed(1)}</td>
                    <td>{item.analise.seq.maiorTamanho}</td>
                    <td>{item.analise.eq.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card title="🧪 Simulação Histórica">
        <p className="subtitle">
          Simulação do melhor jogo gerado pelo motor contra os últimos 200 concursos.
        </p>
        <table>
          <thead>
            <tr>
              <th>Acertos</th>
              <th>Quantidade</th>
              <th>Frequência</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(r.resultadoSimulacao.detalhes || {}).map(([acertos, qtd]) => (
              <tr key={`sim-${acertos}`}>
                <td>{acertos}</td>
                <td>{qtd}</td>
                <td>{((qtd / (r.resultadoSimulacao.total || 1)) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="info" style={{ marginTop: 12 }}>
          Máximo de acertos do melhor jogo: <strong>{r.resultadoSimulacao.maximo || 0}</strong>
        </div>
      </Card>
    </div>
  );
}
