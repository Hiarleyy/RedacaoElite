import styles from './styles.module.css'

const RankingTabela = ({ ranking, currentUserId, isClassRanking, userClassId }) => {

  return (
    <div className={styles.tabela_container} role="region" aria-label="Tabela de classificação">
      <table className={styles.tabela}>
        <thead>
          {isClassRanking ? (
            <tr>
              <th className={styles.cabecalho}>Posição</th>
              <th className={styles.cabecalho}>Turma</th>
              <th className={styles.cabecalho}>Média</th>
            </tr>
          ) : (
            <tr>
              <th className={styles.cabecalho}>Posição</th>
              <th className={styles.cabecalho}>Nome</th>
              <th className={styles.cabecalho}>Turma</th>
              <th className={styles.cabecalho}>Média</th>
            </tr>
          )}
        </thead>
        <tbody>
          {ranking.slice(3, 30).map((item, index) => {
            const isHighlighted = isClassRanking 
              ? item.id === userClassId 
              : item.id === currentUserId;

            return (
              <tr key={item.id} className={isHighlighted ? styles.row_highlighted : ''}>
                <td className={styles.celula}>{`${index + 4}º`}</td>
                
                {isClassRanking ? (
                  <>
                    <td className={styles.celula} title={item.nome}>
                      {item.nome} {isHighlighted && <span className={styles.badge_you}>(Sua Turma)</span>}
                    </td>
                    <td className={styles.celula}>{item.ultima_nota}</td>
                  </>
                ) : (
                  <>
                    <td className={styles.celula} title={item.nome}>
                      {item.nome} {isHighlighted && <span className={styles.badge_you}>(Você)</span>}
                    </td>
                    <td className={styles.celula} title={item.turma}>{item.turma}</td>
                    <td className={styles.celula}>{item.ultima_nota}</td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RankingTabela
