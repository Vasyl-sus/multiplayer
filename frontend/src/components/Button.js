import React from "react";
import {useAudioContext} from "../providers/AudioProvider";

const Button = (
  {
    className,
    children,
    onClick,
  }) => {
  const {playSound} = useAudioContext();
  const handleClick = () => {
    playSound('click');
    setTimeout(() => {
      onClick && onClick();
    }, 150);
  };

  return (
    <div className={className} style={{cursor: 'pointer'}} onClick={handleClick}>
      {children}
    </div>
  );
};

export default Button;