const API_URL = 'http://localhost:3001';

/**
 * Busca último sorteio oficial
 */
export async function buscarUltimoSorteio() {
  const res = await fetch(`${API_URL}/lotofacil/ultimo`);

  if (!res.ok) {
    throw new Error('Erro ao buscar último sorteio');
  }

  return await res.json();
}

/**
 * Busca concurso específico pelo número
 */
export async function buscarConcurso(concurso) {
  const res = await fetch(`${API_URL}/lotofacil/${concurso}`);

  if (!res.ok) {
    throw new Error('Concurso não encontrado');
  }

  return await res.json();
}

/**
 * Busca os 10 concursos anteriores
 */
export async function buscarUltimos(concurso) {
  const res = await fetch(`${API_URL}/lotofacil/${concurso}/anteriores`);

  if (!res.ok) {
    throw new Error('Erro ao buscar últimos concursos');
  }

  return await res.json();
}

