import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import Message from "../Message/Message";
import useUseful from "../../utils/useUseful";
import fetchData from "../../utils/fetchData";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const RegistrarDespesaModal = ({ isOpen, onClose, initialAlunoId }) => {
  const [status, setStatus] = useState("");
  const [valor, setValor] = useState("");
  const [tipoDespensa, settipoDespensa] = useState("");
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [formMessage, setFormMessage] = useState(null);
  const { getHeaders } = useUseful();

  useEffect(() => {
    if (isOpen) {
      const loadAlunos = async () => {
        try {
          const { getAlunos } = fetchData();
          const data = await getAlunos();
          const filtered = (data || []).filter(
            (u) => u.tipoUsuario === "STANDARD" || u.tipoUsuario === "standard"
          );
          filtered.sort((a, b) => a.nome.localeCompare(b.nome));
          setAlunos(filtered);
        } catch (error) {
          console.error("Erro ao carregar alunos:", error);
        }
      };
      loadAlunos();

      if (initialAlunoId) {
        setAlunoId(initialAlunoId);
        setStatus("ENTRADA");
      } else {
        setAlunoId("");
        setStatus("");
      }
      setValor("");
      settipoDespensa("");
      setDataVencimento("");
      setDataPagamento("");
      setFormMessage(null);
    }
  }, [isOpen, initialAlunoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!status || !valor || !tipoDespensa) {
      alert("Preencha todos os campos");
      return;
    }

    const payload = {
      status,
      valor: parseFloat(valor),
      tipoDespensa,
      usuarioId: status === "ENTRADA" && alunoId ? alunoId : null,
      dataVencimento: dataVencimento || null,
      dataPagamento: dataPagamento || null,
    };

    try {
      const response = await axios.post(
        `${baseURL}/pagamentos`,
        payload,
        { headers: getHeaders() }
      );

      setFormMessage({
        type: "success",
        text: response.data.message,
      });

      console.log("Despesa enviada:", payload);

      // limpa os campos
      setStatus("");
      setValor("");
      settipoDespensa("");
      setAlunoId("");
      setDataVencimento("");
      setDataPagamento("");
    } catch (error) {
      console.error("Erro na requisição:", error.response || error.message);

      setFormMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao registrar despesa.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <h2 className={styles.title}>Registrar Movimentação Financeira</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Status:
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="ENTRADA">ENTRADA (Receita)</option>
              <option value="SAÍDA">SAÍDA (Despesa)</option>
            </select>
          </label>

          {status === "ENTRADA" && (
            <label>
              Aluno (Opcional):
              <select
                value={alunoId}
                onChange={(e) => setAlunoId(e.target.value)}
              >
                <option value="">Nenhum (Receita Geral)</option>
                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Valor (R$):
            <input
              type="number"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </label>

          <label>
            Descrição / Tipo:
            <input
              type="text"
              value={tipoDespensa}
              onChange={(e) => settipoDespensa(e.target.value)}
              required
            />
          </label>

          <label>
            Data de Vencimento (Opcional):
            <input
              type="date"
              value={dataVencimento}
              onChange={(e) => setDataVencimento(e.target.value)}
            />
          </label>

          <label>
            Data de Pagamento (Opcional - Deixe em branco se pendente):
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
            />
          </label>

          <div className={styles.footer}>
            <button className={styles.button}>Salvar</button>
          </div>
          <Message
            text={formMessage ? formMessage.text : ""}
            type={formMessage ? formMessage.type : ""}
          />
        </form>
      </div>
    </div>
  );
};

export default RegistrarDespesaModal;
