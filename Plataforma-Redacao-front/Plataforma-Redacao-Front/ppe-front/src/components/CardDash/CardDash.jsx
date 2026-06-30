import React from 'react';
import PropTypes from 'prop-types';
import styles from "../CardDash/styles.module.css";

const Card = ({
  title,
  content,
  image,
  imageAlt,
  icon,
  actions,
  variant = 'default',
  className,
  onClick,
  color,
  gradient,
  fontSize,
  titleColor,
  contentColor,
  children,
}) => {
  const titleStyle = {
    fontSize: fontSize || 'inherit',
    color: titleColor || 'inherit',
  };

  const contentStyle = {
    fontSize: fontSize || 'inherit',
    color: contentColor || 'inherit',
  };

  const cardStyle = {
    backgroundColor: color,
    backgroundImage: gradient, // Ex: 'linear-gradient(to right,rgb(158, 146, 143),rgba(226, 98, 0, 0.93))'
  };

  return (
    <div 
      className={`${styles.card} ${styles[variant]}`} 
      onClick={onClick}
      style={cardStyle}
    >     
      <div className={styles.content}>
        {title && (
          <div className={styles.titleContainer}>
            <p className={styles.title} style={titleStyle}>{title}</p>
            {icon && <div className={styles.iconContainer}>{icon}</div>}
          </div>
        )}
        {content && <p className={styles.text} style={contentStyle}>{content}</p>}
        {children}
      </div>
      
      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  icon: PropTypes.node,
  actions: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'outlined', 'elevated']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  color: PropTypes.string,
  gradient: PropTypes.string,
  fontSize: PropTypes.string,
  titleColor: PropTypes.string,
  contentColor: PropTypes.string,
};

export default Card;
