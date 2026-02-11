// src/fatoracao/grupos.js

export function criarGruposABCDE(base20) {
  // ===============================
  // VALIDAÇÃO FORTE DA BASE
  // ===============================

  if (!Array.isArray(base20)) {
    throw new Error('Base precisa ser um array');
  }

  // remove valores inválidos
  const limpa = base20
    .filter(Boolean)
    .map(n => String(n).padStart(2, '0'));

  // remove duplicados
  const unicos = [...new Set(limpa)];

  if (unicos.length !== 20) {
    console.error('❌ Base recebida inválida:', base20);
    console.error('❌ Após limpeza:', unicos);

    throw new Error('Base precisa ter exatamente 20 números únicos');
  }

  // ===============================
  // ORDENAÇÃO
  // ===============================

  const ordenado = unicos
    .map(n => Number(n))
    .sort((a, b) => a - b)
    .map(n => String(n).padStart(2, '0'));

  // ===============================
  // DIVISÃO EM GRUPOS
  // ===============================

  return {
    A: ordenado.slice(0, 4),
    B: ordenado.slice(4, 8),
    C: ordenado.slice(8, 12),
    D: ordenado.slice(12, 16),
    E: ordenado.slice(16, 20)
  };
}
