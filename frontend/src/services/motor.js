// frontend/src/services/motor.js

import {
  contarFrequencias,
  agruparPorFaixa,
  faixasOrdenadas
} from '../../../src/core/estatistica.js';

import {
  selecionarTresMais,
  selecionarDoisMenos,
  criarBase20,
  selecionarDezNumeros,
  complementarComHistorico
} from '../../../src/core/selecao.js';

import {
  contarFrequenciaHistorica,
  classificarZonas
} from '../../../src/core/historico.js';

import { criarGruposABCDE } from '../../../src/fatoracao/grupos.js';
import { gerarJogosFatorados } from '../../../src/fatoracao/fatorador.js';
import { combinarComFixos } from '../../../src/fatoracao/combinador.js';

import {
  analisarSequencias,
  distribuicaoPorFaixa,
  avaliarEquilibrio
} from '../../../src/analise/relatorio.js';

import { comentarJogo } from '../../../src/ia/analista.js';

// ⚠️ ajuste o caminho se necessário
import bd from '../../../data/bd-loto.json';

export function gerarJogosComAnalise() {
  const bdOrdenado = [...bd].sort((a, b) => b.concurso - a.concurso);
  const ultimos10 = bdOrdenado.slice(0, 10);

  const freq = contarFrequencias(ultimos10);
  const faixas = agruparPorFaixa(freq);
  const faixasOrd = faixasOrdenadas(faixas);

  const tresMais = selecionarTresMais(faixasOrd, faixas);
  const doisMenos = selecionarDoisMenos(faixasOrd, faixas);

  const base20 = criarBase20(tresMais, doisMenos);

  let dezSelecionados = selecionarDezNumeros(base20, faixasOrd, faixas);

  if (dezSelecionados.length < 10) {
    const freqHist = contarFrequenciaHistorica(bdOrdenado);
    const zonas = classificarZonas(freqHist);

    dezSelecionados = complementarComHistorico(
      dezSelecionados,
      base20,
      zonas
    );
  }

  const fixos5 = [...tresMais, ...doisMenos];

  const grupos = criarGruposABCDE(base20);
  const jogosFatorados = gerarJogosFatorados(grupos);
  const jogosFinais = combinarComFixos(jogosFatorados, fixos5);

  const resultado = [];

  for (const chave in jogosFinais) {
    const jogo = jogosFinais[chave];

    const seq = analisarSequencias(jogo);
    const dist = distribuicaoPorFaixa(jogo);
    const eq = avaliarEquilibrio(dist);

    const comentario = comentarJogo({
      chave,
      sequencia: seq,
      distribuicao: dist,
      equilibrio: eq
    });

    resultado.push({
      chave,
      numeros: jogo,
      sequencia: seq,
      distribuicao: dist,
      equilibrio: eq,
      comentario: comentario.leitura
    });
  }

  return resultado;
}
