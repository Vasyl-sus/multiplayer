import React, {useEffect, useState, useRef} from "react";
import clsx from "clsx";
import style from "./EndScreenV2.module.scss";
import Animation from "../components/Animation";
import balloon1 from "../assets/images/balloon-line0001.png";
import balloon2 from "../assets/images/balloon-line0002.png";
import balloon3 from "../assets/images/balloon-line0003.png";
import balloon4 from "../assets/images/balloon-line0004.png";
import balloon5 from "../assets/images/balloon-line0005.png";
import balloon6 from "../assets/images/balloon-line0006.png";
import balloon7 from "../assets/images/balloon-line0007.png";
import {useGameContext} from "../providers/GameProvider";
import Avatar from "./Avatar";
import Button from "./Button";
import {useAudioContext} from "../providers/AudioProvider";

let interval = null;
let timeout = null;

const EndScreenV2 = (
  {
    visible,
  }) => {
  const ref = useRef(null);
  const [status, _setStatus] = useState(''); // appear | float | disappear | hide
  const statusRef = useRef(status);
  const {playSound} = useAudioContext();
  const setStatus = (val) => {
    _setStatus(val);
    statusRef.current = val;
  };
  const {
    countdown,
    topScorer,
    visibleMode,
    host,
    session,
    restart,
    redirectLobby,
  } = useGameContext();
  const amIHost = (host?.playerId === session);

  useEffect(() => {
    if (visible) {
      playSound('game-end');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setStatus("appear");
      timeout = setTimeout(() => {
        setStatus("float");
      }, 2000);

      interval = setInterval(() => {
        !["hide"].includes(statusRef.current) &&
        createParticle();
      }, 50);
    } else {
      interval && clearInterval(interval);
      timeout && clearTimeout(timeout);
    }

    return () => {
      interval && clearInterval(interval);
      timeout && clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (visible && countdown?.toString() === '5' && visibleMode === "end-game") {
      // setStatus("disappear");
      setTimeout(() => {
        // setStatus("hide");
      }, 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const createParticle = () => {
    const x = (ref.current?.offsetWidth) / 2;
    const finalX = x + (Math.random() - 0.5) * x;
    const y = 400;
    const particle = document.createElement('particle');
    ref.current?.appendChild(particle);
    let width = Math.floor(Math.random() * 150 + 30);
    let destinationX = 0;
    let destinationY = -1500;
    let delay = Math.random() * 200;
    const balloons = [balloon1, balloon2, balloon3, balloon4, balloon5, balloon6, balloon7];
    const balloon = balloons[Math.floor(Math.random() * balloons.length)];
    particle.style.backgroundImage = `url(${balloon})`;
    particle.style.backgroundRepeat = "no-repeat";
    particle.style.backgroundSize = "contain";
    particle.style.width = `${width}px`;
    particle.style.height = `${width}px`;
    particle.style.position = "absolute";
    particle.style.zIndex = `${width}`;
    particle.style.top = "500px";
    particle.style.left = `0`;


    const animation = particle.animate([
      {
        transform: `translate(-50%, -50%) translate(${finalX}px, ${y}px) rotate(0deg)`,
        opacity: 1
      },
      {
        transform: `translate(-50%, -50%) translate(${finalX + destinationX}px, ${y + destinationY}px) rotate(${0}deg)`,
        opacity: 1
      },
      /*{
        transform: `translate(-50%, -50%) translate(${finalX + destinationX}px, ${y + destinationY}px) rotate(${0}deg)`,
        opacity: 0
      },*/
    ], {
      duration: (Math.random() * 1000 + 4000 / width * 180),
      easing: 'ease-out',
      // easing: 'cubic-bezier(0, .9, .57, 1)',
      delay: delay
    });
    animation.onfinish = removeParticle;
  }

  function removeParticle(e) {
    e.srcElement.effect.target.remove();
  }

  return (
    <div
      ref={ref}
      className={clsx(style.Wrapper, visible ? style.Visible : style.Hidden)}
    >
      {
        !topScorer?.tied &&
        !["hide"].includes(status) &&
        <div
          className={clsx(
            style.Winner,
            status === 'appear' && style.Appear,
            status === 'float' && style.Float,
            status === 'disappear' && style.Disappear,
          )}
        >
          <div
            className={clsx(style.BalloonIdleWrapper)}
            key="balloons"
          >
            <Animation
              id="balloonsVisible.idle"
              atlasName="animations_3_atlas"
              imageName="animations_3_image"
              path="balloons/frame_"
              start={7}
              count={0}
              fps={30}
              onLoad={() => {
              }}
            />
          </div>
          <div className={clsx(style.Box)}>
            {/*<img className={clsx(style.Avatar)} src={avatars[topScorer?.avatarIndex ?? 0]}/>*/}
            <Avatar
              faceIndex={topScorer?.faceIndex ?? 0}
              hairIndex={topScorer?.hairIndex ?? 0}
              width={140}
            />
          </div>
        </div>
      }
      {
        ["float"/*, 'disappear'*/].includes(status) &&
        <div className={clsx(style.WinnerText, topScorer?.tied ? style.Higher : null)}>
          {topScorer?.text}
        </div>
      }

      <div className={clsx(style.Pseudo)}>

      </div>
      {/*public game countdown*/}
      {
        ["end-game"].includes(visibleMode) &&
        ["float"/*, 'disappear'*/].includes(status) &&
        <div className={clsx(style.Footer)}>
          <span className={clsx(style.WaitingText)}>Next game will start in {countdown}s...</span>
        </div>
      }
      {/*private game footer*/}
      {
        ["float"/*, 'disappear'*/].includes(status) &&
        ["wait-after-end"].includes(visibleMode) &&
        <div className={clsx(style.Footer)}>
          {
            amIHost ?
              <>
                <Button className={clsx(style.Button, style.BtnAgain)} onClick={restart}>
                  <span>
                    Play Again
                  </span>
                </Button>

                <Button className={clsx(style.Button, style.BtnReturn)} onClick={redirectLobby}>
                  <span>
                    Return to Lobby
                  </span>
                </Button>
              </> : (
                <span className={clsx(style.WaitingText)}>Waiting for host to start next game</span>
              )
          }
        </div>
      }
    </div>
  )
}

export default EndScreenV2;
