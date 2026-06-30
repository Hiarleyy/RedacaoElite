import React from "react";
import style from "./style.module.css";

const Card = ({ label, value }) => {
  return (
    <div className={style.card}>
      <p> {label} </p>
      <p>{value}</p>
    </div>
  );
};

export default Card;
