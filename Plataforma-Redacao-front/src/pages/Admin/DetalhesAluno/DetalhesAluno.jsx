import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import Input from "../../../components/Input/Input"
import Button from "../../../components/Button/Button"
import Message from "../../../components/Message/Message"
import InputSelect from "../../../components/InputSelect/InputSelect"
import DetailsCard from "../../../components/DetailsCard/DetailsCard"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import fetchData from "../../../utils/fetchData"
import useUseful from "../../../utils/useUseful"
import GraficoNotas from "../../../components/GraficoLinha/GraficoLinha"
import RedacoesTabela from "../../../components/RedacoesTabela/RedacoesTabela"
import Loading from "../../../components/Loading/Loading"
import DeleteModal from "../../../components/DeleteModal/DeleteModal"
import CorrecaoModal from "../../../components/CorrecaoModal/CorrecaoModal"
import { jsPDF } from "jspdf"
import defaultProfilePicture from '../../../images/Defalult_profile_picture.jpg'

const baseURL = import.meta.env.VITE_API_BASE_URL

const DetalhesAluno = () => {
  const { aluno_id } = useParams()
  const [alunoData, setAlunoData] = useState(null)
  const [redacoes, setRedacoes] = useState([])
  const [notasRedacoes, setNotasRedacoes] = useState([])
  const [formMessage, setFormMessage] = useState(null)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [tipoUsuario, setTipoUsuario] = useState("")
  const [turma, setTurma] = useState("")
  const [turmas, setTurmas] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isLoadingReset, setIsLoadingReset] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalIsClicked, setModalIsClicked] = useState(false)
  const [modalRedacaoIsClicked, setModalRedacaoIsClicked] = useState(false)
  const [modalData, setModalData] = useState({})
  const [downloadingHistorico, setDownloadingHistorico] = useState(false)

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("cadastrais")

  // ── Matrícula state ────────────────────────────────────────────────────────
  const [matriculaData, setMatriculaData] = useState(null)
  const [isLoadingMatricula, setIsLoadingMatricula] = useState(false)
  const [matriculaMessage, setMatriculaMessage] = useState(null)
  const [isSavingMatricula, setIsSavingMatricula] = useState(false)
  const [cpf, setCpf] = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [genero, setGenero] = useState("")
  const [telefone, setTelefone] = useState("")
  const [endereco, setEndereco] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [nomeResponsavel, setNomeResponsavel] = useState("")
  const [vinculoResponsavel, setVinculoResponsavel] = useState("")
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [comoConheceu, setComoConheceu] = useState("")
  const [observacoes, setObservacoes] = useState("")

  const { brasilFormatData, avgNotes, getHeaders } = useUseful()
  const navigate = useNavigate()

  // ── Masks ──────────────────────────────────────────────────────────────────
  const maskCpf = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }

  const maskPhone = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 11)
    if (d.length <= 2) return d.length ? `(${d}` : ""
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }

  // ── Download Histórico ─────────────────────────────────────────────────────
  const handleDownloadHistorico = async () => {
    if (!alunoData) return
    setDownloadingHistorico(true)
    try {
      const { getNotasByUsuarioId, getRedacoesUser, getFrequencias } = fetchData()

      const notasResponse = await getNotasByUsuarioId(aluno_id)
      const notasSimulados = notasResponse || []

      const redacoesResponse = await getRedacoesUser(aluno_id)
      const redacoesCorrigidas = (redacoesResponse || []).filter(r => r.nota !== undefined && r.nota !== null)

      const frequenciasResponse = await getFrequencias()
      const frequenciasAluno = (frequenciasResponse || []).filter(f => String(f.usuarioId) === String(aluno_id))

      const somaNotas = notasSimulados.reduce((acc, curr) => acc + (Number(curr.nota) || 0), 0)
        + redacoesCorrigidas.reduce((acc, curr) => acc + (Number(curr.nota) || 0), 0)
      const qtdNotas = notasSimulados.length + redacoesCorrigidas.length
      const mediaGeral = qtdNotas > 0 ? (somaNotas / qtdNotas).toFixed(2) : "Sem notas"

      const totalAulas = frequenciasAluno.length
      const presencas = frequenciasAluno.filter(f => f.status === "PRESENTE" || f.status === "JUSTIFICADO").length
      const faltas = frequenciasAluno.filter(f => f.status === "FALTOU").length
      const percentualFrequencia = totalAulas > 0 ? ((presencas / totalAulas) * 100).toFixed(1) + "%" : "Sem registros"

      const doc = new jsPDF()
      doc.setFont("helvetica")

      doc.setFontSize(22)
      doc.setTextColor(33, 33, 33)
      doc.text("Historico Escolar Simplificado", 105, 20, { align: "center" })

      doc.setDrawColor(200, 200, 200)
      doc.line(20, 25, 190, 25)

      doc.setFontSize(14)
      doc.setTextColor(50, 50, 50)
      doc.text("Dados Pessoais", 20, 40)

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Nome: ${alunoData.nome}`, 20, 50)
      doc.text(`E-mail: ${alunoData.email}`, 20, 58)
      doc.text(`Turma: ${alunoData.turma?.nome || 'Nao definida'}`, 20, 66)
      doc.text(`Data de Matricula: ${brasilFormatData(alunoData.dataCriacao)}`, 20, 74)

      doc.setFontSize(14)
      doc.setTextColor(50, 50, 50)
      doc.text("Desempenho Academico", 20, 90)

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Simulados Realizados: ${notasSimulados.length}`, 20, 100)
      doc.text(`Redacoes Corrigidas: ${redacoesCorrigidas.length}`, 20, 108)
      doc.text(`Media Geral: ${mediaGeral}`, 20, 116)

      doc.setFontSize(14)
      doc.setTextColor(50, 50, 50)
      doc.text("Controle de Frequencia", 20, 132)

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Total de Aulas Registradas: ${totalAulas}`, 20, 142)
      doc.text(`Presencas (inclui Justificadas): ${presencas}`, 20, 150)
      doc.text(`Faltas: ${faltas}`, 20, 158)
      doc.text(`Percentual de Frequencia: ${percentualFrequencia}`, 20, 166)

      doc.setFontSize(10)
      doc.setTextColor(150, 150, 150)
      const dataEmissao = new Date().toLocaleDateString('pt-BR')
      doc.text(`Documento emitido em: ${dataEmissao}`, 105, 280, { align: "center" })

      doc.save(`Historico_${alunoData.nome.replace(/\s+/g, '_')}.pdf`)
    } catch (error) {
      console.error("Erro ao gerar historico:", error)
      alert("Ocorreu um erro ao gerar o historico do aluno.")
    } finally {
      setDownloadingHistorico(false)
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.put(
        `${baseURL}/usuarios/${aluno_id}`,
        {
          nome,
          email,
          tipoUsuario,
          turmaId: turma
        },
        { headers: getHeaders() }
      );

      setFormMessage({
        type: "success",
        text: `Usuário(a) ${response.data.data.nome} atualizado(a) com sucesso.`
      });
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao atualizar os dados do aluno."
      });
    } finally {
      setIsLoading(false)
    }
  };

  const handleSaveMatricula = async (e) => {
    e.preventDefault()
    setIsSavingMatricula(true)
    setMatriculaMessage(null)

    try {
      const response = await axios.put(
        `${baseURL}/matriculas/usuario/${aluno_id}`,
        {
          cpf,
          dataNascimento: dataNascimento || null,
          genero: genero || null,
          telefone,
          endereco: endereco || null,
          bairro: bairro || null,
          cidade: cidade || null,
          nomeResponsavel: nomeResponsavel || null,
          vinculoResponsavel: vinculoResponsavel || null,
          telefoneResponsavel: telefoneResponsavel || null,
          dataInicio,
          comoConheceu: comoConheceu || null,
          observacoes: observacoes || null
        },
        { headers: getHeaders() }
      )

      setMatriculaData(response.data.data)
      setMatriculaMessage({ type: "success", text: "Matrícula salva com sucesso." })
    } catch (error) {
      setMatriculaMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao salvar matrícula."
      })
    } finally {
      setIsSavingMatricula(false)
    }
  }

  const resetPassword = async () => {
    setIsLoadingReset(true)
    try {
      await axios.patch(`${baseURL}/usuarios/${aluno_id}/resetar-senha`, {}, { headers: getHeaders() })
      setFormMessage({
        type: "success",
        text: "Senha resetada com sucesso!"
      });
    } catch (error) {
      setFormMessage({
        type: "error",
        text: error.response?.data?.error || "Erro ao resetar a senha."
      });
    } finally {
      setIsLoadingReset(false)
    }
  }

  const deleteAluno = async () => {
    await axios.delete(`${baseURL}/usuarios/${aluno_id}`, { headers: getHeaders() })
    navigate("/admin/gerenciar-alunos")
  };

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    const getData = async () => {
      setIsLoadingData(true)

      try {
        const { getTurmas, getAlunoById } = fetchData()
        const turmasResponse = await getTurmas();
        const alunoResponse = await getAlunoById(aluno_id)

        const options = turmasResponse.map(item => ({
          value: item.id,
          label: item.nome
        }));

        setTurmas(options);
        setAlunoData(alunoResponse)
      } catch (error) {
        console.error("Erro ao carregar dados do aluno:", error)
      } finally {
        setIsLoadingData(false)
      }
    }

    if (aluno_id) {
      getData()
    }
  }, [aluno_id])

  useEffect(() => {
    const getData = async () => {
      try {
        const { getRedacoes } = fetchData();
        const response = await getRedacoes(aluno_id, true);

        const notas = response.map(item => (
          { data: item.correcao.data, nota: item.correcao.nota }
        ));

        setRedacoes(response);
        setNotasRedacoes(notas);
      } catch (err) {
        console.error("Erro ao buscar redações do aluno:", err)
      }
    }

    if (aluno_id) {
      getData()
    }
  }, [aluno_id])

  // ── Fetch matrícula data ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchMatricula = async () => {
      setIsLoadingMatricula(true)
      try {
        const { getMatriculaByUsuarioId } = fetchData()
        const data = await getMatriculaByUsuarioId(aluno_id)
        setMatriculaData(data)
      } catch (err) {
        console.error("Erro ao buscar matrícula:", err)
        setMatriculaData(null)
      } finally {
        setIsLoadingMatricula(false)
      }
    }

    if (aluno_id) {
      fetchMatricula()
    }
  }, [aluno_id])

  // ── Populate cadastro fields ───────────────────────────────────────────────
  useEffect(() => {
    if (alunoData) {
      setNome(alunoData.nome || "");
      setEmail(alunoData.email || "");
      setTipoUsuario(alunoData.tipoUsuario || "");
      setTurma(alunoData.turmaId || "");
    }
  }, [alunoData]);

  // ── Populate matrícula fields ──────────────────────────────────────────────
  useEffect(() => {
    if (matriculaData) {
      setCpf(matriculaData.cpf || "")
      setDataNascimento(matriculaData.dataNascimento || "")
      setGenero(matriculaData.genero || "")
      setTelefone(matriculaData.telefone || "")
      setEndereco(matriculaData.endereco || "")
      setBairro(matriculaData.bairro || "")
      setCidade(matriculaData.cidade || "")
      setNomeResponsavel(matriculaData.nomeResponsavel || "")
      setVinculoResponsavel(matriculaData.vinculoResponsavel || "")
      setTelefoneResponsavel(matriculaData.telefoneResponsavel || "")
      setDataInicio(matriculaData.dataInicio || "")
      setComoConheceu(matriculaData.comoConheceu || "")
      setObservacoes(matriculaData.observacoes || "")
    }
  }, [matriculaData])

  return (
    <div className={styles.container}>
      <CorrecaoModal
        modalData={modalData}
        modalIsClicked={modalRedacaoIsClicked}
        setModalIsClicked={setModalRedacaoIsClicked}
      />

      <DeleteModal
        message="Você tem certeza que deseja excluir esse(a) aluno(a)?"
        modalIsClicked={modalIsClicked}
        deleteOnClick={() => {
          deleteAluno(aluno_id)
          setModalIsClicked(false)
        }}
        cancelOnClick={() => setModalIsClicked(false)}
      />

      <Title title={`Gerenciar alunos - ${alunoData && alunoData.nome ? alunoData.nome : ""}`} />

      <div className={styles.main_content}>
        <div className={styles.bg_left}>
          {isLoadingData ? (
            <div className={styles.loading}><Loading /></div>
          ) : (
            <>
              {/* Student Header */}
              <div className={styles.student_header}>
                <div className={styles.student_avatar}>
                  <img
                    src={alunoData?.caminho ? `${baseURL}/usuarios/${alunoData.id}/profile-image` : defaultProfilePicture}
                    alt={alunoData?.nome}
                    onError={(e) => { e.target.src = defaultProfilePicture }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                </div>
                <div className={styles.student_name_block}>
                  <h2 className={styles.student_name}>{alunoData?.nome}</h2>
                  <span className={styles.student_email}>{alunoData?.email}</span>
                </div>
              </div>

              <div className={styles.info_grid}>
                <div className={styles.info_card}>
                  <span className={styles.info_label}>Matrícula</span>
                  <span className={styles.info_value}>{brasilFormatData(alunoData?.dataCriacao)}</span>
                </div>
                <div className={styles.info_card}>
                  <span className={styles.info_label}>Tipo</span>
                  <span className={styles.info_value}>
                    <span className={`${styles.badge} ${alunoData?.tipoUsuario === 'ADMIN' ? styles.badge_admin : styles.badge_standard}`}>
                      {alunoData?.tipoUsuario}
                    </span>
                  </span>
                </div>
                <div className={styles.info_card}>
                  <span className={styles.info_label}>Turma</span>
                  <span className={styles.info_value}>{alunoData?.turma?.nome || '—'}</span>
                </div>
                <div className={styles.info_card}>
                  <span className={styles.info_label}>Média</span>
                  <span className={`${styles.info_value} ${styles.info_highlight}`}>
                    {notasRedacoes?.length === 0 ? '0.00' : avgNotes(notasRedacoes).toFixed(2)}
                  </span>
                </div>
              </div>

              <RedacoesTabela
                redacoes={redacoes}
                onClick={() => {
                  setModalRedacaoIsClicked(true)
                }}
                setModalData={setModalData}
              />

              <GraficoNotas array={notasRedacoes} height_size="300px" />

              <div className={styles.danger_zone}>
                <Button
                  text_size="14px"
                  text_color="#111"
                  padding_sz="10px"
                  bg_color="#DA9E00"
                  isLoading={downloadingHistorico}
                  onClick={handleDownloadHistorico}
                >
                  <i className="fa-solid fa-file-pdf"></i> {downloadingHistorico ? "GERANDO..." : "BAIXAR HISTÓRICO"}
                </Button>
                <Button
                  text_size="14px"
                  text_color="#E0E0E0"
                  padding_sz="10px"
                  bg_color="#B2433F"
                  onClick={() => {
                    setModalIsClicked(true)
                  }}
                >
                  <i className="fa-solid fa-trash"></i> EXCLUIR ALUNO
                </Button>
              </div>
            </>
          )}
        </div>

        <div className={styles.bg_right}>
          {/* ── TABS ─────────────────────────────────────────────────── */}
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "cadastrais" ? styles.tab_active : ""}`}
              onClick={() => setActiveTab("cadastrais")}
            >
              <i className="fa-solid fa-user-pen" /> Dados Cadastrais
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "matricula" ? styles.tab_active : ""}`}
              onClick={() => setActiveTab("matricula")}
            >
              <i className="fa-solid fa-graduation-cap" /> Matrícula
            </button>
          </div>

          {/* ── TAB: Dados Cadastrais ─────────────────────────────────── */}
          {activeTab === "cadastrais" && (
            <>
              <form onSubmit={handleSubmit}>
                <Input
                  type="text"
                  placeholder="Nome"
                  color="#1A1A1A"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                >
                  <i className="fa-solid fa-user"></i>
                </Input>

                <Input
                  type="email"
                  placeholder="Email"
                  color="#1A1A1A"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                >
                  <i className="fa-solid fa-envelope"></i>
                </Input>

                <InputSelect
                  color="#1A1A1A"
                  text="Selecione o tipo de usuário"
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                  options={[
                    { value: "STANDARD", label: "STANDARD" },
                    { value: "ADMIN", label: "ADMIN" }
                  ]}
                />

                <InputSelect
                  color="#1A1A1A"
                  text="Selecione a turma"
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  options={turmas}
                />

                <Message
                  text={formMessage ? formMessage.text : ""}
                  type={formMessage ? formMessage.type : ""}
                />

                <Button
                  text_size="20px"
                  text_color="#E0E0E0"
                  padding_sz="10px"
                  bg_color="#DA9E00"
                  isLoading={isLoading}
                >
                  ATUALIZAR
                </Button>
              </form>

              <Button
                text_size="20px"
                text_color="#E0E0E0"
                padding_sz="10px"
                bg_color="#B2433F"
                isLoading={isLoadingReset}
                onClick={resetPassword}
              >
                RESETAR SENHA
              </Button>
            </>
          )}

          {/* ── TAB: Matrícula ────────────────────────────────────────── */}
          {activeTab === "matricula" && (
            <>
              {isLoadingMatricula ? (
                <div className={styles.matricula_loading}><Loading /></div>
              ) : (
                <>
                  {!matriculaData && (
                    <div className={styles.matricula_empty} style={{ minHeight: "auto", paddingBottom: "20px" }}>
                      <i className="fa-solid fa-circle-info" />
                      <p style={{ maxWidth: "100%" }}>Este aluno ainda não possui matrícula cadastrada. Preencha os campos abaixo para cadastrá-la.</p>
                    </div>
                  )}
                  <form onSubmit={handleSaveMatricula} className={styles.matricula_form}>
                    {/* DADOS PESSOAIS */}
                    <div className={styles.section_header}>
                      <i className="fa-solid fa-user" />
                      <span>DADOS PESSOAIS</span>
                    </div>

                    <div className={styles.field_row}>
                      <div className={styles.field_group}>
                        <label className={styles.label}>CPF <span className={styles.required}>*</span></label>
                        <input
                          type="text"
                          className={styles.field_input}
                          placeholder="123.456.789-00"
                          value={cpf}
                          onChange={(e) => setCpf(maskCpf(e.target.value))}
                        />
                      </div>
                      <div className={styles.field_group}>
                        <label className={styles.label}>Data de Nascimento</label>
                        <input
                          type="date"
                          className={styles.field_input}
                          value={dataNascimento}
                          onChange={(e) => setDataNascimento(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.field_group}>
                      <label className={styles.label}>Gênero</label>
                      <select
                        className={styles.field_input}
                        value={genero}
                        onChange={(e) => setGenero(e.target.value)}
                      >
                        <option value="">Selecione o gênero</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                      </select>
                    </div>

                    {/* CONTATO */}
                    <div className={styles.section_header}>
                      <i className="fa-solid fa-address-book" />
                      <span>CONTATO</span>
                    </div>

                    <div className={styles.field_group}>
                      <label className={styles.label}>Telefone <span className={styles.required}>*</span></label>
                      <input
                        type="text"
                        className={styles.field_input}
                        placeholder="(91) 98765-4321"
                        value={telefone}
                        onChange={(e) => setTelefone(maskPhone(e.target.value))}
                      />
                    </div>

                    <div className={styles.field_group}>
                      <label className={styles.label}>Endereço</label>
                      <input
                        type="text"
                        className={styles.field_input}
                        placeholder="Rua, número, apto"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                      />
                    </div>

                    <div className={styles.field_row}>
                      <div className={styles.field_group}>
                        <label className={styles.label}>Bairro</label>
                        <input
                          type="text"
                          className={styles.field_input}
                          placeholder="Bairro"
                          value={bairro}
                          onChange={(e) => setBairro(e.target.value)}
                        />
                      </div>
                      <div className={styles.field_group}>
                        <label className={styles.label}>Cidade</label>
                        <input
                          type="text"
                          className={styles.field_input}
                          placeholder="Cidade"
                          value={cidade}
                          onChange={(e) => setCidade(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* DADOS DO RESPONSÁVEL */}
                    <div className={styles.section_header}>
                      <i className="fa-solid fa-user-shield" />
                      <span>DADOS DO RESPONSÁVEL</span>
                    </div>

                    <div className={styles.field_group}>
                      <label className={styles.label}>Nome do Responsável</label>
                      <input
                        type="text"
                        className={styles.field_input}
                        placeholder="Nome do responsável"
                        value={nomeResponsavel}
                        onChange={(e) => setNomeResponsavel(e.target.value)}
                      />
                    </div>

                    <div className={styles.field_row}>
                      <div className={styles.field_group}>
                        <label className={styles.label}>Vínculo</label>
                        <select
                          className={styles.field_input}
                          value={vinculoResponsavel}
                          onChange={(e) => setVinculoResponsavel(e.target.value)}
                        >
                          <option value="">Selecione o vínculo</option>
                          <option value="Pai">Pai</option>
                          <option value="Mãe">Mãe</option>
                          <option value="Responsável legal">Responsável legal</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div className={styles.field_group}>
                        <label className={styles.label}>Telefone do Responsável</label>
                        <input
                          type="text"
                          className={styles.field_input}
                          placeholder="(91) 98765-4321"
                          value={telefoneResponsavel}
                          onChange={(e) => setTelefoneResponsavel(maskPhone(e.target.value))}
                        />
                      </div>
                    </div>

                    {/* ACADÊMICO */}
                    <div className={styles.section_header}>
                      <i className="fa-solid fa-graduation-cap" />
                      <span>ACADÊMICO</span>
                    </div>

                    <div className={styles.field_row}>
                      <div className={styles.field_group}>
                        <label className={styles.label}>Data de Início <span className={styles.required}>*</span></label>
                        <input
                          type="date"
                          className={styles.field_input}
                          value={dataInicio}
                          onChange={(e) => setDataInicio(e.target.value)}
                        />
                      </div>
                      <div className={styles.field_group}>
                        <label className={styles.label}>Como conheceu</label>
                        <select
                          className={styles.field_input}
                          value={comoConheceu}
                          onChange={(e) => setComoConheceu(e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="Indicação de amigo">Indicação de amigo</option>
                          <option value="Redes sociais">Redes sociais</option>
                          <option value="Google">Google</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.field_group}>
                      <label className={styles.label}>Observações</label>
                      <textarea
                        className={styles.field_textarea}
                        placeholder="Observações adicionais..."
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Message
                      text={matriculaMessage ? matriculaMessage.text : ""}
                      type={matriculaMessage ? matriculaMessage.type : ""}
                    />

                    <Button
                      text_size="18px"
                      text_color="#E0E0E0"
                      padding_sz="10px"
                      bg_color="#DA9E00"
                      isLoading={isSavingMatricula}
                    >
                      <i className="fa-solid fa-floppy-disk" /> {matriculaData ? "SALVAR MATRÍCULA" : "CADASTRAR MATRÍCULA"}
                    </Button>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetalhesAluno
