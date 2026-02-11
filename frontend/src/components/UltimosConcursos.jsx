import { useEffect, useState } from 'react';
import { buscarUltimos } from '../services/api';

export default function UltimosConcursos({ concurso }) {
  const [lista, setLista] = useState([]);

  /**
   * Sempre que o concurso mudar,
   * buscamos os 10 anteriores no backend
   */
  useEffect(() => {
    async function carregar() {
      if (!concurso) return;

      try {
        const dados = await buscarUltimos(concurso);
        setLista(dados);
      } catch (err) {
        console.error('Erro ao buscar últimos concursos', err);
      }
    }

    carregar();
  }, [concurso]);

  return (
    <div
      style={{
        border: '2px solid red',
        padding: 15,
        borderRadius: 8,
        minHeight: 250
      }}
    >
      <h3>Últimos 10 jogos</h3>

      {lista.length === 0 && (
        <p style={{ opacity: 0.6 }}>Nenhum dado carregado...</p>
      )}

      {lista.map(item => (
        <div
          key={item.concurso}
          style={{
            marginBottom: 10,
            paddingBottom: 6,
            borderBottom: '1px solid #444'
          }}
        >
          <strong>Concurso {item.concurso}</strong>
          <br />
          <span style={{ fontSize: 14 }}>
            {item.numeros.join(' ')}
          </span>
        </div>
      ))}
    </div>
  );
}
