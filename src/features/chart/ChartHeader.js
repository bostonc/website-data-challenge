import React from "react";
// import styles from "./Chart.module.css";

// TODO: Implement
export const ChartHeader = ({ text }) => {
  const mystyle = {
    textAlign:"center",
    fontSize:"x-large",
    borderStyle: "solid",
    borderWidth: "thin",
    marginLeft: "20px",
    marginRight: "20px",
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
    padding: "10px"
  }
  return (<h1 className='title' style={mystyle}>{text}</h1>)
};
