import { useEffect, useState } from 'react';
import { buscarUltimosConcursos } from '../services/api';

export default function UltimosConcursos() {
  const [concursos, setConcursos] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarUltimosConcursos(10);
        setConcursos(dados);
      } catch (err) {
        console.error('Erro ao carregar últimos concursos', err);
      }
    }

    carregar();
  }, []);

  return (
    <div style={{ marginTop: 10 }}>
      <h3 style={{ marginBottom: 8 }}>Últimos 10 concursos</h3>

      {concursos.length === 0 ? (
        <p style={{ opacity: 0.6 }}>Nenhum dado carregado</p>
      ) : (
        concursos.map(c => (
          <div
            key={c.concurso}
            style={{
              marginBottom: 6,
              fontSize: 14,
              lineHeight: 1.4
            }}
          >
            <strong>{c.concurso}</strong> → {c.numeros.join(' ')}
          </div>
        ))
      )}
    </div>
  );

}
