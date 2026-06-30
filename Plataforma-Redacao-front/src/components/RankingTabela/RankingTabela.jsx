import styles from './styles.module.css'

const RankingTabela = ({ ranking }) => {

  return (
    <div className={styles.tabela_container} role="region" aria-label="Tabela de classificação">
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.cabecalho}>Posição</th>
            <th className={styles.cabecalho}>Nome</th>
            <th className={styles.cabecalho}>Turma</th>
            <th className={styles.cabecalho}>Média</th>
          </tr>
        </thead>
        <tbody>
          {ranking.slice(3,30).map((item, index) => (
            <tr key={item.id}>
              <td className={styles.celula}>{`${index + 4}º`}</td>
              <td className={styles.celula} title={item.nome}>{item.nome}</td>
              <td className={styles.celula} title={item.turma}>{item.turma}</td>
              <td className={styles.celula}>{item.ultima_nota}</td>    
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RankingTabela
