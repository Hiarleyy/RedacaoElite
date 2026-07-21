import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"

// Página comum
import Login from "./pages/Common/Login/Login"
import Configuracoes from "./pages/Common/Configuracoes/Configuracoes"
import Ranking from "./pages/Common/Ranking/Ranking"
import VideoPage from "./pages/Common/VideoPage/VideoPage"
import Cursos from "./pages/Common/Cursos/Cursos"
import ModuloPage from "./pages/Common/ModuloPage/ModuloPage"

// Layouts
import AlunoLayout from "./pages/Aluno/Layout/Layout"
import AdminLayout from "./pages/Admin/Layout/Layout"

// Aluno Pages
import AlunoInicio from "./pages/Aluno/Inicio/Inicio"
import Perfil from "./pages/Aluno/Perfil/Perfil"
import NovaRedacao from "./pages/Aluno/NovaRedacao/NovaRedacao"
import DesenpenhoAluno from "./pages/Aluno/DesenpenhoAluno/DesenpenhoAluno"
import SimuladosAluno from "./pages/Aluno/Simulados/Simulados"
import AlunoPagamentos from "./pages/Aluno/Pagamentos/Pagamentos"
import Artigos from "./pages/Common/Artigos/Artigos"
import TemaSemanal from "./pages/Aluno/TemaSemanal/TemaSemanal"

// Admin Pages
import FrequenciaAlunos from "./pages/Admin/FrequenciaAlunos/FrequenciaAlunos"
import DashboardAdmin from "./pages/Admin/Dashboard/Dashboard"
import NovaProposta from "./pages/Admin/GerenciarProposta/NovaProposta"
import CadastrarProposta from "./pages/Admin/CadastrarProposta/CadastrarProposta"
import GerenciarTurmas from "./pages/Admin/GerenciarTurmas/GerenciarTurmas"
import DetalhesTurma from "./pages/Admin/DetalhesTurma/DetalhesTurma"
import GerenciarAlunos from "./pages/Admin/GerenciarAlunos/GerenciarAlunos"
import DetalhesAluno from "./pages/Admin/DetalhesAluno/DetalhesAluno"
import GerenciarCursos from "./pages/Admin/GerenciarCursos/GerenciarCursos"
import CadastrarCurso from "./pages/Admin/CadastrarCurso/CadastrarCurso"
import Correcao from "./pages/Admin/Correcao/Correcao"
import CorrigirRedacao from "./pages/Admin/CorrigirRedacao/CorrigirRedacao"
import Pagamentos from "./pages/Admin/Pagamentos/pagamentos"
import Simulados from "./pages/Admin/Simulados/Simulados"
import NotasSimulados from "./pages/Admin/NotasSimulados/NotasSimulados"
import GerenciaPagamentos from "./pages/Admin/GerenciaPagamentos/GerenciaPagamentos"
import GerenciarNotas from "./pages/Admin/GerenciarNotas/GerenciarNotas"
import CalendarioAcademico from "./pages/Admin/CalendarioAcademico/CalendarioAcademico"
import MatriculaAluno from "./pages/Admin/MatriculaAluno/MatriculaAluno"
import ContadorEnem from "./pages/Admin/ContadorEnem/ContadorEnem"
import GerenciarArtigos from "./pages/Admin/GerenciarArtigos/GerenciarArtigos"
import NovoArtigo from "./pages/Admin/GerenciarArtigos/NovoArtigo"
import Pomodoro from "./pages/Aluno/Pomodoro/Pomodoro"

const isAuthenticated = () => {
  return localStorage.getItem("user_access_data") !== null
}

const getUserRole = () => {
  const data = localStorage.getItem("user_access_data")
  if (!data) return null

  try {
    const { role } = JSON.parse(data)
    return role
  } catch (error) {
    console.error("Erro ao fazer parse de user_access_data:", error)
    return null
  }
}

