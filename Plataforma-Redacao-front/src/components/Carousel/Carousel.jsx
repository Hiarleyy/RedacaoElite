import styles from './styles.module.css'
import VideoCard from '../VideoCard/VideoCard'
import Button from '../Button/Button'
import { useRef } from 'react'

const Carousel = ({ array, text }) => {
  const carousel = useRef(null)

  const handleLeftClick = (e) => {
    e.preventDefault()
    carousel.current.scrollLeft -= (carousel.current.offsetWidth - 200)
  }
    
  const handleRightClick = (e) => {
    e.preventDefault()
    carousel.current.scrollLeft += (carousel.current.offsetWidth - 200)
  }

  return (
    <div className={styles.container}>
      {array.length > 0 ?
        <>
          <h3 className={styles.title}>{text}</h3>
          <div ref={carousel} className={styles.carousel}>
            {array && array.map((item) => {
              return <VideoCard key={item.id} thumbnail={item.thumbnail} titulo={item.titulo} link={item.id} />
            })}
          </div>

          <div className={styles.buttons}>
            <Button
              bg_color="#1A1A1A" 
              width_size="40px"
              height_size="40px"
              radius='50%'
              padding_sz='10px'
              onClick={handleLeftClick}
            ><i className="fa-solid fa-angle-left"></i></Button>

            <Button
              bg_color="#1A1A1A" 
              width_size="40px"
              height_size="40px"
              radius='50%'
              padding_sz='10px'
              onClick={handleRightClick}
            ><i className="fa-solid fa-angle-right"></i></Button>
          </div>
        </> : null
      }
    </div>
  )
}

export default Carousel