import styles from "./styles.module.css"
import Title from "../../../components/Title/Title"
import Button from "../../../components/Button/Button"
import Loading from "../../../components/Loading/Loading"
import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import fetchData from "../../../utils/fetchData"

const VideoPage = () => {
  const { video_id } = useParams()
  const [video, setVideo] = useState({})
  const [moduloVideos, setModuloVideos] = useState([])
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [isModuloLoading, setIsModuloLoading] = useState(true)
  const navigate = useNavigate()

  const getEmbedUrl = (url) => {
    if (!url) return ""
    const videoId = new URL(url).searchParams.get("v")
    return `https://www.youtube.com/embed/${videoId}`
  }  

  const nextVideo = () => {
    const currentIndex = video.ordem - 1
    let nextVideo

    if (currentIndex === moduloVideos.length - 1) {
      nextVideo = moduloVideos[moduloVideos.length - 1]
    } else {
      nextVideo = moduloVideos[currentIndex + 1]
    }
    
    navigate(`../cursos/${nextVideo.id}`, { replace: true })
  }

  const previousVideo = () => {
    const currentIndex = video.ordem - 1
    let previousVideo

    if (currentIndex === 0) {
      previousVideo = moduloVideos[0]
    } else {
      previousVideo = moduloVideos[currentIndex - 1]
    }
    
    navigate(`../cursos/${previousVideo.id}`, { replace: true })
  }

  useEffect(() => {
    const getData = async () => {
      const { getVideoById } = fetchData() 
      const response = await getVideoById(video_id)
      setVideo(response)
    }
  
    getData()
  }, [video_id])

  useEffect(() => {
    setIsModuloLoading(true)
    try {
      const getData = async () => {
        const { getModuloById } = fetchData() 
        const moduloId = video.modulo?.id
        if (!moduloId) return
        const response = await getModuloById(moduloId)
        setModuloVideos(response.videos)
      }
  
      getData()
    } catch (error) {
      console.error("Erro ao buscar os dados:", error)
    } finally {
      setIsModuloLoading(false)
    }
  }, [video])

  return (
    <div className={styles.container}>
      <Title title={video.modulo?.nome || "Carregando..."} />
      <div className={styles.main_content}>

        <div className={styles.bg_left}>
          <div className={styles.video}>
            {isVideoLoading && <div className={styles.loading}><Loading /></div>}

            <iframe 
              width="560" 
              height="315" 
              src={getEmbedUrl(video?.url)} 
              title="YouTube video player" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerpolicy="strict-origin-when-cross-origin" 
              allowfullscreen
              onLoad={() => setIsVideoLoading(false)}
              style={{ display: isVideoLoading ? "none" : "block" }}
            ></iframe>
          </div>

          <p className={styles.title}>{video?.titulo}</p>

          <div className={styles.buttons}>
            <Button 
              text_size="20px" 
              text_color="#E0E0E0" 
              padding_sz="10px" 
              bg_color="#242424"
              width_size="300px"
              onClick={previousVideo}
            ><i class="fa-solid fa-arrow-left"></i> Anterior</Button>

            <Button 
              text_size="20px" 
              text_color="#E0E0E0" 
              padding_sz="10px" 
              bg_color="#242424"
              width_size="300px"
              onClick={nextVideo}
            >Próxima <i class="fa-solid fa-arrow-right"></i></Button>
          </div>
        </div>

        <div className={styles.bg_right}>
          <p className={styles.title}>Conteúdo do curso</p>
          <div className={styles.divider}></div>
          <div className={styles.aulas}>
            {isModuloLoading ? (
              <div className={styles.loading}>
                <Loading />
              </div>
            ) : (
              moduloVideos.map((video) => (
                <Link
                  className={styles.aula_card}
                  key={video.id}
                  to={`../cursos/${video.id}`}
                >
                  <i class="fa-solid fa-video"></i>
                  <p>{video.titulo}</p>
                </Link>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default VideoPage