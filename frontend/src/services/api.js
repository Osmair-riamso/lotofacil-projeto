const API_URL = 'http://localhost:3001';

/**
 * Último sorteio oficial
 */
export async function buscarUltimoSorteio() {
  const res = await fetch(`${API_URL}/lotofacil/ultimo`);
  if (!res.ok) throw new Error('Erro ao buscar último sorteio');
  return res.json();
}

/**
 * Busca concurso específico
 */
export async function buscarConcurso(concurso) {
  const res = await fetch(`${API_URL}/lotofacil/${concurso}`);
  if (!res.ok) throw new Error('Concurso não encontrado');
  return res.json();
}

/**
 * Os N últimos concursos
 */
export async function buscarUltimosConcursos(qtd = 10) {
  const res = await fetch(`${API_URL}/lotofacil/ultimos/${qtd}`);
  if (!res.ok) throw new Error('Erro ao buscar últimos concursos');
  return res.json();
}

/**
 * Base histórica para alimentar o motor.
 * Busca os últimos 300 concursos por padrão (suficiente para simulação).
 */
export async function buscarBaseMotor(qtd = 300) {
  return buscarUltimosConcursos(qtd);
}
