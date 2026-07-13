import React, { useState } from "react";
import styles from "./styles.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import Message from "../../../components/Message/Message";
import Title from "../../../components/Title/Title";
import fetchData from "../../../utils/fetchData";
import folhaRedacaoPdf from "../../../config/Folha Redacao.pdf";

const CadastrarProposta = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const propostaEdit = location.state?.proposta;

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  };

  // States (in a real scenario, these would bind to the API)
  const [tema, setTema] = useState("");
  const [dataInicial, setDataInicial] = useState(formatDateForInput(propostaEdit?.dataInicial) || "");
  const [dataFinal, setDataFinal] = useState(formatDateForInput(propostaEdit?.dataFinal) || "");
  const [fraseTema, setFraseTema] = useState(propostaEdit?.tema || "");
  const [isPublicado, setIsPublicado] = useState(true);
  const [dataPublicacao, setDataPublicacao] = useState("");
  const [novoEixo, setNovoEixo] = useState('');
  const [mostrarInputEixo, setMostrarInputEixo] = useState(false);

  const [formMessage, setFormMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materiais, setMateriais] = useState(() => {
    if (propostaEdit?.materiais && propostaEdit.materiais.length > 0) {
      return propostaEdit.materiais.map(mat => ({
        id: mat.id || Date.now() + Math.random(),
        titulo: mat.nome || '',
        descricao: '',
        tipo: mat.tipo || 'pdf',
        arquivo: null,
        nomeDisplay: mat.caminho || mat.nome || '',
        tamanho: '-',
        isExisting: true
      }));
    }
    return [];
  });
  const [isModalMaterialOpen, setIsModalMaterialOpen] = useState(false);
  const [formMaterial, setFormMaterial] = useState({
    titulo: '',
    descricao: '',
    tipo: 'pdf',
    arquivo: null,
    link: ''
  });

  const { createProposta, updateProposta } = fetchData();

  const handleSave = async () => {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      const eixosSelecionados = eixos.filter(e => e.checked).map(e => e.nome);
      
      const formData = new FormData();
      formData.append('tema', fraseTema);
      formData.append('dataInicial', dataInicial);
      formData.append('dataFinal', dataFinal);
      formData.append('eixos', JSON.stringify(eixosSelecionados));

      const materiaisInfo = [];

      materiais.forEach((mat) => {
        const info = {
          tipo: mat.tipo,
          titulo: mat.titulo,
          descricao: mat.descricao || '',
        };

        if (mat.isExisting) {
          // Material already exists in the backend, keep its path
          info.caminho = mat.nomeDisplay;
        } else if (mat.arquivo) {
          info.caminho = mat.arquivo.name; // temporary reference for backend to match with file.originalname
          formData.append('arquivos', mat.arquivo);
        } else {
          info.caminho = mat.link;
        }

        materiaisInfo.push(info);
      });

      formData.append('materiaisInfo', JSON.stringify(materiaisInfo));

      if (propostaEdit) {
        await updateProposta(propostaEdit.id, formData);
        setFormMessage({
          type: "success",
          text: "Proposta atualizada com sucesso!"
        });
      } else {
        await createProposta(formData);
        setFormMessage({
          type: "success",
          text: "Proposta salva com sucesso!"
        });
      }
      
      setTimeout(() => {
        navigate('/admin/nova-proposta');
      }, 1500);

    } catch (error) {
      console.error(error);
      setFormMessage({
        type: "error",
        text: "Erro ao salvar proposta. Verifique os dados e tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [eixos, setEixos] = useState(() => {
    const defaultEixos = ["Educação", "Saúde", "Direitos Humanos", "Cultura"];
    const editEixos = propostaEdit?.eixos || [];
    
    let initialEixos = defaultEixos.map((nome, index) => ({
      id: index + 1,
      nome,
      checked: editEixos.includes(nome) || (!propostaEdit && (nome === "Educação" || nome === "Saúde"))
    }));

    editEixos.forEach((eixo, idx) => {
      if (!defaultEixos.includes(eixo)) {
        initialEixos.push({ id: 100 + idx, nome: eixo, checked: true });
      }
    });

    return initialEixos;
  });

  const handleAdicionarEixo  = () => {
    if (novoEixo.trim() === '') return;

    setEixos(prev => [
      ...prev,
      { id: Date.now(), nome: novoEixo.trim(), checked: true }
    ])

    setNovoEixo('');
    setMostrarInputEixo(false);

  };

  const handleToggleEixo = (id) => {
    setEixos(prev =>
      prev.map(eixo =>
        eixo.id === id ? { ...eixo, checked: !eixo.checked } : eixo
      )
    );
  };

  const handleAbrirModal = () => {
    setIsModalMaterialOpen(true);
  };

  const handleFecharModal = () => {
    setIsModalMaterialOpen(false);
    setFormMaterial({ titulo: '', descricao: '', tipo: 'pdf', arquivo: null, link: '' });
  };

  const handleSalvarMaterialModal = () => {
    if (!formMaterial.titulo) return;

    const novoMaterial = {
      id: Date.now(),
      titulo: formMaterial.titulo,
      descricao: formMaterial.descricao,
      tipo: formMaterial.tipo,
      arquivo: formMaterial.arquivo,
      nomeDisplay: formMaterial.arquivo ? formMaterial.arquivo.name : formMaterial.link,
      tamanho: formMaterial.arquivo ? (formMaterial.arquivo.size / (1024 * 1024)).toFixed(2) + ' MB' : '-'
    };

    setMateriais((prev) => [...prev, novoMaterial]);
    handleFecharModal();
  };

  // Remove um material da lista
  const handleRemoverMaterial = (id) => {
    setMateriais((prev) => prev.filter(mat => mat.id !== id));
  };


  return (
    <div className={styles.container}>
      <Title title={propostaEdit ? "Editar Proposta" : "Cadastrar Proposta"} />
      {formMessage && (
        <Message text={formMessage.text} type={formMessage.type} />
      )}
      <div className={styles.mainContent}>
        {/* LEFT COLUMN (Flex 3) */}
        <div className={styles.leftColumn}>

          <div className={styles.formContainer}>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Salvar tema
                </>
              )}
            </button>
            <div className={styles.grid2Col}>
              {/* 1. INFORMAÇÕES PRINCIPAIS */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <i className={`fa-regular fa-file-lines ${styles.sectionIcon}`}></i>
                  <h3 className={styles.sectionTitle}>1. INFORMAÇÕES PRINCIPAIS</h3>
                </div>

                <div className={styles.sectionBody}>


                  <div className={styles.rowInputs}>
                    <div className={styles.inputGroup} style={{ flex: 2 }}>
                      <label className={styles.label}>Período de Disponibilidade <span className={styles.required}>*</span></label>
                      <div className={styles.dateGroup}>
                        <i className="fa-regular fa-calendar" style={{ color: '#a0a0a0' }}></i>
                        <input type="date" className={styles.dateInput} value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} />
                        <span className={styles.dateSeparator}>até</span>
                        <i className="fa-regular fa-calendar" style={{ color: '#a0a0a0' }}></i>
                        <input type="date" className={styles.dateInput} value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* 2. EIXOS ASSOCIADOS */}
              <div className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <i className={`fa-solid fa-list-ul ${styles.sectionIcon}`}></i>
                  <h3 className={styles.sectionTitle}>2. EIXOS ASSOCIADOS</h3>
                </div>
                <div className={styles.sectionBody}>
                  <p className={styles.sectionSubtitle}>Selecione os eixos que melhor se relacionam com o tema.</p>

                  <div className={styles.checkboxGrid}>
                    {eixos.map(eixo => (
                      <label key={eixo.id} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={eixo.checked}
                          onChange={() => handleToggleEixo(eixo.id)}
                        />
                        {eixo.nome}
                      </label>
                    ))}
                  </div>
                  {mostrarInputEixo ? (
                    <div className={styles.addEixoInputGroup}>
                      <input
                        type="text"
                        value={novoEixo}
                        onChange={(e) => setNovoEixo(e.target.value)}
                        placeholder="Nome do novo eixo..."
                        className={styles.addEixoInput}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdicionarEixo()}
                        autoFocus
                      />
                      <button onClick={handleAdicionarEixo} className={styles.addEixoConfirmBtn}>
                        <i className="fa-solid fa-check"></i>
                      </button>
                      <button onClick={() => setMostrarInputEixo(false)} className={styles.addEixoCancelBtn}>
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ) : (
                    <button className={styles.addEixoBtn} onClick={() => setMostrarInputEixo(true)}>
                      <i className="fa-solid fa-plus"></i> Adicionar eixo personalizado
                    </button>
                  )}

                </div>
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* 3. TEMA PROPOSTO */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <i className={`fa-solid fa-quote-left ${styles.sectionIcon}`}></i>
                <h3 className={styles.sectionTitle}>3. TEMA PROPOSTO</h3>
              </div>
              <div className={styles.sectionBody}>
                <p className={styles.sectionSubtitle}>Frase-tema que será exibida aos alunos.</p>

                <textarea
                  className={styles.textarea}
                  placeholder='"Desafios para a valorização da saúde mental de jovens no ambiente escolar brasileiro"'
                  value={fraseTema}
                  onChange={(e) => setFraseTema(e.target.value)}
                  maxLength={200}
                ></textarea>
                <div className={styles.charCount}>{fraseTema.length}/200 caracteres</div>
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* 4. MATERIAIS DE APOIO */}
            <div className={styles.formSection}>
              <div className={styles.sectionHeader}>
                <i className={`fa-solid fa-paperclip ${styles.sectionIcon}`}></i>
                <h3 className={styles.sectionTitle}>4. MATERIAIS DE APOIO (OPCIONAL)</h3>
              </div>
              <div className={styles.sectionBody}>
                <p className={styles.sectionSubtitle}>Adicione materiais complementares que ficarão disponíveis para os alunos.</p>
                
              </div>
              <div className={styles.materiaisGrid}>
                    {/* FOLHA DE REDAÇÃO PADRÃO - FIXA */}
                    <a 
                      href={folhaRedacaoPdf} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.materialCard}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
                    >
                      <div className={styles.materialHeader}>
                        <i className={`fa-solid fa-file-pdf ${styles.materialHeaderIcon}`}></i>
                        <h4 className={styles.materialTitle}>FOLHA DE REDAÇÃO PADRÃO</h4>
                      </div>
                      <p className={styles.materialDesc}>Folha de redação padrão da plataforma para o aluno imprimir.</p>
                      
                      <div className={styles.materialPreview}>
                        <i className="fa-regular fa-file-pdf" style={{ fontSize: '40px', color: '#f44336' }}></i>
                      </div>
                      
                      <div className={styles.materialInfo}>
                        <div>
                          <p className={styles.materialName}>Folha Redacao.pdf</p>
                          <p className={styles.materialSize}>Padrão</p>
                        </div>
                        <i 
                          className={`fa-solid fa-check`} 
                          style={{ color: '#4CAF50' }}
                          title="Fixo"
                        ></i>
                      </div>
                    </a>

                    {/* Renderizando a lista de materiais adicionados dinamicamente */}
                    {materiais.map((material) => (
                      <div key={material.id} className={styles.materialCard}>
                        <div className={styles.materialHeader}>
                          <i className={`fa-solid ${material.tipo === 'pdf' ? 'fa-file-pdf' : material.tipo === 'video' ? 'fa-play' : 'fa-image'} ${styles.materialHeaderIcon}`}></i>
                          <h4 className={styles.materialTitle}>{material.titulo.toUpperCase()}</h4>
                        </div>
                        <p className={styles.materialDesc}>
                          {material.descricao || (material.isExisting ? 'Material salvo anteriormente.' : '')}
                        </p>
                        
                        <div className={styles.materialPreview}>
                          {/* Mostra um ícone diferente dependendo do tipo do arquivo */}
                          {material.tipo === 'pdf' ? (
                            <i className="fa-regular fa-file-pdf" style={{ fontSize: '40px', color: '#f44336' }}></i>
                          ) : material.tipo === 'video' ? (
                            <i className="fa-solid fa-film" style={{ fontSize: '40px', color: '#2196F3' }}></i>
                          ) : (
                            <i className="fa-regular fa-image" style={{ fontSize: '40px', color: '#4CAF50' }}></i>
                          )}
                        </div>
                        
                        <div className={styles.materialInfo}>
                          <div>
                            <p className={styles.materialName}>{material.nomeDisplay}</p>
                            <p className={styles.materialSize}>{material.isExisting ? 'Salvo' : material.tamanho}</p>
                          </div>
                          <i 
                            className={`fa-solid fa-xmark ${styles.materialRemove}`} 
                            onClick={() => handleRemoverMaterial(material.id)}
                            style={{ cursor: 'pointer' }}
                            title="Remover material"
                          ></i>
                        </div>
                      </div>
                    ))}

                    {/* Botão para adicionar novo material */}
                    <div 
                      className={styles.materialAddCard} 
                      onClick={handleAbrirModal} 
                      style={{ cursor: 'pointer' }}
                    >
                      <i className={`fa-solid fa-plus ${styles.materialAddIcon}`}></i>
                      <p className={styles.materialAddTitle}>Adicionar material</p>
                      <p className={styles.materialAddDesc}>Adicione arquivos extras como apoio aos alunos.</p>
                      <p className={styles.materialAddDesc} style={{ marginTop: '16px', opacity: 0.5 }}>PDF, Vídeo ou Imagem<br />(Até 10MB)</p>
                    </div>
                  </div>

                    
            </div>

          </div>

          <div className={styles.tipBox}>
            <i className={`fa-regular fa-lightbulb ${styles.tipIcon}`}></i>
            <p className={styles.tipText}>
              <strong style={{ color: '#DA9E00' }}>Dica:</strong> Após salvar, o tema ficará visível para os alunos dentro do período selecionado.
            </p>
          </div>
        </div>
      </div>
      {isModalMaterialOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Adicionar Material de Apoio</h3>
            
            <div className={styles.modalFormGroup}>
              <label>Título do Card (Ex: PDF DO TEMA)</label>
              <input 
                type="text" 
                value={formMaterial.titulo} 
                className={styles.modalInput}
                onChange={e => setFormMaterial({...formMaterial, titulo: e.target.value})} 
              />
            </div>

            <div className={styles.modalFormGroup}>
              <label>Descrição</label>
              <textarea 
                value={formMaterial.descricao} 
                className={styles.modalTextarea}
                onChange={e => setFormMaterial({...formMaterial, descricao: e.target.value})} 
              />
            </div>

            <div className={styles.modalFormGroup}>
              <label>Tipo de Material</label>
              <select 
                value={formMaterial.tipo} 
                className={styles.modalInput}
                onChange={e => setFormMaterial({...formMaterial, tipo: e.target.value})}
              >
                <option value="pdf">PDF</option>
                <option value="video">Vídeo Link</option>
                <option value="imagem">Imagem</option>
              </select>
            </div>

            {formMaterial.tipo === 'video' ? (
              <div className={styles.modalFormGroup}>
                <label>Link do Vídeo</label>
                <input 
                  type="text" 
                  className={styles.modalInput}
                  onChange={e => setFormMaterial({...formMaterial, link: e.target.value})} 
                />
              </div>
            ) : (
              <div className={styles.modalFormGroup}>
                <label>Selecionar Arquivo</label>
                <input 
                  type="file" 
                  className={styles.modalInput}
                  onChange={e => setFormMaterial({...formMaterial, arquivo: e.target.files[0]})} 
                />
              </div>
            )}

            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={handleFecharModal}>Cancelar</button>
              <button className={styles.modalSaveBtn} onClick={handleSalvarMaterialModal}>Salvar Material</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastrarProposta;
