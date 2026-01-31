export function simularHistorico(bd, quantidade = 200) {
    const estatisticas = {};
    let maxAcertos = 0;

    // começamos após termos pelo menos 10 concursos anteriores
    for (let i = 10; i < Math.min(bd.length, quantidade + 10); i++) {

        // resultado real (concurso seguinte ao cálculo)
        const resultadoReal = bd[i - 1].numeros.map(n =>
            String(n).padStart(2, '0')
        );

        // últimos 10 concursos ANTERIORES ao resultado real
        const ultimos10 = bd.slice(i, i + 10);

        // histórico disponível até aquele momento
        const historico = bd.slice(i);

        // ===== FASE 1 =====
        const freq = contarFrequencias(ultimos10);
        const faixas = agruparPorFaixa(freq);
        const faixasOrd = faixasOrdenadas(faixas);

        const tresMais = selecionarTresMais(faixasOrd, faixas);
        const doisMenos = selecionarDoisMenos(faixasOrd, faixas);
        const base20 = criarBase20(tresMais, doisMenos);

        let dezSelecionados = selecionarDezNumeros(
            base20,
            faixasOrd,
            faixas
        );

        // complemento histórico se faltar
        if (dezSelecionados.length < 10) {
            const freqHist = contarFrequenciaHistorica(historico);
            const zonas = classificarZonas(freqHist);

            dezSelecionados = complementarComHistorico(
                dezSelecionados,
                base20,
                zonas
            );
        }

        const jogo = [
            ...tresMais,
            ...doisMenos,
            ...dezSelecionados
        ];

        // ===== CONFERÊNCIA =====
        const acertos = jogo.filter(n =>
            resultadoReal.includes(n)
        ).length;

        estatisticas[acertos] = (estatisticas[acertos] || 0) + 1;

        if (acertos > maxAcertos) {
            maxAcertos = acertos;
        }
    }

    // 👈 RETORNO CORRETO, FORA DO LOOP
    return { estatisticas, maxAcertos };
}
