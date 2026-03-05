export function simularHistorico(bd, quantidade = 200) {

  const resultados = []

  for (let i = 20; i < quantidade; i++) {

    const concursoTeste = bd[i]

    const numeros = concursoTeste.numeros

    // simulação simples
    let acertos = 0

    numeros.forEach(n => {

      if (Math.random() > 0.5) {
        acertos++
      }

    })

    resultados.push({
      concurso: concursoTeste.concurso,
      melhorAcerto: acertos
    })

  }

  return resultados
}