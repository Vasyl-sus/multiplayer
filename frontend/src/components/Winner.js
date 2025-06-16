import React, {useState, useEffect, useRef} from "react";
import {useGameContext} from "../providers/GameProvider";
import clsx from "clsx";
import style from "./Winner.module.scss";

const Winner = () => {
  const {winner, visibleWinner} = useGameContext();
  const [mode, setMode] = useState('winner'); // winner or waiting
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (visibleWinner) {
      setMode('winner');
      timeoutRef.current = setTimeout(() => {
        setMode('waiting');
      }, 5000);
    }

    return () => {
      timeoutRef.current && clearTimeout(timeoutRef.current);
    };
  }, [visibleWinner]);

  return (
    visibleWinner &&
    <div className={clsx(style.Winner)}>
      {
        mode === 'winner' ?
          <span>
            {winner?.name} solved the puzzle first!
          </span> :
          <span>
            Waiting for all players to finish the puzzle
          </span>
      }
    </div>
  )
}

export default Winner;