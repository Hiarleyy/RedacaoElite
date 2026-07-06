import jsPDF from "jspdf"
import html2canvas from "html2canvas"

/**
 * Gera e faz download de um PDF de matrícula com layout branded da Redação Elite.
 *
 * @param {Object} dados  - Objeto com todos os dados do aluno / matrícula
 * @param {string} dados.nomeCompleto
 * @param {string} dados.dataNascimento
 * @param {string} dados.cpf
 * @param {string} dados.genero
 * @param {string} dados.email
 * @param {string} dados.telefone
 * @param {string} dados.endereco
 * @param {string} dados.bairro
 * @param {string} dados.cidade
 * @param {string} dados.turma
 * @param {string} dados.dataInicio
 * @param {string} dados.comoConheceu
 * @param {string} dados.observacoes
 * @param {string} dados.nomeResponsavel
 * @param {string} dados.vinculoResponsavel
 * @param {string} dados.telefoneResponsavel
 * @param {string} [fileName]  - Nome do arquivo (sem extensão)
 */
export const gerarMatriculaPdf = async (dados, fileName = "matricula-redacao-elite") => {
  // ── 1. Monta o HTML do documento ──────────────────────────────────────────
  const dataEmissao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const horaEmissao = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const turmasLabel = {
    "elite01-manha":          "Elite 01 – Pré-ENEM (Manhã)",
    "elite02-tarde":          "Elite 02 – Pré-ENEM (Tarde)",
    "elite03-noite":          "Elite 03 – Pré-ENEM (Noite)",
    "gramatica-noite":        "GRAMÁTICA ELITE – Noite",
    "redacao-avancada-manha": "Redação Avançada – Manhã",
  }

  const turmaNome = turmasLabel[dados.turma] || dados.turma || "—"

  const field = (label, value) => `
    <div class="field">
      <span class="field-label">${label}</span>
      <span class="field-value">${value || "—"}</span>
    </div>
  `

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Inter', Arial, sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          width: 794px;
          min-height: 1123px;
        }

        /* ── Cabeçalho principal ── */
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
          padding: 36px 48px 28px;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(218,158,0,0.03) 20px,
            rgba(218,158,0,0.03) 40px
          );
        }

        .header-inner {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .brand {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 28px;
          font-weight: 900;
          color: #DA9E00;
          letter-spacing: 2px;
          line-height: 1;
          text-transform: uppercase;
        }

        .brand-name em {
          color: #ffffff;
          font-style: normal;
        }

        .brand-tagline {
          font-size: 10px;
          font-weight: 500;
          color: #888;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 5px;
        }

        .doc-info {
          text-align: right;
        }

        .doc-type {
          font-size: 12px;
          font-weight: 700;
          color: #DA9E00;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .doc-date {
          font-size: 10px;
          color: #888;
          margin-top: 4px;
        }

        /* ── Faixa dourada ── */
        .gold-bar {
          height: 4px;
          background: linear-gradient(90deg, #DA9E00 0%, #f5c842 50%, #DA9E00 100%);
        }

        /* ── Título da seção hero ── */
        .hero {
          background: #f8f6f0;
          padding: 20px 48px;
          border-bottom: 1px solid #ebebeb;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .hero-icon {
          width: 44px;
          height: 44px;
          background: #DA9E00;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .hero-text h1 {
          font-size: 18px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: 0.5px;
        }

        .hero-text p {
          font-size: 11px;
          color: #888;
          margin-top: 3px;
        }

        .protocol {
          margin-left: auto;
          text-align: right;
        }

        .protocol-label {
          font-size: 9px;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .protocol-number {
          font-size: 13px;
          font-weight: 700;
          color: #DA9E00;
          font-family: 'Courier New', monospace;
          margin-top: 2px;
        }

        /* ── Corpo ── */
        .body {
          padding: 28px 48px;
        }

        /* ── Card de seção ── */
        .section-card {
          margin-bottom: 20px;
          border: 1px solid #ebebeb;
          border-radius: 10px;
          overflow: hidden;
        }

        .section-header {
          background: linear-gradient(90deg, #1a1a1a, #2d2d2d);
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-header-dot {
          width: 8px;
          height: 8px;
          background: #DA9E00;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .section-header h2 {
          font-size: 10px;
          font-weight: 800;
          color: #DA9E00;
          text-transform: uppercase;
          letter-spacing: 1.8px;
        }

        .section-body {
          padding: 16px 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 24px;
          background: #ffffff;
        }

        .section-body.three-col {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .section-body.one-col {
          grid-template-columns: 1fr;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f0f0f0;
        }

        .field:last-child,
        .field:nth-last-child(2):nth-child(odd) {
          border-bottom: none;
        }

        .field-label {
          font-size: 9px;
          font-weight: 700;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .field-value {
          font-size: 12px;
          font-weight: 600;
          color: #1a1a1a;
        }

        /* ── Turma destaque ── */
        .turma-highlight {
          grid-column: 1 / -1;
          background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
          border-radius: 8px;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: none !important;
        }

        .turma-highlight .field-label {
          color: #DA9E00;
        }

        .turma-highlight .field-value {
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
        }

        .turma-badge {
          background: #DA9E00;
          color: #1a1a1a;
          font-size: 9px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* ── Observações ── */
        .obs-box {
          background: #fafafa;
          border: 1px dashed #ddd;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 4px;
        }

        .obs-box p {
          font-size: 11px;
          color: #555;
          line-height: 1.6;
        }

        /* ── Rodapé ── */
        .footer {
          background: #1a1a1a;
          padding: 18px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-brand {
          font-size: 11px;
          font-weight: 700;
          color: #DA9E00;
          letter-spacing: 1px;
        }

        .footer-note {
          font-size: 9px;
          color: #666;
        }

        .footer-seal {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .seal-circle {
          width: 52px;
          height: 52px;
          border: 2px solid #DA9E00;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }

        .seal-text {
          font-size: 6px;
          font-weight: 800;
          color: #DA9E00;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
          line-height: 1.3;
        }

        .watermark {
          position: absolute;
          bottom: 80px;
          right: 48px;
          font-size: 80px;
          font-weight: 900;
          color: rgba(218,158,0,0.04);
          text-transform: uppercase;
          letter-spacing: 4px;
          pointer-events: none;
          user-select: none;
        }
      </style>
    </head>
    <body>
      <!-- Cabeçalho -->
      <div class="header">
        <div class="header-inner">
          <div class="brand">
            <div class="brand-name"><em>Redação</em> Elite</div>
            <div class="brand-tagline">Centro de Preparação para o ENEM</div>
          </div>
          <div class="doc-info">
            <div class="doc-type">Ficha de Matrícula</div>
            <div class="doc-date">Emitido em ${dataEmissao} às ${horaEmissao}</div>
          </div>
        </div>
      </div>

      <div class="gold-bar"></div>

      <!-- Hero -->
      <div class="hero">
        <div class="hero-icon">📋</div>
        <div class="hero-text">
          <h1>COMPROVANTE DE MATRÍCULA</h1>
          <p>Documento gerado automaticamente pela Plataforma Redação Elite</p>
        </div>
        <div class="protocol">
          <div class="protocol-label">Protocolo</div>
          <div class="protocol-number">#RE${Date.now().toString().slice(-8)}</div>
        </div>
      </div>

      <!-- Corpo -->
      <div class="body">

        <!-- Dados pessoais -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Dados Pessoais do Aluno</h2>
          </div>
          <div class="section-body">
            ${field("Nome completo", dados.nomeCompleto)}
            ${field("Data de nascimento", dados.dataNascimento
              ? new Date(dados.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
              : "—"
            )}
            ${field("CPF", dados.cpf)}
            ${field("Gênero", dados.genero)}
          </div>
        </div>

        <!-- Contato -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Contato</h2>
          </div>
          <div class="section-body">
            ${field("E-mail", dados.email)}
            ${field("Telefone", dados.telefone)}
            ${field("Endereço", dados.endereco)}
            ${field("Bairro", dados.bairro)}
            ${field("Cidade", dados.cidade)}
          </div>
        </div>

        <!-- Responsável -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Dados do Responsável</h2>
          </div>
          <div class="section-body three-col">
            ${field("Nome do responsável", dados.nomeResponsavel)}
            ${field("Vínculo", dados.vinculoResponsavel)}
            ${field("Telefone", dados.telefoneResponsavel)}
          </div>
        </div>

        <!-- Informações acadêmicas -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Informações Acadêmicas</h2>
          </div>
          <div class="section-body">
            <div class="field turma-highlight">
              <div>
                <div class="field-label">Turma matriculada</div>
                <div class="field-value">${turmaNome}</div>
              </div>
              <div class="turma-badge">Matriculado</div>
            </div>
            ${field("Data de início", dados.dataInicio
              ? new Date(dados.dataInicio + "T00:00:00").toLocaleDateString("pt-BR")
              : "—"
            )}
            ${field("Como conheceu", dados.comoConheceu)}
          </div>
        </div>

        ${dados.observacoes ? `
        <!-- Observações -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Observações</h2>
          </div>
          <div class="section-body one-col">
            <div class="obs-box"><p>${dados.observacoes}</p></div>
          </div>
        </div>
        ` : ""}

      </div>

      <div class="watermark">ELITE</div>

      <!-- Rodapé -->
      <div class="footer">
        <div class="footer-left">
          <div class="footer-brand">REDAÇÃO ELITE</div>
          <div class="footer-note">Este documento é válido como comprovante de matrícula.</div>
          <div class="footer-note">Emitido em: ${dataEmissao} • ${horaEmissao}</div>
        </div>
        <div class="footer-seal">
          <div class="seal-circle">
            <div class="seal-text">DOC<br/>OFICIAL</div>
          </div>
        </div>
      </div>

    </body>
    </html>
  `

  // ── 2. Renderiza num iframe oculto ───────────────────────────────────────
  const iframe = document.createElement("iframe")
  iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:794px;height:1123px;border:none;visibility:hidden;"
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
  iframeDoc.open()
  iframeDoc.write(html)
  iframeDoc.close()

  // Aguarda fontes / imagens carregarem
  await new Promise((resolve) => setTimeout(resolve, 600))

  // ── 3. Captura com html2canvas ───────────────────────────────────────────
  const canvas = await html2canvas(iframeDoc.body, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#ffffff",
    width: 794,
    windowWidth: 794,
  })

  document.body.removeChild(iframe)

  // ── 4. Gera o PDF ────────────────────────────────────────────────────────
  const imgData = canvas.toDataURL("image/png", 1.0)
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [794, canvas.height / 2],
    compress: true,
  })

  pdf.addImage(imgData, "PNG", 0, 0, 794, canvas.height / 2, "", "FAST")
  pdf.save(`${fileName}.pdf`)
}

export default gerarMatriculaPdf
