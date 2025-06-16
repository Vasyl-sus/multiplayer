import React from "react";
import clsx from "clsx";
import style from "./PlayerList.module.scss";
import {useGameContext} from "../providers/GameProvider";
import PlayerItem from "./PlayerItem";

const PlayerList = () => {
  const {playerList, numberOfRounds, activeRound} = useGameContext();

  return (
    <div className={clsx(style.PlayerList)}>
      <div className={clsx(style.PlayerListHeader)}>
        <label>PUZZLE {activeRound} of {numberOfRounds}</label>
      </div>

      <div className={clsx(style.PlayerListBody)}>
        {
          playerList?.map((player) => (
            <PlayerItem player={player} key={`player-${player.id}`}/>
          ))
        }
      </div>
    </div>
  )
};

export default PlayerList;