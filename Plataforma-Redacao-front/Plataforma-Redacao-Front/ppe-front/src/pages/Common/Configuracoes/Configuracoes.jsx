import { useState, useEffect } from "react";
import fetchData from "../../../utils/fetchData";
import styles from "./styles.module.css";
import Title from "../../../components/Title/Title";
import Input from "../../../components/Input/Input";
import Button from "../../../components/Button/Button";
import Message from "../../../components/Message/Message";
import defaultProfilePicture from "../../../images/Defalult_profile_picture.jpg";
import useUseful from "../../../utils/useUseful";

const baseURL = import.meta.env.VITE_API_BASE_URL

function configuracoes() {
  const [usuario, setUsuario] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState({
    atual: false,
    nova: false,
    confirmar: false,
  });
  const { getHeaders } = useUseful();

  const getAlunoId = () => {
    const aluno = localStorage.getItem("user_access_data");
    const { id } = JSON.parse(aluno);
    return id;
  };
  useEffect(() => {
    const getData = async () => {
      try {
        const { getAlunoById } = fetchData();
        const response = await getAlunoById(getAlunoId());
        setUsuario(response);

        if (response.caminho) {
          setProfileImageUrl(
            `${baseURL}/usuarios/${
              response.id
            }/profile-image?timestamp=${new Date().getTime()}`
          );
        }
      } catch (err) {
        setFormMessage({
          text: "Erro ao buscar dados do usuário",
          type: "error",
        });
        console.error(err);
      }
    };
    getData();
  }, [refresh]);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Mostrar preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    const fileInput = event.target.elements.profileImage;
    if (!fileInput.files || !fileInput.files[0]) {
      setFormMessage({
        text: "Por favor, selecione uma imagem",
        type: "error",
      });
      return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    setFormMessage(null);

    try {
      if (!usuario || !usuario.id) {
        throw new Error("Dados do usuário não disponíveis");
      }
      const response = await fetch(
        `${baseURL}/usuarios/${usuario.id}`,
        {
          method: "POST",
          headers: getHeaders(),
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      setFormMessage({
        text: "Imagem de perfil atualizada com sucesso!",
        type: "success",
      });
      const newProfileImageUrl = `${baseURL}/usuarios/${
        usuario.id
      }/profile-image?timestamp=${new Date().getTime()}`;
      setProfileImageUrl(newProfileImageUrl);
      setImagePreview(null); //Limpa a pré-visualização
      setRefresh(!refresh); // Trigger a refresh

      event.target.reset();
    } catch (error) {
      setFormMessage({
        text: error.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setFormMessage(null);

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setFormMessage({
        text: "Preencha todos os campos de senha.",
        type: "error",
      });
      return;
    }

    // Remover espaços em branco e verificar novamente
    const senhaAtualTrimmed = senhaAtual.trim();
    const novaSenhaTrimmed = novaSenha.trim();
    const confirmarSenhaTrimmed = confirmarSenha.trim();

    if (!senhaAtualTrimmed || !novaSenhaTrimmed || !confirmarSenhaTrimmed) {
      setFormMessage({
        text: "Preencha todos os campos de senha (sem apenas espaços).",
        type: "error",
      });
      return;
    }
    
    if (novaSenhaTrimmed !== confirmarSenhaTrimmed) {
      setFormMessage({
        text: "As novas senhas não coincidem.",
        type: "error",
      });
      return;
    }
    
    // Validação básica da nova senha
    if (novaSenhaTrimmed.length < 6) {
      setFormMessage({
        text: "A nova senha deve ter pelo menos 6 caracteres.",
        type: "error",
      });
      return;
    }
    
    // Verifica se a nova senha é diferente da atual
    if (senhaAtualTrimmed === novaSenhaTrimmed) {
      setFormMessage({
        text: "A nova senha deve ser diferente da senha atual.",
        type: "error",
      });
      return;
    }
    setIsLoading(true);

    try {
      // Verifica se o usuário existe
      if (!usuario || !usuario.id) {
        throw new Error("Dados do usuário não disponíveis");
      }
      
      // Verifica se temos um token válido
      const headers = getHeaders();
      if (!headers.Authorization) {
        throw new Error("Token de autenticação não encontrado. Faça login novamente.");
      }
      
      // Estrutura do payload
      const payload = {
        senhaAtual: senhaAtualTrimmed,
        novaSenha: novaSenhaTrimmed,
      };
      
      const response = await fetch(
        `${baseURL}/usuarios/${usuario.id}/trocar-senha`,
        {
          method: "POST",
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      // Verifica se a resposta foi bem-sucedida
      if (!response.ok) {
        const errorText = await response.text();
        
        let errorMessage = "Erro ao trocar a senha.";
        
        try {
          const errorData = JSON.parse(errorText);
          
          if (errorData.error === "data and hash arguments required") {
            errorMessage = "Erro na validação da senha. Verifique se a senha atual está correta.";
          } else if (errorData.error === "Invalid current password") {
            errorMessage = "A senha atual informada está incorreta.";
          } else if (errorData.error === "Senha atual incorreta") {
            errorMessage = "A senha atual informada está incorreta.";
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          if (errorText.includes("Internal Server Error")) {
            errorMessage = "Erro interno do servidor. Verifique se os dados estão corretos.";
          } else {
            errorMessage = errorText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Processa a resposta de sucesso
      const responseText = await response.text();
      let responseData;
      
      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          // Se não conseguir fazer o parse, apenas continue
        }
      }

      // Limpa os campos de senha
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");

      // Exibe mensagem de sucesso
      setFormMessage({
        text: responseData?.message || "Senha alterada com sucesso!",
        type: "success",
      });
    } catch (err) {
      setFormMessage({
        text: err.message || "Erro ao trocar a senha. Por favor, tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className={styles.container}>
      <Title title="Configurações" />
      <div className={styles.main_content}>
        <div className={styles.config_section}>
          <h3>Atualizar Imagem de Perfil</h3>

          <div className={styles.profile_image_container}>
            <div className={styles.current_image_container}>
              <img
                src={
                  profileImageUrl ||
                  (usuario.caminho
                    ? `${baseURL}/usuarios/${usuario.id}/profile-image`
                    : defaultProfilePicture)
                }
                alt="Foto de perfil"
                className={styles.profile_image}
              />
              <p>Imagem atual</p>
            </div>

            {/* Container para visualização da pré-visualização */}
            <div className={styles.image_preview_container}>
              {imagePreview ? (
                <>
                  <div className={styles.imagePreview}>
                    <img
                      src={imagePreview}
                      alt="Pré-visualização"
                      className={styles.preview_image}
                    />
                  </div>
                  <p>Nova imagem</p>
                </>
              ) : (
                <div className={styles.no_preview}>
                  <p>Selecione uma nova imagem</p>
                </div>
              )}
            </div>
          </div>

          {/* Formulário para upload de imagem */}
          <div className={styles.image_upload_form_container}>
            <form onSubmit={handleSubmit} className={styles.image_upload_form}>
              <div className={styles.file_input_container}>
                <label
                  htmlFor="profileImage"
                  className={styles.file_input_label}
                >
                  Escolha uma imagem
                </label>
                <input
                  type="file"
                  id="profileImage"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.file_input}
                />
              </div>

              <div className={styles.button_container}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.submit_button}
                >
                  {isLoading ? "Enviando..." : "Enviar"}
                </button>{" "}
              </div>
            </form>{" "}
          </div>

          {/* Exibir mensagem de erro ou sucesso na seção de upload */}
          {formMessage && (
            <Message text={formMessage.text} type={formMessage.type} />
          )}

          {/* Seção de alteração de senha */}
          <div className={styles.password_section}>
            <h3>Definir Nova Senha</h3>
            <form
              onSubmit={handlePasswordChange}
              className={styles.password_form}
            >
              <div className={styles.form_group}>
                <p>Digite a Senha Atual</p>
                <Input
                  type={showPassword.atual ? "text" : "password"}
                  placeholder="Senha atual"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  color="#1A1A1A"
                >
                  <i
                    className={`fa-solid ${
                      showPassword.atual ? "fa-eye-slash" : "fa-eye"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePasswordVisibility("atual")}
                  ></i>
                </Input>
              </div>
              <div className={styles.form_group}>
                <p>Digite a Nova Senha</p>
                <Input
                  type={showPassword.nova ? "text" : "password"}
                  placeholder="Nova senha"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  color="#1A1A1A"
                >
                  <i
                    className={`fa-solid ${
                      showPassword.nova ? "fa-eye-slash" : "fa-eye"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePasswordVisibility("nova")}
                  ></i>
                </Input>
              </div>
              <div className={styles.form_group}>
                <p>Confirme a Nova Senha</p>
                <Input
                  type={showPassword.confirmar ? "text" : "password"}
                  placeholder="Confirme a nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  color="#1A1A1A"
                >
                  <i
                    className={`fa-solid ${
                      showPassword.confirmar ? "fa-eye-slash" : "fa-eye"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => togglePasswordVisibility("confirmar")}
                  ></i>
                </Input>
              </div>{" "}
              <div className={styles.button_container_password}>
                <Button
                  text_size="14px"
                  text_color="#E0E0E0"
                  padding_sz="10px 20px"
                  bg_color="#DA9E00"
                  isLoading={isLoading}
                  type="submit"
                >
                  Alterar Senha
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default configuracoes;