const definePath = () => {
  const role = getUserRole()?.toUpperCase()

  if (role === "ADMIN" || role === "PEDAGOGO") {
    return "/admin"
  } else if (role === "STANDARD") {
    return "/aluno"
  } else {
    return "/"
  }
}

const ProtectedHomeRoutes = ({ element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  if (getUserRole()?.toUpperCase() !== "STANDARD") {
    return <Navigate to="/" replace />
  }

  return element
}

const ProtectedHomeAdminRoutes = ({ element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  if (getUserRole()?.toUpperCase() !== "ADMIN" && getUserRole()?.toUpperCase() !== "PEDAGOGO") {
    return <Navigate to="/" replace />
  }

  return element
}

const ProtectedLoginRoute = ({ element }) => {
  return isAuthenticated() ? <Navigate to={definePath()} replace /> : element
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLoginRoute element={<Login />} />,
  },

  {
    path: "/aluno",
    element: <ProtectedHomeRoutes element={<AlunoLayout />} />,
    children: [
      { index: true, element: <AlunoInicio /> },
      { path: "perfil", element: <Perfil /> },
      { path: "nova-redacao", element: <NovaRedacao /> },
      { path: "ranking", element: <Ranking /> },
      { path: "cursos", element: <Cursos /> },
      { path: "cursos/:video_id", element: <VideoPage /> },
      { path: "modulo/:modulo_id", element: <ModuloPage /> },
      { path: "configuracoes", element: <Configuracoes /> },
      { path: "ControleDesempenho", element: <DesenpenhoAluno /> },
      { path: "SimuladosAluno", element: <SimuladosAluno /> },
      { path: "pagamentos", element: <AlunoPagamentos /> },
      { path: "artigos", element: <Artigos /> },
      { path: "pomodoro", element: <Pomodoro /> },
      { path: "tema-semanal", element: <TemaSemanal /> },
    ],
  },

  {
    path: "/admin",
    element: <ProtectedHomeAdminRoutes element={<AdminLayout />} />,
    children: [
      { index: true, element: <DashboardAdmin /> },
      { path: "nova-proposta", element: <NovaProposta /> },
      { path: "cadastrar-proposta", element: <CadastrarProposta /> },
      { path: "gerenciar-turmas", element: <GerenciarTurmas /> },
      { path: "gerenciar-turmas/:turma_id", element: <DetalhesTurma /> },
      { path: "gerenciar-alunos", element: <GerenciarAlunos /> },
      { path: "gerenciar-alunos/:aluno_id", element: <DetalhesAluno /> },
      { path: "gerenciar-cursos", element: <GerenciarCursos /> },
      { path: "cadastrar-curso", element: <CadastrarCurso /> },
      { path: "ranking", element: <Ranking /> },
      { path: "cursos", element: <Cursos /> },
      { path: "cursos/:video_id", element: <VideoPage /> },
      { path: "modulo/:modulo_id", element: <ModuloPage /> },
      { path: "correcao", element: <Correcao /> },
      { path: "correcao/:redacao_id", element: <CorrigirRedacao /> },
      { path: "pagamentos", element: <Pagamentos /> },
      { path: "gerenciar-pagamentos", element: <GerenciaPagamentos /> },
      { path: "configuracoes", element: <Configuracoes /> },
      { path: "Simulados", element: <Simulados /> },
      { path: "Simulados/:simulado_id", element: <NotasSimulados /> },
      { path: 'gerenciar-notas/:aluno_id', element: <GerenciarNotas /> },
      { path: "calendario", element: <CalendarioAcademico /> },
      { path: "FrequenciaAlunos", element: <FrequenciaAlunos /> },
      { path: "MatriculaAluno", element: <MatriculaAluno /> },
      { path: "contador-enem", element: <ContadorEnem /> },
      { path: "artigos", element: <GerenciarArtigos /> },
      { path: "artigos/novo", element: <NovoArtigo /> },
      { path: "artigos/:id/editar", element: <NovoArtigo /> },
      { path: "blog", element: <Artigos /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />
}

export default App

