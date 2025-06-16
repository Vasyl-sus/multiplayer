import React from "react";
import "../assets/css/loading.css";

function Loading({transparent}) {
  return (
    <div className={`backdrop ${transparent ? "transparent" : ""}`}>
      <div className={`lds-ellipsis`}>
        <div/>
        <div/>
        <div/>
        <div/>
      </div>
    </div>
  )
}

export default Loading;