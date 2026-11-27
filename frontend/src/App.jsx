import { useEffect, useMemo, useState } from 'react';
import { processar } from './services/motor.js';
import { buscarBaseMotor, buscarUltimoSorteio, buscarConcurso } from './services/api.js';
import { NUMEROS } from './core/estatistica.js';

const EXEMPLO = Array.from({ length: 50 }, (_, i) => ({
  concurso: 3000 - i,
  data: '2026-01-01',
  numeros: Array.from({ length: 15 }, () => String(Math.floor(Math.random() * 25) + 1).padStart(2, '0'))
}));

function Balls({ nums, variant = '', max, small = false, xs = false }) {
  const lista = useMemo(() => {
    const arr = Array.isArray(nums) ? nums : [];
    const unicos = [...new Set(arr.map(n => String(n).padStart(2, '0')).filter(Boolean))]
      .sort((a, b) => Number(a) - Number(b));
    return max ? unicos.slice(0, max) : unicos;
  }, [nums, max]);

  if (lista.length === 0) return <span className="empty-balls">—</span>;

  return (
    <div className="balls">
      {lista.map(n => (
        <span key={n} className={`ball ${variant} ${small ? 'ball-sm' : ''} ${xs ? 'ball-xs' : ''}`}>{n}</span>
      ))}
    </div>
  );
}

