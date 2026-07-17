import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import logoImg from "../../images/logo01.png"

/**
 * Gera e faz download de um PDF de histórico escolar com layout branded da Redação Elite.
 *
 * @param {Object} dados  - Objeto com todos os dados do aluno / histórico
 * @param {string} dados.nome
 * @param {string} dados.email
 * @param {string} dados.turma
 * @param {string} dados.dataMatricula
 * @param {number} dados.simuladosRealizados
 * @param {number} dados.redacoesCorrigidas
 * @param {string|number} dados.mediaGeral
 * @param {number} dados.totalAulas
 * @param {number} dados.presencas
 * @param {number} dados.faltas
 * @param {string} dados.percentualFrequencia
 * @param {string} [fileName]  - Nome do arquivo (sem extensão)
 */
export const gerarHistoricoPdf = async (dados, fileName = "historico-redacao-elite") => {
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

  const formatLocalDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  const turmaNome = dados.turma || "—"

  const field = (label, value) => `
    <div class="field">
      <span class="field-label">${label}</span>
      <span class="field-value">${value !== undefined && value !== null ? value : "—"}</span>
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
          background: #ffffff;
          padding: 24px 48px 16px;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          display: none;
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
          color: #1a1a1a;
          font-style: normal;
        }

        .brand-tagline {
          font-size: 10px;
          font-weight: 500;
          color: #666;
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
          color: #1a1a1a;
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
          padding: 12px 48px;
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
          padding: 16px 48px;
        }

        /* ── Card de seção ── */
        .section-card {
          margin-bottom: 12px;
          border: 1px solid #ebebeb;
          border-radius: 10px;
          overflow: hidden;
        }

        .section-header {
          background: #f8f6f0;
          border-bottom: 1px solid #ebebeb;
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
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 1.8px;
        }

        .section-body {
          padding: 10px 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 24px;
          background: #ffffff;
        }

        .section-body.three-col {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .section-body.four-col {
          grid-template-columns: 1fr 1fr 1fr 1fr;
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

        /* ── Rodapé ── */
        .footer {
          background: #ffffff;
          border-top: 1px solid #ebebeb;
          padding: 12px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0px;
        }

        .footer-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-brand {
          font-size: 11px;
          font-weight: 700;
          color: #1a1a1a;
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
          <div class="brand" style="flex-direction: row; align-items: center; gap: 16px;">
            <img src="${logoImg}" style="height: 50px; width: auto;" alt="Logo Redação Elite" />
            <div>
              <div class="brand-name"><em>Redação</em> Elite</div>
              <div class="brand-tagline">Centro de Preparação para o ENEM</div>
            </div>
          </div>
          <div style="display: flex; align-items: flex-start;">
            <div class="doc-info" style="margin-top: 8px;">
              <div class="doc-date">Emitido em ${dataEmissao}<br/>às ${horaEmissao}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="gold-bar"></div>

      <!-- Hero -->
      <div class="hero">
        <div class="hero-text">
          <h1>HISTÓRICO ACADÊMICO</h1>
        </div>
        <div class="protocol">
          <div class="protocol-label">Protocolo</div>
          <div class="protocol-number">#HE${Date.now().toString().slice(-8)}</div>
        </div>
      </div>

      <!-- Corpo -->
      <div class="body">

        <!-- Dados pessoais -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Dados Pessoais</h2>
          </div>
          <div class="section-body">
            ${field("Nome do Aluno", dados.nome)}
            ${field("E-mail", dados.email)}
            ${field("Turma", turmaNome)}
            ${field("Data de Matrícula", formatLocalDate(dados.dataMatricula))}
          </div>
        </div>

        <!-- Desempenho Acadêmico -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Desempenho Acadêmico</h2>
          </div>
          <div class="section-body three-col">
            ${field("Simulados Realizados", dados.simuladosRealizados)}
            ${field("Redações Corrigidas", dados.redacoesCorrigidas)}
            ${field("Média Geral", dados.mediaGeral)}
          </div>
        </div>

        <!-- Controle de Frequência -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-dot"></div>
            <h2>Controle de Frequência</h2>
          </div>
          <div class="section-body four-col">
            ${field("Total de Aulas", dados.totalAulas)}
            ${field("Presenças / Justif.", dados.presencas)}
            ${field("Faltas", dados.faltas)}
            ${field("Percentual", dados.percentualFrequencia)}
          </div>
        </div>

      </div>

      <div class="watermark">ELITE</div>

      <!-- Assinaturas -->
      <div style="margin-top: 150px; display: flex; justify-content: center; padding: 0 48px; margin-bottom: 20px;">
        <div style="text-align: center; width: 60%;">
          <div style="width: 100%; border-bottom: 1px solid #1a1a1a; margin-bottom: 6px;"></div>
          <span style="font-size: 11px; font-weight: 600; color: #1a1a1a;">Coordenação Pedagógica</span>
        </div>
      </div>

      <!-- Rodapé -->
      <div class="footer" style="position: absolute; bottom: 0; width: 100%;">
        <div class="footer-left">
          <div class="footer-brand">REDAÇÃO ELITE</div>
          <div class="footer-note">Este documento é um resumo simplificado do desempenho do aluno.</div>
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
    unit: "mm",
    format: "a4",
    compress: true,
  })

  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let pdfHeight = (canvas.height * pdfWidth) / canvas.width

  // Evita cortar o PDF ajustando a escala caso fique maior que 1 página
  if (pdfHeight > pageHeight) {
    const ratio = pageHeight / pdfHeight
    pdfHeight = pageHeight
    const scaledWidth = pdfWidth * ratio
    const xOffset = (pdfWidth - scaledWidth) / 2
    pdf.addImage(imgData, "PNG", xOffset, 0, scaledWidth, pdfHeight, "", "FAST")
  } else {
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, "", "FAST")
  }

  pdf.save(`${fileName}.pdf`)
}

export default gerarHistoricoPdf
