export default function ResumoExtremos({ tresMais, doisMenos }) {
  return (
    <div style={{ margin: '20px 0' }}>
      <h2>📊 Resumo do Método</h2>

      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <strong>🔥 3 Mais:</strong>{' '}
          {tresMais.map(n => (
            <span key={n} style={{ color: 'green', marginRight: 8 }}>
              {n}
            </span>
          ))}
        </div>

        <div>
          <strong>📉 2 Menos:</strong>{' '}
          {doisMenos.map(n => (
            <span key={n} style={{ color: 'red', marginRight: 8 }}>
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
