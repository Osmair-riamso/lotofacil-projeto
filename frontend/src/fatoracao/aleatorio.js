// src/fatoracao/aleatorio.js

export function sortear(array, quantidade) {
  const copia = [...array];
  const resultado = [];

  for (let i = 0; i < quantidade && copia.length > 0; i++) {
    const indice = Math.floor(Math.random() * copia.length);
    resultado.push(copia.splice(indice, 1)[0]);
  }

  return resultado;
}
