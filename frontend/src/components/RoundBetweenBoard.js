import React, {useEffect} from "react";
import clsx from "clsx";
import style from "./RoundBetweenBoard.module.scss";
import {useGameContext} from "../providers/GameProvider";
import solveIcon from "../assets/images/mark_check.png";
import failIcon from "../assets/images/mark_fail.png";
import Avatar from "./Avatar";
import {useAudioContext} from "../providers/AudioProvider";

const RoundBetweenBoard = (
  {
    visible,
  }) => {
  const {playerList, visibleMode, activeRound, countdown, numberOfRounds} = useGameContext();
  const orderedPlayerList = playerList?.sort((a, b) => (b.roundScore ?? 0) - (a.roundScore ?? 0));
  const {playSound} = useAudioContext();

  useEffect(() => {
    if (visible) {
      playSound('round-end');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <div className={clsx(style.Wrapper, visible ? style.Visible : style.Hidden)}>
      <div className={clsx(style.Upper)}>
        <div className={clsx(style.Header)}>
          <span>PUZZLE {activeRound} of {numberOfRounds}</span>
        </div>

        <div className={clsx(style.Body)}>
          {
            orderedPlayerList?.map((player, index) => (
              <div key={`round-between-player-${index}`} className={clsx(style.Player)}>
                <div className={clsx(style.Avatar)}>
                  <Avatar
                    faceIndex={player.faceIndex}
                    hairIndex={player.hairIndex}
                    width={65}
                  />
                </div>

                <div className={clsx(style.Name)}>
                  {player.name}
                </div>

                <div className={clsx(style.RoundScore)}>
                <span>
                  +{player.roundScore ?? 0}
                </span>
                </div>

                <div className={clsx(style.Status)}>
                  {
                    player.solved ?
                      <img src={solveIcon} alt="solve" className={clsx(style.StatusImage)}/>
                      : <img src={failIcon} alt="fail" className={clsx(style.StatusImage)}/>
                  }
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className={clsx(style.Footer)}>
        {
          visibleMode === "round-between" ?
            <span>NEXT PUZZLE STARTING IN {countdown ?? 0}s</span> :
            <span>CALCULATING FINAL SCORES...</span>
        }
      </div>
    </div>
  )
}

export default RoundBetweenBoard;