// src/fatoracao/grupos.js

export function criarGruposABCDE(base20) {
  if (base20.length !== 20) {
    throw new Error('Base precisa ter exatamente 20 números');
  }

  const ordenado = [...base20]
    .map(n => Number(n))
    .sort((a, b) => a - b)
    .map(n => String(n).padStart(2, '0'));

  return {
    A: ordenado.slice(0, 4),
    B: ordenado.slice(4, 8),
    C: ordenado.slice(8, 12),
    D: ordenado.slice(12, 16),
    E: ordenado.slice(16, 20)
  };
}
