const API_URL = 'http://localhost:3001';

/**
 * Busca último sorteio no backend
 */
export async function buscarUltimoSorteio() {
  const res = await fetch(`${API_URL}/lotofacil/ultimo`);
  if (!res.ok) throw new Error('Erro ao buscar último sorteio');
  return await res.json();
}

/**
 * Busca sorteio por número de concurso
 */
export async function buscarConcurso(concurso) {
  const res = await fetch(`${API_URL}/lotofacil/${concurso}`);
  if (!res.ok) throw new Error('Concurso não encontrado');
  return await res.json();
}
