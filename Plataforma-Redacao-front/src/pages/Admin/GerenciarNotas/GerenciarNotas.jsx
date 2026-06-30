import styles from "./styles.module.css";
import { Link, useParams } from "react-router-dom";
import Title from "../../../components/Title/Title";
import DetailsCard from "../../../components/DetailsCard/DetailsCard";
import Button from "../../../components/Button/Button";
import Message from "../../../components/Message/Message";
import Loading from "../../../components/Loading/Loading";
import InputSelect from "../../../components/InputSelect/InputSelect";
import fetchData from "../../../utils/fetchData";
import useUseful from "../../../utils/useUseful";
import { useState, useEffect } from "react";
import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL;

const GerenciarNotas = () => {
  const [redacao, setRedacao] = useState([]);
  const { aluno_id } = useParams();
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { brasilFormatData, getHeaders } = useUseful();
  const [isLoading, setIsLoading] = useState(false);
  const [comp01, setComp01] = useState("");
  const [comp02, setComp02] = useState("");
  const [comp03, setComp03] = useState("");
  const [comp04, setComp04] = useState("");
  const [comp05, setComp05] = useState("");
  const [feedback, setFeedback] = useState("");
  const [formMessage, setFormMessage] = useState(null);
  const [teste, setTest] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);
  const [fileName, setFilesName] = useState("Nenhum arquivo enviado");


  const getData = async () => {
    const { getRedacaoById } = fetchData();
    const response = await getRedacaoById(aluno_id);
    setRedacao(response);
  };
  useEffect(() => {
    setIsLoadingData(true);
    try {
      getData();
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);
  const handleFileUpload = async (file) => {
    setFilesName(file.name);

    if (file.type.startsWith("image/")) {
      try {
        const compressedImage = await imageCompression(file, {
          maxSizeMB: 5,
          useWebWorker: true,
        });

        const imageData = await compressedImage.arrayBuffer();
        const pdfDoc = await PDFDocument.create();
        const image = file.type.includes("png")
          ? await pdfDoc.embedPng(imageData)
          : await pdfDoc.embedJpg(imageData);

        const page = pdfDoc.addPage([image.width * 0.7, image.height * 0.7]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width * 0.7,
          height: image.height * 0.7,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });

        setFileBlob(blob);
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
      }
    } else if (file.type === "application/pdf") {
      setFileBlob(file);
    } else {
      alert("Formato de arquivo não aceito");
    }
  };
    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validação para garantir que todas as notas sejam preenchidas
    if ([comp01, comp02, comp03, comp04, comp05].some((comp) => comp === "")) {
      setFormMessage({
        type: "error",
        text: "Todas as competências precisam ser preenchidas.",
      });
      setIsLoading(false);
      return;
    }

    const data = {
      competencia01: comp01,
      competencia02: comp02,
      competencia03: comp03,
      competencia04: comp04,
      competencia05: comp05,
      nota: comp01 + comp02 + comp03 + comp04 + comp05,
    
    };

    try {
      await axios.put(
        `${baseURL}/correcoes/${redacao?.correcao?.id}`, 
        data, 
        { headers: getHeaders() }
      );

      setFormMessage({
        type: "success",
        text: "Notas atualizadas com sucesso.",
      });
    } catch (error) {
      console.error(error);
      setFormMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao atualizar as notas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  

  

  return (
    <div className={styles.container}>
      <Title title="Gerenciar Notas" />

      <div className={styles.main_content}>
        <div className={styles.bg_left}>
          {isLoadingData ? (
            <div className={styles.loading}>
              <Loading />
            </div>
          ) : (
            <>
              <p className={styles.title}>Detalhes da redação</p>

              <DetailsCard
                title="Título"
                content={redacao.titulo && redacao.titulo}
                bg_color="#1F1F1F"
                text_size="16px"
              />

              <DetailsCard
                title="Enviado em"
                content={redacao.data && brasilFormatData(redacao.data)}
                bg_color="#1F1F1F"
                text_size="16px"
              />

              <DetailsCard
                title="Status"
                content={redacao.status && redacao.status}
                bg_color="#1F1F1F"
                text_size="16px"
              />

              <DetailsCard
                title="Autor"
                content={redacao.usuario?.nome && redacao.usuario?.nome}
                bg_color="#1F1F1F"
                text_size="16px"
              />

              <Link to={`http://localhost:3000/redacoes/download/${aluno_id}`}>
                <Button
                  text_size="20px"
                  text_color="#E0E0E0"
                  padding_sz="10px"
                  bg_color="#DA9E00"
                >
                  <i class="fa-solid fa-download"></i> BAIXAR ESSA REDAÇÃO
                </Button>
              </Link>
            </>
          )}
        </div>
        <form className={styles.bg_right} onSubmit={handleSubmit}>
          <p className={styles.title}>Avaliação</p>

          {[comp01, comp02, comp03, comp04, comp05].map((value, index) => (
            <InputSelect
              key={index}
              color="#1A1A1A"
              text={`Competência 0${index + 1} - ${
                [
                  "Domínio da norma culta",
                  "Compreensão da proposta",
                  "Argumentação",
                  "Coesão Textual",
                  "Proposta de Intervenção",
                ][index]
              }`}
              value={value}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                switch (index) {
                  case 0:
                    setComp01(newValue);
                    break;
                  case 1:
                    setComp02(newValue);
                    break;
                  case 2:
                    setComp03(newValue);
                    break;
                  case 3:
                    setComp04(newValue);
                    break;
                  case 4:
                    setComp05(newValue);
                    break;
                  default:
                    break;
                }
              }}
              options={[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map(
                (v) => ({
                  value: v,
                  label: `Competência 0${index + 1}: ${v}`,
                })
              )}
            />
          ))}

          <DetailsCard
            title="Nota final"
            content={comp01 + comp02 + comp03 + comp04 + comp05}
            bg_color="#1F1F1F"
            text_size="16px"
          />

          <Button
            text_size="20px"
            text_color="#E0E0E0"
            padding_sz="10px"
            bg_color="#DA9E00"
            isLoading={isLoading}
          >
            <i className="fa-regular fa-circle-check"></i> ENVIAR CORREÇÃO
          </Button>

          <Message
            text={formMessage ? formMessage.text : ""}
            type={formMessage ? formMessage.type : ""}
          />
        </form>
      </div>
    </div>
  );
};

export default GerenciarNotas;