function Card({ title, children, className = '', icon = '', noHeader = false }) {
  return (
    <div className={`card ${className}`}>
      {!noHeader && title && (
        <div className="card-header">
          <span className="card-icon">{icon}</span>
          <h2 className="section-title">{title}</h2>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

function Badge({ children, type = 'default' }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function GameRow({ chave, jogo, score, analise, comentarios, fixos5, isBest = false }) {
  const [open, setOpen] = useState(false);

  const numeros = Array.isArray(jogo) ? jogo : [];
  const fixosNoJogo = numeros.filter(n => (fixos5 || []).includes(n)).length;
  const azaroesNoJogo = numeros.filter(n => ['14', '06'].includes(n)).length;

  return (
    <div className={`game-row ${isBest ? 'best' : ''}`}>
      <div className="game-header">
        <div className="game-info">
          <div className="game-chave">{chave}</div>
          {isBest && <Badge type="gold">MELHOR</Badge>}
        </div>
        <Balls nums={numeros} variant={isBest ? 'ball-gold' : ''} />
        <div className="game-score">
          <span className="score-badge">{(score ?? 0).toFixed(1)}</span>
        </div>
      </div>

      <div className="game-metrics">
        <div className="metric">
          <span className="metric-label">Sequência</span>
          <span className="metric-value">{(analise?.seq?.maiorTamanho ?? 0)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Ímpar/Par</span>
          <span className="metric-value">{(analise?.impares ?? 0)}/{(analise?.pares ?? 0)}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Fixos</span>
          <span className="metric-value">{fixosNoJogo}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Azarões</span>
          <span className="metric-value">{azaroesNoJogo}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Equilíbrio</span>
          <span className={`metric-value equilibrio ${analise?.eq?.status || ''}`}>{analise?.eq?.label || '—'}</span>
        </div>
      </div>

      <button className="btn-link" onClick={() => setOpen(!open)}>
        {open ? '▾ Ocultar análise' : '▸ Ver análise do motor'}
      </button>

      {open && (
        <ul className="comment-list">
          {((comentarios?.leitura) || []).map((c, i) => (
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
  const [mensagem, setMensagem] = useState('');
  const [meuJogo, setMeuJogo] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('finais');
  const [ultimoSorteio, setUltimoSorteio] = useState(null);
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [modalFavoritos, setModalFavoritos] = useState(false);
  const [modalSobre, setModalSobre] = useState(false);
  const [modalSalvar, setModalSalvar] = useState(false);
  const [nomeFavorito, setNomeFavorito] = useState('');
  const [favoritos, setFavoritos] = useState([]);
  const [qtdConcursos, setQtdConcursos] = useState('');
  const [numeroConcurso, setNumeroConcurso] = useState('');
  const [concursoBuscado, setConcursoBuscado] = useState(null);
  const [erroConcurso, setErroConcurso] = useState(null);

  useEffect(() => {
    carregarExemplo();
    carregarUltimoSorteio();
    const timer = setInterval(() => setHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const salvos = localStorage.getItem('lotofacil-favoritos');
    if (salvos) {
      try {
        setFavoritos(JSON.parse(salvos));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lotofacil-favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  function normalizar(nums) {
    const arr = Array.isArray(nums) ? nums : [];
    return [...new Set(arr.map(n => String(n).padStart(2, '0')).filter(Boolean))].sort((a, b) => Number(a) - Number(b));
  }

  function carregarExemplo() {
    setBd(EXEMPLO);
    setErro(null);
  }

  async function carregarAPI() {
    setCarregando(true);
    setErro(null);
    setMensagem('Buscando resultados oficiais da Lotofácil...');
    try {
      const dados = await buscarBaseMotor(300);
      setBd(dados);
      await carregarUltimoSorteio();
      setMensagem('Dados oficiais atualizados com sucesso!');
    } catch (e) {
      setErro('Não foi possível carregar da API. Use os dados de exemplo ou upload.');
      setMensagem('');
    } finally {
      setCarregando(false);
      setTimeout(() => setMensagem(''), 4000);
    }
  }

  async function carregarUltimoSorteio() {
    try {
      const sorteio = await buscarUltimoSorteio();
      setUltimoSorteio(sorteio);
    } catch {
      setUltimoSorteio(null);
    }
  }

  async function buscarConcursoNaBase() {
    if (!numeroConcurso.trim()) return;

    const numeroBuscado = numeroConcurso.trim();
    setErroConcurso('Buscando no site da Caixa...');

    try {
      const sorteio = await buscarConcurso(numeroBuscado);
      setConcursoBuscado(sorteio);
      setErroConcurso(null);
    } catch {
      setConcursoBuscado(null);
      setErroConcurso(`Concurso ${numeroBuscado} não encontrado na fonte oficial.`);
    }
  }

  function usarConcursoComoBase() {
    if (concursoBuscado && Array.isArray(concursoBuscado.numeros) && concursoBuscado.numeros.length === 15) {
      setMeuJogo(normalizar(concursoBuscado.numeros));
      setMensagem(`Jogo do concurso ${concursoBuscado.concurso} carregado para análise.`);
      setTimeout(() => setMensagem(''), 3000);
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
        setErro(null);
      } catch {
        setErro('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  }

  function abrirSalvarFavorito() {
    if (!bd || meuJogo.length !== 15) return;
    setModalSalvar(true);
  }

  function salvarFavorito() {
    if (!nomeFavorito.trim() || meuJogo.length !== 15) return;
    setFavoritos(prev => [...prev, { nome: nomeFavorito.trim(), numeros: [...meuJogo] }]);
    setNomeFavorito('');
    setModalSalvar(false);
  }

  function cancelarSalvarFavorito() {
    setNomeFavorito('');
    setModalSalvar(false);
  }

  function carregarFavorito(nums) {
    setMeuJogo(normalizar(nums));
    setModalFavoritos(false);
  }

  function removerFavorito(index) {
    setFavoritos(prev => prev.filter((_, i) => i !== index));
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
    const qtd = parseInt(qtdConcursos, 10);
    return processar(bd, meuJogo.length === 15 ? meuJogo : null, qtd > 0 ? qtd : null);
  }, [bd, meuJogo, qtdConcursos]);

  if (!r) {
    return (
      <div className="container">
        <div className="hero">
          <div className="hero-content">
            <h1 className="title">🎯 Lotofácil Motor ABCDE</h1>
            <p className="subtitle">Análise estatística inteligente para seus jogos</p>
            <div className="actions">
              <button className="btn" onClick={() => setModalFavoritos(true)}>⭐ Favoritos</button>
              <button className="btn" onClick={carregarAPI} disabled={carregando}>
                {carregando ? 'Atualizando...' : '🔄 Atualizar'}
              </button>
              <label className="btn">
                Upload JSON
                <input type="file" accept=".json" hidden onChange={carregarArquivo} />
              </label>
              <button className="btn" onClick={() => setModalSobre(true)}>ℹ️ Sobre</button>
            </div>
            {erro && <div className="alert alert-error" style={{ marginTop: 24 }}>{erro}</div>}
          </div>
        </div>
      </div>
    );
  }

  const fixos5 = normalizar([...(r.tresMais || []), ...(r.doisMenos || [])]);
  const rankingFinais = Object.entries(r.jogosFinais || {})
    .map(([chave, jogo]) => ({
      chave,
      jogo,
      score: r.scores?.[chave] || 0,
      analise: r.analises?.[chave],
      comentarios: r.comentarios?.[chave] || []
    }))
    .sort((a, b) => b.score - a.score);

  const dataFormatada = horaAtual.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const horaFormatada = horaAtual.toLocaleTimeString('pt-BR');

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <h1 className="title">🎯 Lotofácil Motor ABCDE</h1>
            <p className="subtitle">Análise estatística inteligente para seus jogos</p>
          </div>

          <div className="header-center">
            <div className="clock-box">
              <div className="clock-time">{horaFormatada}</div>
              <div className="clock-date">{dataFormatada}</div>
            </div>
            {ultimoSorteio && (
              <div className="last-draw">
                <span className="last-draw-label">Último sorteio</span>
                <span className="last-draw-concurso">Concurso {ultimoSorteio.concurso}</span>
                <Balls nums={ultimoSorteio.numeros} variant="ball-gold" small />
              </div>
            )}
          </div>

          <div className="actions header-actions">
            <button className="btn btn-sm" onClick={() => setModalFavoritos(true)}>⭐ Favoritos</button>
            <button className="btn btn-sm" onClick={carregarAPI} disabled={carregando}>
              {carregando ? '...' : '🔄 Atualizar'}
            </button>
            <label className="btn btn-sm">
              Upload
              <input type="file" accept=".json" hidden onChange={carregarArquivo} />
            </label>
            <button className="btn btn-sm" onClick={() => setModalSobre(true)}>ℹ️ Sobre</button>
          </div>
        </div>
      </header>

      {mensagem && <div className="alert alert-info">{mensagem}</div>}
      {erro && <div className="alert alert-error">{erro}</div>}

      <div className="main-grid">
        <Card title="Meu Jogo da Sorte" icon="🍀" className="meu-jogo-card">
          <div className="number-picker">
            {NUMEROS.map(n => {
              const selecionado = meuJogo.includes(n);
              return (
                <button
                  key={n}
                  className={`picker-ball picker-ball-xs ${selecionado ? 'selected' : ''}`}
                  onClick={() => toggleNumero(n)}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="selected-info">
            <div className="label">Selecionados ({meuJogo.length}/15)</div>
            <Balls nums={meuJogo} variant="ball-user" xs />
          </div>
          <div className="actions picker-actions">
            <button
              className="btn btn-primary"
              onClick={abrirSalvarFavorito}
              disabled={meuJogo.length !== 15}
            >
              Salvar / Analisar
            </button>
            <button className="btn btn-secondary" onClick={() => setMeuJogo([])}>
              Limpar
            </button>
          </div>

          {meuJogo.length === 15 && r.analiseUsuario && (
            <div className="user-game-section">
              <div className="label">Score do seu jogo</div>
              <div className="success">
                <strong>{r.analiseUsuario.score?.toFixed(1) ?? '0.0'}</strong> pontos
                {r.analiseUsuario.ajuste && (
                  <div className="ajuste-info">
                    Ajuste sugerido: removeu {r.analiseUsuario.ajuste.removido}, adicionou {r.analiseUsuario.ajuste.adicionado}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        <Card title="Simulação Histórica" icon="🧪" className="simulacao-card">
          <p className="subtitle">
            Simulação do jogo selecionado contra os últimos concursos disponíveis na base.
          </p>
          <div className="table-wrapper">
            <table className="data-table sim-table">
              <thead>
                <tr>
                  <th>Acertos</th>
                  <th>Quantidade</th>
                  <th>Frequência</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(r.resultadoSimulacao?.detalhes || {}).map(([acertos, qtd]) => {
                  const total = r.resultadoSimulacao?.total || 1;
                  const pct = (qtd / total) * 100;
                  return (
                    <tr key={`sim-${acertos}`}>
                      <td>{acertos}</td>
                      <td>{qtd}</td>
                      <td>
                        <div className="freq-bar">
                          <span className="freq-value">{pct.toFixed(1)}%</span>
                          <div className="freq-track">
                            <div className="freq-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="info-box">
            Máximo de acertos: <strong>{r.resultadoSimulacao?.maximo || 0}</strong>
            {meuJogo.length === 15 && (
              <span> (simulando <strong>seu jogo</strong>)</span>
            )}
            {meuJogo.length !== 15 && (
              <span> (simulando o <strong>melhor jogo do motor</strong>)</span>
            )}
          </div>
        </Card>
      </div>

      <Card title="Estatísticas" icon="📊" className="estatisticas-larga">
        <div className="stats-grid">
          <div className="stat-block">
            <div className="label label-hot">Top 10 - Últimos 10 concursos</div>
            <Balls nums={r.top10Curto} variant="ball-hot" />
          </div>
          <div className="stat-block">
            <div className="label label-gold">Top 10 - Todos os tempos</div>
            <Balls nums={r.top10Longo} variant="ball-gold" />
          </div>
          <div className="stat-block">
            <div className="label label-hot">3 Fixos Principais</div>
            <Balls nums={r.tresMais} variant="ball-hot" />
          </div>
          <div className="stat-block">
            <div className="label label-cold">2 Azarões</div>
            <Balls nums={r.doisMenos} variant="ball-cold" />
          </div>
        </div>
      </Card>

      <Card title="Base 20 - Grupos ABCDE" icon="🧩" className="base20-card">
        <div className="base-grid">
          {(r.grupos || []).map((grupo, i) => (
            <div key={`grupo-${i}`} className="base-col">
              <div className="base-title">Grupo {String.fromCharCode(65 + i)}</div>
              <div className="base-square">
                {(grupo || []).map(n => (
                  <span key={`g${i}-${n}`} className="ball ball-base">{n}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Resumo do Motor" icon="🤖">
        <div className="resumo-motor">
          <div className="stat-block">
            <div className="label">Quantidade de concursos analisados</div>
            <div className="input-group">
              <input
                type="number"
                min="1"
                className="input input-qtd"
                placeholder="Todos"
                value={qtdConcursos}
                onChange={e => setQtdConcursos(e.target.value)}
              />
              <span className="input-hint">Deixe vazio para usar todos ({bd.length})</span>
            </div>
          </div>

          <div className="stat-block">
            <div className="label">Buscar concurso oficial</div>
            <div className="input-group">
              <input
                type="number"
                min="1"
                className="input input-qtd"
                placeholder="Ex: 3430"
                value={numeroConcurso}
                onChange={e => setNumeroConcurso(e.target.value)}
              />
              <button className="btn btn-sm" onClick={buscarConcursoNaBase}>Buscar</button>
            </div>
            {erroConcurso && (
              <div className={`alert ${erroConcurso.includes('Buscando') ? 'alert-info' : 'alert-error'}`} style={{ marginTop: 10, marginBottom: 0 }}>
                {erroConcurso}
              </div>
            )}
            {concursoBuscado && (
              <div className="concurso-buscado" style={{ marginTop: 14 }}>
                <div className="label">Concurso {concursoBuscado.concurso} <span className="input-hint">({concursoBuscado.data || 'data não informada'})</span></div>
                <div className="concurso-buscado-row">
                  <Balls nums={concursoBuscado.numeros} variant="ball-gold" />
                  <button className="btn btn-sm btn-primary" onClick={usarConcursoComoBase}>Usar como base</button>
                </div>
              </div>
            )}
          </div>

          <div className="stats-row-resumo">
            <div className="stat-block">
              <div className="label">Melhor chave</div>
              <div className="best-chave-inline">{r.melhorChave || '—'}</div>
            </div>
            <div className="stat-block">
              <div className="label">Concursos em uso</div>
              <div className="big-number">{r.resultadoSimulacao?.total ?? bd.length}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Melhor Jogo do Motor" className="best-game" icon="🏆">
        <div className="best-game-row">
          <div className="best-chave-box">
            <div className="label">Chave vencedora</div>
            <div className="best-chave">{r.melhorChave || '—'}</div>
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

      <Card icon="🎲" noHeader>
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
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Chave</th>
                    <th>12 números</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(r.jogosFatorados || {}).map(([chave, nums]) => (
                    <tr key={`fat-${chave}`}>
                      <td><span className="chave-tag">{chave}</span></td>
                      <td><Balls nums={nums} variant="ball-base" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {abaAtiva === 'ranking' && (
            <div className="table-wrapper">
              <table className="data-table ranking-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Chave</th>
                    <th>Jogo</th>
                    <th>Score</th>
                    <th>Seq</th>
                    <th>Equilíbrio</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingFinais.map((item, i) => (
                    <tr key={`rank-${item.chave}`} className={i === 0 ? 'highlight' : ''}>
                      <td>{i + 1}</td>
                      <td><span className="chave-tag">{item.chave}</span></td>
                      <td><Balls nums={item.jogo} variant={i === 0 ? 'ball-gold' : ''} /></td>
                      <td><span className="score-cell">{item.score.toFixed(1)}</span></td>
                      <td>{item.analise?.seq?.maiorTamanho ?? 0}</td>
                      <td><span className={`eq-tag ${item.analise?.eq?.status || ''}`}>{item.analise?.eq?.label || '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <footer className="footer">
        <p>Lotofácil Motor ABCDE — Desenvolvido por Osmair com IA</p>
      </footer>

      {modalSalvar && (
        <Modal title="Salvar jogo como favorito?" onClose={cancelarSalvarFavorito}>
          <div className="salvar-favorito-content">
            <p>Você deseja salvar este jogo nos favoritos?</p>
            <div className="selected-preview">
              <Balls nums={meuJogo} variant="ball-user" />
            </div>
            <input
              type="text"
              className="input"
              placeholder="Dê um nome para este jogo"
              value={nomeFavorito}
              onChange={e => setNomeFavorito(e.target.value)}
            />
            <div className="actions modal-actions">
              <button className="btn btn-primary" onClick={salvarFavorito} disabled={!nomeFavorito.trim()}>
                Sim, salvar
              </button>
              <button className="btn btn-secondary" onClick={cancelarSalvarFavorito}>
                Não, só analisar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modalFavoritos && (
        <Modal title="Meus Jogos Favoritos" onClose={() => setModalFavoritos(false)}>
          <div className="favoritos-form">
            <input
              type="text"
              className="input"
              placeholder="Nome do jogo favorito"
              value={nomeFavorito}
              onChange={e => setNomeFavorito(e.target.value)}
            />
            <button className="btn btn-primary" onClick={salvarFavorito} disabled={meuJogo.length !== 15 || !nomeFavorito.trim()}>
              Salvar atual
            </button>
          </div>
          {favoritos.length === 0 ? (
            <p className="empty-msg">Nenhum jogo favorito salvo ainda.</p>
          ) : (
            <ul className="favoritos-list">
              {favoritos.map((f, i) => (
                <li key={i} className="favorito-item">
                  <div>
                    <strong>{f.nome}</strong>
                    <Balls nums={f.numeros} variant="ball-user" small />
                  </div>
                  <div className="favorito-actions">
                    <button className="btn btn-sm" onClick={() => carregarFavorito(f.numeros)}>Carregar</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => removerFavorito(i)}>Remover</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}

      {modalSobre && (
        <Modal title="Sobre o Lotofácil Motor ABCDE" onClose={() => setModalSobre(false)}>
          <div className="sobre-content">
            <p><strong>Versão:</strong> 1.2.0</p>
            <p><strong>Desenvolvedor:</strong> Osmair</p>
            <p><strong>Assistente de IA:</strong> Kimi K2.7 Code — Moonshot AI</p>

            <h4>O que é?</h4>
            <p>
              O <strong>Lotofácil Motor ABCDE</strong> é uma ferramenta de análise estatística e geração de jogos para a Lotofácil.
              Ele processa o histórico de sorteios, calcula frequências, identifica números quentes e azarões, monta grupos estratégicos
              e gera combinações com base em critérios matemáticos.
            </p>

            <h4>Como funciona?</h4>
            <ul>
              <li><strong>Fonte oficial:</strong> busca concursos diretamente no site da Caixa via API local.</li>
              <li><strong>Estatísticas:</strong> separa os números mais frequentes (quentes), menos frequentes (azarões) e fixos principais.</li>
              <li><strong>Grupos ABCDE:</strong> divide a base 20 em 5 grupos de 4 números para criar combinações fatoradas.</li>
              <li><strong>Motor:</strong> gera 15 jogos, analisa sequências, equilíbrio de faixas, ímpar/par e score.</li>
              <li><strong>Simulação:</strong> testa o jogo selecionado contra os concursos disponíveis na base.</li>
            </ul>

            <h4>Recursos</h4>
            <ul>
              <li>Busca de qualquer concurso diretamente na fonte oficial.</li>
              <li>Seleção manual de 15 números com análise em tempo real.</li>
              <li>Salvamento de jogos favoritos com nome personalizado.</li>
              <li>Escolha da quantidade de concursos para análise.</li>
              <li>Visualização dos jogos finais, fatorados e ranking por score.</li>
            </ul>

            <p className="disclaimer">
              ⚠️ Esta aplicação é apenas um auxílio técnico baseado em estatística histórica. Não há garantia de acertos em sorteios da Lotofácil.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
