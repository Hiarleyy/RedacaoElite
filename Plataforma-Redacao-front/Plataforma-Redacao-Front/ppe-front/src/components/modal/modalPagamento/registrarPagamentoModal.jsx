import styles from "../modalPagamento/styles.module.css";
import logo from "../../../images/logo02.png";
import { useState, useEffect } from "react";
import fetchData from "../../../utils/fetchData";
import axios from "axios";
import SuccessModal from "../modalSucess/modalSucess";
import ModalFailure from "../modalFailure/modalFailure";

const RegistrarPagamentoModal = ({ onClose }) => {
  const [formMessage, setFormMessage] = useState({});
  const [aluno, setaluno] = useState("");
  const [turma, setTurma] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [valor, setValor] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [alunosID, setAlunosID] = useState([]);
  const [showfailureModal, setShowfailureModal] = useState(false);
  const [showSuccessModal, setShowSucessModal] = useState(false);


  // Buscar todas as turmas ao carregar o componente
  useEffect(() => {
    const getData = async () => {
      const { getTurmas } = fetchData();
      const response = await getTurmas();
      const options = response.map((item) => ({
        id: item.id,
        nome: item.nome,
      }));
      setTurmas(options);
    };
    getData();
  }, []);

  // Buscar alunos com base no ID da turma selecionada
  useEffect(() => {
    const getAlunos = async () => {
      if (!turma) return;

      try {
        const { getTurmaById } = fetchData();
        const response = await getTurmaById(turma); // aqui turma é o ID
        console.log("Alunos da turma:", response);
        setAlunosID(response.usuarios || []); // ajuste se o array de alunos vier em outra chave
      } catch (error) {
        console.error("Erro ao buscar alunos", error);
      }
    };
    getAlunos();
  }, [turma]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/pagamentos", {
        usuarioId: aluno,
        // valor númerico
        valor: Number(valor),
      });

      setFormMessage({
        type: "success",
        text: `Pagamento ${response.data} criado com sucesso.`,
      });
      setShowSucessModal(true);
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response.data.error,
      });
      setShowfailureModal(true);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.container}>
        <button onClick={onClose} className={styles.closeButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.formSection}>
          <h2 className={styles.title}>REGISTRAR PAGAMENTO</h2>

          <form onSubmit={handleSubmit} className={styles.formContainer}>
            <div className={styles.formGroup}>
              <label>Turma:</label>
              <select value={turma} onChange={(e) => setTurma(e.target.value)}>
                <option value="">Selecione</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Nome do Aluno:</label>
              <select value={aluno} onChange={(e) => setaluno(e.target.value)}>
                <option value="">Selecione um aluno</option>
                {alunosID.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Data de Pagamento:</label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Data de Vencimento:</label>
              <input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Valor:</label>
              <input
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="R$ 100"
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              REGISTRAR PAGAMENTO
            </button>
          </form>
        </div>

        <div className={styles.logoArea}>
          <img src={logo} alt="Logo" />
        </div>
        {showSuccessModal && (
          <SuccessModal
            onClose={() => {
              setShowSucessModal(false);
              onClose();
            }}
          />
        )}
        {showfailureModal && (
          <ModalFailure
            onClose={() => {
              setShowfailureModal(false);

            }}
          />
        )}
      </div>
    </div>
  );
};

export default RegistrarPagamentoModal;
