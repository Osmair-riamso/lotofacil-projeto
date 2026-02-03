import { useState } from 'react';

export default function UltimoSorteio({ onAtualizar }) {
  const [concurso, setConcurso] = useState('');
  const [numeros, setNumeros] = useState('');

  function aplicar() {
    const lista = numeros
      .split(' ')
      .map(n => n.padStart(2, '0'))
      .filter(n => n);

    onAtualizar({
      concurso,
      numeros: lista
    });
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8 }}>
      <h2>🎯 Último Sorteio</h2>

      <div>
        <label>Concurso:</label>
        <input
          value={concurso}
          onChange={e => setConcurso(e.target.value)}
          style={{ marginLeft: 10 }}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <label>Números:</label>
        <input
          value={numeros}
          onChange={e => setNumeros(e.target.value)}
          placeholder="01 02 03 04 05 ..."
          style={{ marginLeft: 10, width: '70%' }}
        />
      </div>

      <button onClick={aplicar} style={{ marginTop: 10 }}>
        Atualizar sorteio
      </button>
    </div>
  );
}
