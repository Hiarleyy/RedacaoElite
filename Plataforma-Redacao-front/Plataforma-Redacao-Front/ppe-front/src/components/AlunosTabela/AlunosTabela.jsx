import styles from './styles.module.css'
import useUseful from '../../utils/useUseful';
import Button from '../Button/Button';
import { useNavigate } from 'react-router-dom';

const AlunosTabela = ({ alunos }) => {
  const { brasilFormatData } = useUseful()
  const navigate = useNavigate()

  return (
    <div className={styles.tabela_container}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th className={styles.cabecalho}>Nome</th>
            <th className={styles.cabecalho}>Email</th>
            <th className={styles.cabecalho}>Data de Matrícula</th>
            <th className={styles.cabecalho}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((aluno) => (
            <tr key={aluno.id}>
              <td className={styles.celula}>{aluno.nome}</td>
              <td className={styles.celula}>{aluno.email}</td>
              <td className={styles.celula}>{brasilFormatData(aluno.dataCriacao)}</td>
              <td className={styles.celula}>
                <Button 
                  text_size="20px" 
                  text_color="#E0E0E0" 
                  padding_sz="10px" 
                  bg_color="#4A8F4A"
                  width_size="50px"
                  height_size="40px"
                  radius="6px"
                  onClick={() => navigate(`/admin/gerenciar-alunos/${aluno.id}`)}
                ><i class="fa-solid fa-eye"></i></Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AlunosTabela
