import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../Button/Button';
import styles from './styles.module.css'

const baseURL = import.meta.env.VITE_API_BASE_URL;


const RedacaoModal = ({ redacao, isOpen, onClose, activeTab, brasilFormatData }) => {
  if (!isOpen || !redacao) return null;

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h2>{redacao.titulo}</h2>
          <button className={styles.close_button} onClick={onClose}>×</button>
        </div>
        <div className={styles.modal_body}>
            <p>Data: {brasilFormatData(redacao.data)}</p>
            <p>Tema: {redacao.titulo}</p>
          <div className={styles.redacao_info}>
          
            {activeTab === 'avaliadas' && redacao.correcao && (
                
              <div className={styles.correcao_info}>
                
                <>
                    <span className={styles.nota_final}>Nota final: {redacao.correcao.nota}</span>
                    <div className={styles.competencias}>
                    <p>Competência 1: {redacao?.correcao.competencia01}</p>
                    <p>Competência 2: {redacao?.correcao.competencia02}</p>
                    <p>Competência 3: {redacao?.correcao.competencia03}</p>
                    <p>Competência 4: {redacao?.correcao.competencia04}</p>
                    <p>Competência 5: {redacao?.correcao.competencia05}</p>
                  </div>
                </>
              </div>
            )}
            {(!redacao.correcao || activeTab !== 'avaliadas') && (
              <div className={styles.correcao_info}>
                <p className={styles.sem_correcao}>Esta redação ainda não foi corrigida.</p>
              </div>
            )}
          </div>
          <h4>Comentário do corretor:</h4>
          <div className={styles.texto_redacao}>
            {redacao.correcao?.feedback ? (
              <div className={styles.feedback_container}>
                <p>{redacao.correcao.feedback}</p>
              </div>
            ) : (
              <div className={styles.feedback_container}>
                <p>Não há comentários disponíveis para esta redação.</p>
              </div>
            )}
          </div>
          {redacao.correcao && (
            <div className={styles.Button}>
              <Link to={`${baseURL}/correcoes/download/${redacao.correcao?.id}`}>
                <Button 
                  text_size="15px" 
                  text_color="#E0E0E0" 
                  padding_sz="15px" 
                  bg_color="#DA9E00"
                >
                  <i className="fa-solid fa-download"></i> BAIXAR ESSA REDAÇÃO
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedacaoModal;
