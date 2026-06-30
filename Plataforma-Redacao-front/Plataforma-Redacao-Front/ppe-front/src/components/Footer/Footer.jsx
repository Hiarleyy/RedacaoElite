import styles from "./styles.module.css"

const Footer = () => {
  return (
    <footer className={styles.footer}>

      <div className={styles.companyInfo}>
        <h3>REDAÇÃO ELITE</h3>
        <p>Endereço: Rua Exemplo, 123 - Cidade, Estado</p>
        <p>Telefone: (00) 1234-5678 | Email: contato@empresa.com</p>
        <p>© {new Date().getFullYear()} Redação Elite. Todos os direitos reservados.</p>
      </div>

      <div className={styles.developers}>
        <h4>Desenvolvedores</h4>
        <ul className={styles.devList}>
          <li>Ryan Costa Benjamim</li>
          <li>Beltrano da Silva</li>
          <li>Ciclano Souza</li>
        </ul>
      </div>
      
    </footer>
  )
}

export default Footer