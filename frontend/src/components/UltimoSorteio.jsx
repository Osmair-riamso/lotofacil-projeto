import { useState, useRef } from 'react';
import {
  buscarUltimoSorteio,
  buscarConcurso
} from '../services/api';

export default function UltimoSorteio({ onAtualizar }) {
  const [concurso, setConcurso] = useState('');
  const [numeros, setNumeros] = useState(Array(15).fill(''));
  const inputsRef = useRef([]);

  function atualizarNumero(valor, index) {
    const apenasNumeros = valor.replace(/\D/g, '').slice(0, 2);

    const novos = [...numeros];
    novos[index] = apenasNumeros;
    setNumeros(novos);

    if (apenasNumeros.length === 2 && index < 14) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  async function buscarAutomatico() {
    try {
      const data = await buscarUltimoSorteio();

      setConcurso(data.concurso);
      setNumeros(data.numeros);

      onAtualizar(data);
    } catch {
      alert('Erro ao buscar último sorteio');
    }
  }

  async function buscarPorConcurso() {
    try {
      const data = await buscarConcurso(concurso);

      setNumeros(data.numeros);

      onAtualizar(data);
    } catch {
      alert('Concurso não encontrado');
    }
  }

  function aplicarManual() {
    const numsFormatados = numeros.map(n =>
      String(n).padStart(2, '0')
    );

    if (numsFormatados.some(n => n === '00' || n === '')) {
      alert('Preencha todos os 15 números corretamente');
      return;
    }

    onAtualizar({
      concurso,
      numeros: numsFormatados
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

      <button
        onClick={buscarAutomatico}
        style={{ marginLeft: 10 }}
      >
        🔄 Buscar automático
      </button>

      <br /><br />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 50px)',
          gap: 8,
          marginBottom: 10
        }}
      >
        {numeros.map((valor, index) => (
          <input
            key={index}
            ref={el => (inputsRef.current[index] = el)}
            type="text"
            value={valor}
            onChange={e =>
              atualizarNumero(e.target.value, index)
            }
            maxLength={2}
            style={{
              textAlign: 'center',
              fontSize: 16,
              padding: 6
            }}
          />
        ))}
      </div>

      <button onClick={aplicarManual}>
        Aplicar sorteio
      </button>
    </div>
  );
}
