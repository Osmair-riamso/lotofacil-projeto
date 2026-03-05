import { useState } from 'react'
import { simularHistorico } from '../core/simulador'
import { buscarUltimosConcursos } from '../services/api'

export default function SimuladorMetodo() {

  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(false)

  async function executarSimulacao() {

    setLoading(true)

    try {

      const bd = await buscarUltimosConcursos(500)

      const simulacao = simularHistorico(bd, 200)

      const ranking = {}

      simulacao.forEach(r => {

        ranking[r.melhorAcerto] =
          (ranking[r.melhorAcerto] || 0) + 1

      })

      setResultado(ranking)

    } catch (err) {

      console.error(err)

    }

    setLoading(false)
  }

  return (
    <div style={{ marginTop: 20 }}>

      <button
        onClick={executarSimulacao}
        style={{
          padding: 10,
          width: '100%',
          cursor: 'pointer'
        }}
      >
        🔬 Simular método
      </button>

      {loading && <p>Simulando histórico...</p>}

      {resultado && (
        <div style={{ marginTop: 10 }}>
          <h4>Resultado da simulação</h4>

          {Object.keys(resultado)
            .sort((a, b) => b - a)
            .map(acerto => (
              <div key={acerto}>
                {acerto} acertos → {resultado[acerto]}
              </div>
            ))}
        </div>
      )}

    </div>
  )
}