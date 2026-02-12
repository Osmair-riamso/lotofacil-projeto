// ===== API =====
import { buscarUltimosConcursos } from './api';

// ===== ESTATÍSTICA =====
import {
  contarFrequencias,
  agruparPorFaixa,
  faixasOrdenadas
} from '../../../src/core/estatistica.js';

// ===== SELEÇÃO =====
import {
  selecionarTresMais,
  selecionarDoisMenos,
  criarBase20,
  selecionarDezNumeros,
  complementarComHistorico
} from '../../../src/core/selecao.js';

// ===== HISTÓRICO =====
import {
  contarFrequenciaHistorica,
  classificarZonas
} from '../../../src/core/historico.js';

// ===== FATORAÇÃO =====
import { criarGruposABCDE } from '../../../src/fatoracao/grupos.js';
import { gerarJogosFatorados } from '../../../src/fatoracao/fatorador.js';
import { combinarComFixos } from '../../../src/fatoracao/combinador.js';

// ===== ANÁLISE =====
import {
  analisarSequencias,
  distribuicaoPorFaixa,
  avaliarEquilibrio
} from '../../../src/analise/relatorio.js';

// ===== IA =====
import { comentarJogo } from '../../../src/ia/analista.js';

/**
 * Garante quantidade mínima de elementos
 */
function garantirQuantidade(arr, qtd, pool) {
  const faltam = qtd - arr.length;

  if (faltam <= 0) return arr.slice(0, qtd);

  const extras = pool.filter(n => !arr.includes(n)).slice(0, faltam);
  return [...arr, ...extras];
}

/**
 * MOTOR PRINCIPAL
 * Usa banco vivo do backend
 */
export async function gerarJogosComAnalise(ultimoSorteio = null) {
  // =======================
  // BANCO ATUALIZADO
  // =======================
  const bdOrdenado = await buscarUltimosConcursos(1000);
  bdOrdenado.sort((a, b) => b.concurso - a.concurso);

  const ultimos10 = bdOrdenado.slice(0, 10);

  // =======================
  // ESTATÍSTICA
  // =======================
  const freq = contarFrequencias(ultimos10);
  const faixas = agruparPorFaixa(freq);
  const faixasOrd = faixasOrdenadas(faixas);

  // =======================
  // EXTREMOS
  // =======================
  const tresMaisRaw = selecionarTresMais(faixasOrd, faixas);
  const doisMenosRaw = selecionarDoisMenos(faixasOrd, faixas);

  const todos25 = Array.from({ length: 25 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );

  const tresMais = garantirQuantidade(tresMaisRaw, 3, todos25);
  const doisMenos = garantirQuantidade(doisMenosRaw, 2, todos25);

  // =======================
  // BASE 20
  // =======================
  let base20 = criarBase20(tresMais, doisMenos);

  if (base20.length !== 20) {
    console.warn('⚠️ Base inválida. Recalculando fallback...');

    base20 = todos25
      .filter(n => !tresMais.includes(n) && !doisMenos.includes(n))
      .slice(0, 20);
  }

  // =======================
  // SELEÇÃO DOS 10
  // =======================
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

  // =======================
  // FATORAÇÃO
  // =======================
  const fixos5 = [...tresMais, ...doisMenos];

  const grupos = criarGruposABCDE(base20);
  const jogosFatorados = gerarJogosFatorados(grupos);
  const jogosFinais = combinarComFixos(jogosFatorados, fixos5);

  // =======================
  // ANÁLISE DOS JOGOS
  // =======================
  const jogos = [];

  for (const chave in jogosFinais) {
    const numeros = jogosFinais[chave];

    const sequencia = analisarSequencias(numeros);
    const distribuicao = distribuicaoPorFaixa(numeros);
    const equilibrio = avaliarEquilibrio(distribuicao);

    const comentario = comentarJogo({
      chave,
      sequencia,
      distribuicao,
      equilibrio
    });

    let acertos = null;

    if (ultimoSorteio?.numeros) {
      acertos = numeros.filter(n =>
        ultimoSorteio.numeros.includes(n)
      ).length;
    }

    jogos.push({
      chave,
      numeros,
      sequencia,
      distribuicao,
      equilibrio,
      comentario: comentario.leitura,
      acertos
    });
  }

  // Ordena por acertos
  jogos.sort((a, b) => (b.acertos ?? -1) - (a.acertos ?? -1));

  // =======================
  // RETORNO
  // =======================
  return {
    tresMais,
    doisMenos,
    base20,
    dezSelecionados,
    jogos
  };
}
