// src/services/motor.js

import { analisarSequencias } from '../desenho/sequencia.js';
import { ajustarJogo } from '../desenho/ajuste.js';
import { sortear } from '../fatoracao/aleatorio.js';
import { gerarJogosFatorados, combinarComFixos } from '../fatoracao/combinador.js';
import { selecionarNumeros } from '../core/selecao.js';
import { simularMelhorJogo } from '../simulacao/simulador.js';
import { gerarRelatorio } from '../analise/relatorio.js';

function normalizar(nums) {
  return [...new Set((nums || []).map(n => String(n).padStart(2, '0')))].sort((a, b) => Number(a) - Number(b));
}

function analisarJogo(jogo, fixos5) {
  const numeros = normalizar(jogo);
  const impares = numeros.filter(n => Number(n) % 2 !== 0).length;
  const pares = numeros.length - impares;

  const faixas = { '1-5': 0, '6-10': 0, '11-15': 0, '16-20': 0, '21-25': 0 };
  numeros.forEach(n => {
    const v = Number(n);
    if (v <= 5) faixas['1-5']++;
    else if (v <= 10) faixas['6-10']++;
    else if (v <= 15) faixas['11-15']++;
    else if (v <= 20) faixas['16-20']++;
    else faixas['21-25']++;
  });

  const fixosNoJogo = numeros.filter(n => fixos5.includes(n)).length;
  const azaroesNoJogo = numeros.filter(n => ['14', '06'].includes(n)).length;

  const valores = Object.values(faixas);
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  const desvio = Math.sqrt(valores.reduce((s, v) => s + Math.pow(v - media, 2), 0) / valores.length);

  let status = 'equilibrado';
  let label = 'Equilibrado';
  if (desvio > 2.2) {
    status = 'desbalanceado';
    label = 'Desbalanceado';
  } else if (desvio > 1.4) {
    status = 'atencao';
    label = 'Atenção';
  }

  return {
    seq: analisarSequencias(numeros),
    impares,
    pares,
    faixas,
    eq: { status, label, desvio: Number(desvio.toFixed(2)) },
    fixosNoJogo,
    azaroesNoJogo
  };
}

function scoreJogo(analise) {
  let score = 10;

  score -= Math.max(0, analise.seq.maiorTamanho - 3) * 0.5;

  if (analise.eq.status === 'desbalanceado') score -= 1.5;
  else if (analise.eq.status === 'atencao') score -= 0.7;
  else score += 0.5;

  const imparParIdeal = Math.abs(analise.impares - 8);
  score -= imparParIdeal * 0.2;

  score += analise.fixosNoJogo * 0.4;
  score += analise.azaroesNoJogo * 0.3;

  return Math.max(0, Number(score.toFixed(1)));
}

export function processar(concursos, meuJogo = null) {
  if (!Array.isArray(concursos) || concursos.length === 0) {
    throw new Error('Lista de concursos inválida ou vazia.');
  }

  const todos = concursos.map(c => ({
    ...c,
    numeros: normalizar(c.numeros || [])
  }));

  const ultimos10 = todos.slice(0, 10);

  // Usa selecionarNumeros que já retorna tudo que precisamos
  const {
    top10Curto,
    top10Longo,
    tresMais,
    doisMenos,
    base20
  } = selecionarNumeros(ultimos10, todos);

  const grupos = [
    base20.slice(0, 4),
    base20.slice(4, 8),
    base20.slice(8, 12),
    base20.slice(12, 16),
    base20.slice(16, 20)
  ];

  const fixos5 = normalizar([...tresMais, ...doisMenos]);

  const x1 = base20.slice(0, 12);
  const x2 = base20.slice(4, 16);
  const aleatorios = [
    sortear(base20, 12),
    sortear(base20, 12),
    sortear(base20, 12)
  ];

  const jogosFatorados = gerarJogosFatorados(grupos, x1, x2, aleatorios);
  const jogosFinais = combinarComFixos(jogosFatorados, fixos5, base20);

  const analises = {};
  const scores = {};
  const comentarios = {};

  for (const chave in jogosFinais) {
    const ajuste = ajustarJogo({ jogo: jogosFinais[chave], tresMais, base20 });
    const jogoFinal = normalizar(ajuste.jogo);

    jogosFinais[chave] = jogoFinal;

    const analise = analisarJogo(jogoFinal, fixos5);
    analises[chave] = analise;
    scores[chave] = scoreJogo(analise);
    comentarios[chave] = gerarRelatorio(chave, jogoFinal, analise, { tresMais, doisMenos });

  }

  const ranking = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const melhorChave = ranking[0]?.[0];
  const jogoFinal = melhorChave ? jogosFinais[melhorChave] : [];

  let analiseUsuario = null;
  if (meuJogo && meuJogo.length === 15) {
    const jogoUsuario = normalizar(meuJogo);
    const ajuste = ajustarJogo({ jogo: jogoUsuario, tresMais, base20 });
    const finalUsuario = normalizar(ajuste.jogo);

    const analise = analisarJogo(finalUsuario, fixos5);
    analiseUsuario = {
      score: scoreJogo(analise),
      jogo: finalUsuario,
      ajuste: ajuste.ajustado ? {
        removido: ajuste.removido,
        adicionado: ajuste.adicionado
      } : null
    };
  }

  const resultadoSimulacao = simularMelhorJogo(jogoFinal, todos);

  return {
    top10Curto,
    top10Longo,
    tresMais,
    doisMenos,
    base20,
    grupos,
    fixos5,
    jogosFatorados,
    jogosFinais,
    analises,
    scores,
    comentarios,
    melhorChave,
    jogoFinal,
    analiseUsuario,
    resultadoSimulacao
  };
}
