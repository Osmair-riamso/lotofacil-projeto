import { useState } from 'react';
import bd from '../../../data/bd-loto.json';

export default function UltimoSorteio({ onAtualizar }) {
  const [concurso, setConcurso] = useState('');
  const [numerosTexto, setNumerosTexto] = useState('');

  function buscarPorConcurso() {
    const achado = bd.find(
      c => String(c.concurso) === String(concurso)
    );

    if (!achado) {
      alert('Concurso não encontrado no histórico');
      return;
    }

    const nums = achado.numeros.map(n =>
      String(n).padStart(2, '0')
    );

    setNumerosTexto(nums.join(' '));

    onAtualizar({
      concurso: achado.concurso,
      numeros: nums
    });
  }

  function aplicarManual() {
    const numeros = numerosTexto
      .split(/[\s,;-]+/) // aceita espaço, vírgula, ponto e vírgula, hífen
      .map(n => n.trim())
      .filter(Boolean)
      .map(n => String(n).padStart(2, '0'));

    if (numeros.length !== 15) {
      alert('Informe exatamente 15 números');
      return;
    }

    onAtualizar({
      concurso,
      numeros
    });
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <h3>Último Sorteio</h3>

      <input
        type="number"
        placeholder="Concurso (ex: 3603)"
        value={concurso}
        onChange={e => setConcurso(e.target.value)}
        style={{ marginRight: 10 }}
      />

      <button onClick={buscarPorConcurso}>
        Buscar concurso
      </button>

      <br /><br />

      <input
        type="text"
        placeholder="Números (ex: 02 04 05 09 ...)"
        value={numerosTexto}
        onChange={e => setNumerosTexto(e.target.value)}
        style={{ width: '100%' }}
      />

      <br /><br />

      <button onClick={aplicarManual}>
        Aplicar sorteio
      </button>
    </div>
  );
}
