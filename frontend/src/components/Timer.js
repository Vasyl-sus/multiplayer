import React, {useEffect} from "react";
import clsx from "clsx";
import style from "./Timer.module.scss";
import {useGameContext} from "../providers/GameProvider";
import {useAudioContext} from "../providers/AudioProvider";

const Timer = () => {
  const {countdown, visibleCountDown} = useGameContext();
  const {playSound} = useAudioContext();
  useEffect(() => {
    if (visibleCountDown) {
      playSound('timer-appear');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCountDown]);
  useEffect(() => {
    if (countdown <= 5 && countdown >= 1 && visibleCountDown) {
      playSound('timer-click');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, visibleCountDown]);

  return (
    visibleCountDown && (
      countdown === 0 ?
        (
          <div className={clsx(style.Timer)}>
            <div className={clsx(style.TimerInner)} style={{width: `${countdown / 20 * 100}%`}}>

            </div>
            <span className={clsx(style.TimerText)}>
              Time’s Up!
            </span>
          </div>
        ) : (
          <div className={clsx(style.Timer)}>
            <div className={clsx(style.TimerInner)} style={{width: `${countdown / 20 * 100}%`}}>

            </div>

            <span className={clsx(style.TimerText)}>
              time left: {countdown}
            </span>
          </div>
        )
    )
  )
};

export default Timer;