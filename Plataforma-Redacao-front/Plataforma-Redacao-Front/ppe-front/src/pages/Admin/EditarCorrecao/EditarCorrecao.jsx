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
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";
import { PDFDocument } from "pdf-lib";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const CorrigirRedacao = () => {
  const { redacao_id } = useParams();
  const [redacao, setRedacao] = useState([]);
  const { brasilFormatData, getHeaders } = useUseful();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  const [fileBlob, setFileBlob] = useState(null);
  const [fileName, setFilesName] = useState("Nenhum arquivo enviado");
  const [comp01, setComp01] = useState("");
  const [comp02, setComp02] = useState("");
  const [comp03, setComp03] = useState("");
  const [comp04, setComp04] = useState("");
  const [comp05, setComp05] = useState("");
  const [feedback, setFeedback] = useState("");

  const getData = async () => {
    const { getRedacaoById } = fetchData();
    const response = await getRedacaoById(redacao_id);
    setRedacao(response);
  };

  useEffect(() => {
    setIsLoadingData(true);
    getData()
      .catch((error) => console.error("Erro ao buscar os dados:", error))
      .finally(() => setIsLoadingData(false));
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

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    handleFileUpload(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!fileBlob) {
      setFormMessage({
        type: "error",
        text: "Nenhum arquivo válido selecionado.",
      });
      setIsLoading(false);
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (fileBlob.size > MAX_FILE_SIZE) {
      setFormMessage({
        type: "error",
        text: "O arquivo é muito grande. O tamanho máximo permitido é 10MB.",
      });
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append(
      "file",
      fileBlob,
      fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`
    );
    formData.append("competencia01", comp01);
    formData.append("competencia02", comp02);
    formData.append("competencia03", comp03);
    formData.append("competencia04", comp04);
    formData.append("competencia05", comp05);
    formData.append("feedback", feedback);
    formData.append("redacaoId", redacao_id);

    try {
      await axios.post(
        `${baseURL}/correcoes/${redacao.usuario.id}/upload`,
        formData,
        { headers: getHeaders() }
      );

      setFormMessage({
        type: "success",
        text: "Redação corrigida com sucesso.",
      });
    } catch (error) {
      console.error(error);
      setFormMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao enviar a correção.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Title title="Correção" />
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

              <Link to={`${baseURL}/redacoes/download/${redacao_id}`}>
                <Button
                  text_size="20px"
                  text_color="#E0E0E0"
                  padding_sz="10px"
                  bg_color="#DA9E00"
                >
                  <i className="fa-solid fa-download"></i> BAIXAR ESSA REDAÇÃO
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
              options={[0,20,40,60,80,100,120,140,160,180,200].map((v) => ({
                value: v,
                label: `Competência 0${index + 1}: ${v}`,
              }))}
            />
          ))}

          <DetailsCard
            title="Nota final"
            content={comp01 + comp02 + comp03 + comp04 + comp05}
            bg_color="#1F1F1F"
            text_size="16px"
          />

          <div className={styles.feedback}>
            <p className={styles.feedback_text}>Feedback</p>
            <textarea
              className={styles.feedback_input}
              placeholder="Deixe um feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            ></textarea>
          </div>

          <div className={styles.correcao_file_box}>
            <p className={styles.correcao_file_text}>
              Selecione o arquivo da correção
            </p>
            <input
              className={styles.correcao_file}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>

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

export default EditarCorrecao;
