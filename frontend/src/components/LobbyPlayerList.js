import React from "react";
import clsx from "clsx";
import style from "./LobbyPlayerList.module.scss";
import {useGameContext} from "../providers/GameProvider";
import LobbyPlayerItem from "./LobbyPlayerItem";

const LobbyPlayerList = () => {
  const {playerListForLobby} = useGameContext();

  return (
    <div className={clsx(style.PlayerList)}>
      <div className={clsx(style.PlayerListHeader)}>
        <label>PLAYERS {playerListForLobby?.length ?? 1}/8</label>
      </div>

      <div className={clsx(style.PlayerListBody)}>
        {
          playerListForLobby?.map((player, index) => (
            <LobbyPlayerItem player={player} key={`player-${index}`}/>
          ))
        }
      </div>
    </div>
  )
};

export default LobbyPlayerList;