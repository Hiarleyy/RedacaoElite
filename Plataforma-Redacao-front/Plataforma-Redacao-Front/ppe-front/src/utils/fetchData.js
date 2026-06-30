import axios from "axios"
import useUseful from "./useUseful"

const { getHeaders } = useUseful()

const baseURL = import.meta.env.VITE_API_BASE_URL

const fetchData = () => {  
  const getTurmas = async () => {
    const response = await axios.get(`${baseURL}/turmas`, { headers: getHeaders() })
    
    return response.data.data
  }

  const getTurmaById = async (id) => {
    const response = await axios.get(`${baseURL}/turmas/${id}`, {headers: getHeaders() })
    return response.data.data
  }
  const getAlunos = async (filter) => {
    if (!filter) {
      const response = await axios.get(`${baseURL}/usuarios`, { headers: getHeaders() })
      return response.data.data
    }

    const response = await axios.get(`${baseURL}/usuarios?filter=${filter}`, { headers: getHeaders() })
    return response.data.data
  }

  const getAlunoById = async (id) => {
    const response = await axios.get(`${baseURL}/usuarios/${id}`, { headers: getHeaders() })
    return response.data.data
  }

  const getModulos = async () => {
    const response = await axios.get(`${baseURL}/modulos`, { headers: getHeaders() })
    return response.data.data
  }

  const getModuloById = async (id) => {
    const response = await axios.get(`${baseURL}/modulos/${id}`, { headers: getHeaders() })
    return response.data.data
  }

  const getVideoById = async (id) => {
    const response = await axios.get(`${baseURL}/videos/${id}`, { headers: getHeaders() })
    return response.data.data
  }

  const getRanking = async () => {
    const response = await axios.get(`${baseURL}/ranking`, { headers: getHeaders() })
    return response.data.data
  }
  
  const getPropostas = async() =>{
    const response = await axios.get (`${baseURL}/propostas`, { headers: getHeaders() })
    return response.data.data
  }
  const getRedacoes = async (usuarioId = false, corrigidas = false, pendentes = false) => {
    // Buscando as redações corrigidas de um usuário específico
    if (usuarioId && corrigidas) {
      const response = await axios.get(`${baseURL}/redacoes?usuarioId=${usuarioId}&corrigidas=true`, { headers: getHeaders() })
      return response.data.data
    }

    // Buscando as redações pendentes de um usuário específico
    if (usuarioId && pendentes) {
      const response = await axios.get(`${baseURL}/redacoes?usuarioId=${usuarioId}&pendentes=true`, { headers: getHeaders() })
      return response.data.data
    }

    // Buscando todas as redações corrigidas
    if (corrigidas) {
      const response = await axios.get(`${baseURL}/redacoes?corrigidas=true`, { headers: getHeaders() })
      return response.data.data
    }

    // Buscando todas as redações pendentes
    if (pendentes) {
      const response = await axios.get(`${baseURL}/redacoes?pendentes=true`, { headers: getHeaders() })
      return response.data.data
    }

    // Buscando as redações de um usuário específico
    if (usuarioId) {
      const response = await axios.get(`${baseURL}/redacoes?usuarioId=${usuarioId}`, { headers: getHeaders() })
      return response.data.data
    }
    // Buscando todas as redações
    const response = await axios.get(`${baseURL}/redacoes`, { headers: getHeaders() })
    return response.data.data  }
  const getRedacaoById = async (id) => {
    const response = await axios.get(`${baseURL}/redacoes/${id}`, { headers: getHeaders() })
    return response.data.data
  }

  const getSimulados = async () => {
    const response = await axios.get(`${baseURL}/simulados`, { headers: getHeaders() })
    return response.data.data
  }
  const getNotasbySimuladoId = async (id) => {
    const response = await axios.get(`${baseURL}/notaSimulado/simuladoId/${id}`,{ headers: getHeaders() })
    return response.data.data
  }
  const getSimuladoByIdTurma = async (id) => {
    const response = await axios.get(`${baseURL}/simulados/turmaId/${id}`, { headers: getHeaders() })
    return response.data.data
  }

  const getRedacoesUser = async (id) => {
    if (id) {
      const response = await axios.get(`${baseURL}/redacoes/?usuarioId=${id}`, { headers: getHeaders() })
      return response.data.data
    }    // Retorna todas as redações se nenhum ID de usuário for fornecido
    const response = await axios.get(`${baseURL}/redacoes`, { headers: getHeaders() })
    return response.data.data
  }
   
  const getCorrecoes= async () => {
    const response = await axios.get(`${baseURL}/correcoes`, { headers: getHeaders() })
    return response.data.data
  }
  
  const getNotaSimulados = async () => {
    const response = await axios.get(`${baseURL}/notaSimulado`, { headers: getHeaders() })
    return response.data.data
  } 
  const getNotasByUsuarioId = async (usuarioId) => {
      const response = await axios.get(`${baseURL}/notaSimulado/usuarioId/${usuarioId}`, { headers: getHeaders() })
      return response.data.data
    }
    const getSimuladoById = async (id) => {
    const response = await axios.get(`${baseURL}/simulados/${id}`, { headers: getHeaders() })
    return response.data.data
  }


    const getRedacoesCorrigidas = async (id) => {
    if (id) {
      const response = await axios.get(`${baseURL}/redacoes/${id}?corrigidas=true`, { headers: getHeaders() })
      return response.data.data
    }
    // Busca todas as redações corrigidas se não houver ID específico
    const response = await axios.get(`${baseURL}/redacoes?corrigidas=true`, { headers: getHeaders() })
    return response.data.data
  }

  const getPagamentos = async () => {
    const response = await axios.get(`${baseURL}/pagamentos`,  { headers: getHeaders() })
    return response.data.data
  }

  const createSimulado = async (simuladoData) => {
    const response = await axios.post(`${baseURL}/simulados`, simuladoData, { headers: getHeaders() })
    return response.data
  }

  return { 
    getTurmas, 
    getTurmaById, 
    getAlunos, 
    getAlunoById,
    getModulos,
    getModuloById,
    getVideoById,
    getRanking,
    getRedacoes,
    getPropostas,
    getRedacoesCorrigidas,
    getRedacoesUser,
    getRedacaoById,
    getSimuladoById,
    getSimulados,
    getNotasbySimuladoId,
    getNotasByUsuarioId,
    getSimuladoByIdTurma,
    getNotaSimulados,
    getCorrecoes,
    getPagamentos,
    createSimulado
  }
}

export default fetchData