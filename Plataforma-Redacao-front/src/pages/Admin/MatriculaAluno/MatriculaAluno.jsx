import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import { gerarMatriculaPdf } from "../../../components/MatriculaPdf/MatriculaPdf"
import fetchData from "../../../utils/fetchData"

const MatriculaAluno = () => {
  const navigate = useNavigate()

  const [nomeCompleto, setNomeCompleto]     = useState("")
  const [dataNascimento, setDataNascimento] = useState("")
  const [cpf, setCpf]                       = useState("")
  const [genero, setGenero]                 = useState("")

  const [email, setEmail]       = useState("")
  const [telefone, setTelefone] = useState("")
  const [endereco, setEndereco] = useState("")
  const [bairro, setBairro]     = useState("")
  const [cidade, setCidade]     = useState("")

  const [nomeResponsavel,     setNomeResponsavel]     = useState("")
  const [vinculoResponsavel,  setVinculoResponsavel]  = useState("")
  const [telefoneResponsavel, setTelefoneResponsavel] = useState("")

  const [turma,       setTurma]       = useState("")
  const [dataInicio,  setDataInicio]  = useState("")
  const [comoConheceu, setComoConheceu] = useState("")
  const [condicaoMedica,  setCondicaoMedica]  = useState("")
  const [deficiencia, setDeficiencia] = useState("")
  const [necessidadeEducacional, setNecessidadeEducacional] = useState("")
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([])

  useEffect(() => {
    const carregarTurmas = async () => {
      try {
        const { getTurmas } = fetchData()
        const res = await getTurmas()
        setTurmasDisponiveis(res || [])
      } catch (error) {
        console.error("Erro ao buscar turmas:", error)
      }
    }
    carregarTurmas()
  }, [])

  const [charCount,        setCharCount]        = useState(0)
  const [showModal,        setShowModal]        = useState(false)
  const [isSubmitting,     setIsSubmitting]     = useState(false)
  const [isGeneratingPdf,  setIsGeneratingPdf]  = useState(false)
  const [submitted,        setSubmitted]        = useState(false)
  const [submitError,      setSubmitError]      = useState(null)

  const maskCpf = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 11)
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  const maskTelefone = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 11)
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShowModal(true)
  }

  const handleConfirmar = async () => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const { createMatricula } = fetchData()
      await createMatricula({
        // ─ dados do usuário ─
        nome:    nomeCompleto,
        email,
        turmaId: turma,
        // ─ dados pessoais ─
        cpf,
        dataNascimento: dataNascimento || null,
        genero:         genero         || null,
        // ─ contato ─
        telefone,
        endereco: endereco || null,
        bairro:   bairro   || null,
        cidade:   cidade   || null,
        // ─ responsável ─
        nomeResponsavel:     nomeResponsavel     || null,
        vinculoResponsavel:  vinculoResponsavel  || null,
        telefoneResponsavel: telefoneResponsavel || null,
        // ─ acadêmico ─
        dataInicio,
        comoConheceu: comoConheceu || null,
        condicaoMedica:  condicaoMedica  || null,
        deficiencia: deficiencia || null,
        necessidadeEducacional: necessidadeEducacional || null
      })
      setSubmitted(true)
    } catch (error) {
      const msg = error?.response?.data?.error
        || error?.response?.data?.message
        || "Erro ao realizar matrícula. Tente novamente."
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGerarPdf = async () => {
    setIsGeneratingPdf(true)
    try {
      await gerarMatriculaPdf(
        {
          nomeCompleto,
          dataNascimento,
          cpf,
          genero,
          email,
          telefone,
          endereco,
          bairro,
          cidade,
          nomeResponsavel,
          vinculoResponsavel,
          telefoneResponsavel,
          turma: turmasDisponiveis.find(t => t.id === turma)?.nome || turma,
          dataInicio,
          comoConheceu,
          condicaoMedica,
          deficiencia,
          necessidadeEducacional,
        },
        `matricula-${nomeCompleto.replace(/\s+/g, "-").toLowerCase()}`
      )
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleClear = () => {
    setNomeCompleto(""); setDataNascimento(""); setCpf(""); setGenero("")
    setEmail(""); setTelefone(""); setEndereco(""); setBairro(""); setCidade("")
    setNomeResponsavel(""); setVinculoResponsavel(""); setTelefoneResponsavel("")
    setTurma(""); setDataInicio(""); setComoConheceu(""); setCondicaoMedica("")
    setDeficiencia(""); setNecessidadeEducacional("")
    setCharCount(0); setShowModal(false); setSubmitted(false)
  }

  const obterNomeTurma = (id) => {
    const t = turmasDisponiveis.find(t => t.id === id)
    return t ? t.nome : id
  }

  const fmt = (v) => v || "—"
  const fmtDate = (v) =>
    v ? new Date(v + "T00:00:00").toLocaleDateString("pt-BR") : "—"

  return (
    <div className={styles.container}>
      <Title title="Matrículas" />

      {showModal && (
        <div className={styles.modal_overlay} onClick={() => !isSubmitting && !submitted && setShowModal(false)}>
          <div className={styles.modal_box} onClick={(e) => e.stopPropagation()}>

            {submitted ? (
              <div className={styles.modal_success_state}>
                <div className={styles.modal_success_icon}>
                  <i className="fa-solid fa-circle-check" />
                </div>
                <h2 className={styles.modal_success_title}>Matrícula Realizada!</h2>
                <p className={styles.modal_success_sub}>
                  A matrícula de <strong>{nomeCompleto}</strong> foi registrada com sucesso na plataforma.
                </p>

                <div className={styles.modal_success_actions}>
                  <button
                    className={styles.btn_pdf}
                    onClick={handleGerarPdf}
                    disabled={isGeneratingPdf}
                  >
                    {isGeneratingPdf ? (
                      <><span className={styles.spinner} /> Gerando PDF...</>
                    ) : (
                      <><i className="fa-solid fa-file-pdf" /> Gerar PDF da Matrícula</>
                    )}
                  </button>
                  <button
                    className={styles.btn_nova}
                    onClick={handleClear}
                  >
                    <i className="fa-solid fa-plus" /> Nova matrícula
                  </button>
                </div>
              </div>
            ) : (
       
              <>
                <div className={styles.modal_header}>
                  <div className={styles.modal_header_icon}>
                    <i className="fa-solid fa-clipboard-check" />
                  </div>
                  <div>
                    <h2 className={styles.modal_title}>Confirmar Matrícula</h2>
                    <p className={styles.modal_subtitle}>Revise os dados antes de confirmar</p>
                  </div>
                  <button
                    className={styles.modal_close}
                    onClick={() => setShowModal(false)}
                    aria-label="Fechar"
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>

                <div className={styles.modal_body}>

                  <div className={styles.modal_section}>
                    <h4 className={styles.modal_section_title}>
                      <i className="fa-solid fa-user" /> Dados Pessoais
                    </h4>
                    <div className={styles.modal_grid}>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Nome completo</span>
                        <span className={styles.modal_value}>{fmt(nomeCompleto)}</span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Data de nascimento</span>
                        <span className={styles.modal_value}>{fmtDate(dataNascimento)}</span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>CPF</span>
                        <span className={styles.modal_value}>{fmt(cpf)}</span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Gênero</span>
                        <span className={styles.modal_value}>{fmt(genero)}</span>
                      </div>
                    </div>
                  </div>

                  {/* — Contato — */}
                  <div className={styles.modal_section}>
                    <h4 className={styles.modal_section_title}>
                      <i className="fa-solid fa-address-book" /> Contato
                    </h4>
                    <div className={styles.modal_grid}>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>E-mail</span>
                        <span className={styles.modal_value}>{fmt(email)}</span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Telefone</span>
                        <span className={styles.modal_value}>{fmt(telefone)}</span>
                      </div>
                      <div className={`${styles.modal_field} ${styles.modal_field_full}`}>
                        <span className={styles.modal_label}>Endereço</span>
                        <span className={styles.modal_value}>
                          {[endereco, bairro, cidade].filter(Boolean).join(", ") || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* — Responsável — */}
                  <div className={styles.modal_section}>
                    <h4 className={styles.modal_section_title}>
                      <i className="fa-solid fa-user-shield" /> Responsável
                    </h4>
                    <div className={styles.modal_grid}>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Nome</span>
                        <span className={styles.modal_value}>{fmt(nomeResponsavel)}</span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Vínculo</span>
                        <span className={styles.modal_value}>{fmt(vinculoResponsavel)}</span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Telefone</span>
                        <span className={styles.modal_value}>{fmt(telefoneResponsavel)}</span>
                      </div>
                    </div>
                  </div>

                  {/* — Acadêmico — */}
                  <div className={styles.modal_section}>
                    <h4 className={styles.modal_section_title}>
                      <i className="fa-solid fa-graduation-cap" /> Informações Acadêmicas
                    </h4>
                    <div className={styles.modal_grid}>
                      <div className={`${styles.modal_field} ${styles.modal_field_full}`}>
                        <span className={styles.modal_label}>Turma</span>
                        <span className={`${styles.modal_value} ${styles.modal_value_turma}`}>
                          {obterNomeTurma(turma) || fmt(turma)}
                        </span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Início</span>
                        <span className={styles.modal_value}>{fmtDate(dataInicio)}</span>
                      </div>
                      <div className={styles.modal_field}>
                        <span className={styles.modal_label}>Como conheceu</span>
                        <span className={styles.modal_value}>{fmt(comoConheceu)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.modal_section}>
                    <h4 className={styles.modal_section_title}>
                      <i className="fa-solid fa-notes-medical" /> Formulário de Saúde
                    </h4>
                    <div className={styles.modal_grid}>
                      <div className={`${styles.modal_field} ${styles.modal_field_full}`}>
                        <span className={styles.modal_label}>Deficiência</span>
                        <span className={styles.modal_value}>{fmt(deficiencia)}</span>
                      </div>
                      <div className={`${styles.modal_field} ${styles.modal_field_full}`}>
                        <span className={styles.modal_label}>Necessidade Educacional</span>
                        <span className={styles.modal_value}>{fmt(necessidadeEducacional)}</span>
                      </div>
                    </div>
                  </div>

                  {condicaoMedica && (
                    <div className={styles.modal_obs}>
                      <span className={styles.modal_label}>Alergia ou Condição Médica</span>
                      <p className={styles.modal_obs_text}>{condicaoMedica}</p>
                    </div>
                  )}
                </div>

                <div className={styles.modal_footer}>
                  {submitError && (
                    <div className={styles.modal_error}>
                      <i className="fa-solid fa-triangle-exclamation" />
                      {submitError}
                    </div>
                  )}
                  <div className={styles.modal_footer_actions}>
                    <button
                      className={styles.btn_cancel}
                      onClick={() => { setShowModal(false); setSubmitError(null) }}
                      disabled={isSubmitting}
                    >
                      Revisar dados
                    </button>
                    <button
                      className={styles.btn_confirm}
                      onClick={handleConfirmar}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><span className={styles.spinner} /> Salvando...</>
                      ) : (
                        <><i className="fa-solid fa-check" /> Confirmar matrícula</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.page_wrapper}>
        <div className={styles.page_header}>
          <div className={styles.page_header_left}>
            <h2 className={styles.page_title}>
              <span className={styles.page_title_accent}>NOVA</span> MATRÍCULA
            </h2>
            <p className={styles.page_subtitle}>
              Preencha os dados do aluno para registrar a matrícula na plataforma.
            </p>
          </div>
          <div className={styles.page_header_stats}>
            <div className={styles.stat_badge}>
              <i className="fa-solid fa-graduation-cap" />
              <span>Campos com <strong>*</strong> são obrigatórios</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className={styles.form_card}>
          <div className={styles.form_grid}>
            <div className={styles.col_left}>

              {/* DADOS PESSOAIS */}
              <section className={styles.form_section}>
                <h3 className={styles.section_title}>
                  <i className="fa-solid fa-user" />
                  DADOS PESSOAIS DO ALUNO
                </h3>

                <div className={styles.row_2}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>
                      Nome completo <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="João Pedro da Silva"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field_group}>
                    <label className={styles.label}>
                      Data de nascimento <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.row_2}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>
                      CPF <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.input_validated}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="123.456.789-09"
                        value={cpf}
                        onChange={(e) => setCpf(maskCpf(e.target.value))}
                        required
                      />
                      {cpf.length === 14 && (
                        <i className={`fa-solid fa-circle-check ${styles.valid_icon}`} />
                      )}
                    </div>
                  </div>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Gênero</label>
                    <select
                      className={styles.select}
                      value={genero}
                      onChange={(e) => setGenero(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Não-binário">Não-binário</option>
                      <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className={styles.form_section}>
                <h3 className={styles.section_title}>
                  <i className="fa-solid fa-address-book" />
                  CONTATO
                </h3>

                <div className={styles.row_2}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>
                      E-mail <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.input_validated}>
                      <input
                        className={styles.input}
                        type="email"
                        placeholder="joaopedro.silva@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {email.includes("@") && email.includes(".") && (
                        <i className={`fa-solid fa-circle-check ${styles.valid_icon}`} />
                      )}
                    </div>
                  </div>
                  <div className={styles.field_group}>
                    <label className={styles.label}>
                      Telefone <span className={styles.required}>*</span>
                    </label>
                    <div className={styles.input_validated}>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="(91) 98765-4321"
                        value={telefone}
                        onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                        required
                      />
                      {telefone.replace(/\D/g, "").length >= 10 && (
                        <i className={`fa-solid fa-circle-check ${styles.valid_icon}`} />
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.row_1}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Endereço</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Tv. Quintino Bocaiúva, 1234"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.row_2}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Bairro</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Nazaré"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                  </div>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Cidade</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Belém"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className={styles.form_section}>
                <h3 className={styles.section_title}>
                  <i className="fa-solid fa-user-shield" />
                  DADOS DO RESPONSÁVEL
                </h3>

                <div className={styles.row_1}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Nome do responsável</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Ana Paula Santos"
                      value={nomeResponsavel}
                      onChange={(e) => setNomeResponsavel(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.row_2}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Vínculo</label>
                    <select
                      className={styles.select}
                      value={vinculoResponsavel}
                      onChange={(e) => setVinculoResponsavel(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="Mãe">Mãe</option>
                      <option value="Pai">Pai</option>
                      <option value="Avô/Avó">Avô/Avó</option>
                      <option value="Tio/Tia">Tio/Tia</option>
                      <option value="Responsável legal">Responsável legal</option>
                      <option value="Próprio aluno">Próprio aluno</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Telefone do responsável</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="(91) 98765-4321"
                      value={telefoneResponsavel}
                      onChange={(e) => setTelefoneResponsavel(maskTelefone(e.target.value))}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ── COLUNA DIREITA ── */}
            <div className={styles.col_right}>

              {/* INFORMAÇÕES ACADÊMICAS */}
              <section className={styles.form_section}>
                <h3 className={styles.section_title}>
                  <i className="fa-solid fa-graduation-cap" />
                  INFORMAÇÕES ACADÊMICAS
                </h3>

                <div className={styles.row_turma}>
                  <div className={`${styles.field_group} ${styles.field_grow}`}>
                    <label className={styles.label}>
                      Turma <span className={styles.required}>*</span>
                    </label>
                    <select
                      className={styles.select}
                      value={turma}
                      onChange={(e) => setTurma(e.target.value)}
                      required
                    >
                      <option value="">Selecione a turma</option>
                      {turmasDisponiveis.map((t) => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </div>
                  {turma && (
                    <button
                      type="button"
                      className={styles.btn_ver_turma}
                      onClick={() => navigate("/admin/gerenciar-turmas")}
                    >
                      Ver turma <i className="fa-solid fa-eye" />
                    </button>
                  )}
                </div>

                <div className={styles.row_1}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>
                      Data de início <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </section>

              
              <section className={styles.form_section}>
                <h3 className={styles.section_title}>
                  <i className="fa-solid fa-notes-medical" />
                  FORMULÁRIO DE SAÚDE E ADICIONAIS
                </h3>

                <div className={styles.row_1}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Possui algum tipo de deficiência:</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Ex: Visual, Auditiva, Motora, etc. (se houver)"
                      value={deficiencia}
                      onChange={(e) => setDeficiencia(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.row_1}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Possui algum tipo de necessidade de atendimento educacional:</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Ex: TDAH, Autismo, Dislexia, etc. (se houver)"
                      value={necessidadeEducacional}
                      onChange={(e) => setNecessidadeEducacional(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.row_1}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Alguma alergia ou condição médica (opcional)</label>
                    <div className={styles.textarea_wrap}>
                      <textarea
                        className={styles.textarea}
                        placeholder="Ex: Alergia a amendoim, asma, etc."
                        maxLength={200}
                        rows={3}
                        value={condicaoMedica}
                        onChange={(e) => {
                          setCondicaoMedica(e.target.value)
                          setCharCount(e.target.value.length)
                        }}
                      />
                      <span className={styles.char_count}>{charCount}/200</span>
                    </div>
                  </div>
                </div>

                <div className={styles.row_1}>
                  <div className={styles.field_group}>
                    <label className={styles.label}>Como conheceu a Redação Elite?</label>
                    <select
                      className={styles.select}
                      value={comoConheceu}
                      onChange={(e) => setComoConheceu(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="Indicação de amigo">Indicação de amigo</option>
                      <option value="Redes sociais">Redes sociais</option>
                      <option value="Google">Google</option>
                      <option value="Escola">Escola</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              </section>

              <div className={styles.info_card}>
                <div className={styles.info_card_icon}>
                  <i className="fa-solid fa-lightbulb" />
                </div>
                <div className={styles.info_card_text}>
                  <strong>Ao confirmar a matrícula</strong>, um modal de revisão será exibido com todos os dados preenchidos. Após confirmar, você poderá gerar o <span>PDF oficial da matrícula</span> com o layout da Redação Elite.
                </div>
              </div>
            </div>
          </div>

          <div className={styles.form_footer}>
            <button
              type="button"
              className={styles.btn_clear}
              onClick={handleClear}
            >
              <i className="fa-solid fa-rotate-left" />
              Limpar formulário
            </button>

            <button
              type="submit"
              className={styles.btn_submit}
            >
              <i className="fa-solid fa-user-plus" />
              Realizar matrícula
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default MatriculaAluno