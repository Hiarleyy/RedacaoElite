import React, { useState } from "react";
import styles from "./styles.module.css";
import axios from "axios";
import Message from "../Message/Message";
import useUseful from "../../utils/useUseful"

const baseURL = import.meta.env.VITE_API_BASE_URL;

const RegistrarDespesaModal = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState("");
  const [valor, setValor] = useState("");
  const [tipoDespensa, settipoDespensa] = useState("");
  const [formMessage, setFormMessage] = useState(null);
  const { getHeaders } = useUseful()

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

        <h2 className={styles.title}>Registrar Despesa</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            Status:
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              <option value="ENTRADA">ENTRADA</option>
              <option value="SAÍDA">SAÍDA</option>
            </select>
          </label>

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
            Tipo de Despesa:
            <input
              type="text"
              value={tipoDespensa}
              onChange={(e) => settipoDespensa(e.target.value)}
              required
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
