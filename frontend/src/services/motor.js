// frontend/src/services/motor.js

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

// ===== BANCO =====
import bd from '../../../data/bd-loto.json';

/**
 * MOTOR PRINCIPAL
 * Replica fielmente o método da planilha
 */
export function gerarJogosComAnalise(ultimoSorteio = null) {
    // =======================
    // PREPARAÇÃO DO BANCO
    // =======================

    const bdOrdenado = [...bd].sort((a, b) => b.concurso - a.concurso);
    const ultimos10 = bdOrdenado.slice(0, 10);

    // =======================
    // FASE 1 — ESTATÍSTICA
    // =======================

    const freq = contarFrequencias(ultimos10);
    const faixas = agruparPorFaixa(freq);
    const faixasOrd = faixasOrdenadas(faixas);

    // =======================
    // FASE 1 — EXTREMOS
    // =======================

    const tresMais = selecionarTresMais(faixasOrd, faixas);
    const doisMenos = selecionarDoisMenos(faixasOrd, faixas);

    // =======================
    // BASE 20
    // =======================

    const base20 = criarBase20(tresMais, doisMenos);

    // =======================
    // SELEÇÃO DOS 10
    // =======================

    let dezSelecionados = selecionarDezNumeros(
        base20,
        faixasOrd,
        faixas
    );

    // Complemento histórico se faltar
    if (dezSelecionados.length < 10) {
        const freqHist = contarFrequenciaHistorica(bdOrdenado);
        const zonas = classificarZonas(freqHist);

        dezSelecionados = complementarComHistorico(
            dezSelecionados,
            base20,
            zonas
        );
    }
    console.log('tresMais:', tresMais);
    console.log('doisMenos:', doisMenos);
    console.log('base20 tamanho:', base20.length);

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

        if (ultimoSorteio && ultimoSorteio.numeros) {
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
    // ordena do maior número de acertos para o menor
    jogos.sort((a, b) => (b.acertos ?? -1) - (a.acertos ?? -1));

    // =======================
    // RETORNO COMPLETO
    // =======================

    return {
        tresMais,
        doisMenos,
        base20,
        dezSelecionados,
        jogos
    };
}
