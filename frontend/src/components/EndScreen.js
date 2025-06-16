import React, {useEffect, useRef} from "react";
import clsx from "clsx";
import style from "./EndScreen.module.scss";
import avatar from "../assets/images/player_icon0001.png";
import balloon1 from "../assets/images/balloon1.png";
import balloon2 from "../assets/images/balloon2.png";
import balloon3 from "../assets/images/balloon3.png";
import balloon4 from "../assets/images/balloon4.png";
import balloon5 from "../assets/images/balloon5.png";
import balloon6 from "../assets/images/balloon6.png";
import balloon7 from "../assets/images/balloon7.png";

let interval = null;

const EndScreen = (
  {
    visible,
  }) => {
  const ref = useRef(null);
  const numberOfParticles = 1;
  useEffect(() => {
    if (visible) {
      interval = setInterval(() => {
        createParticles();
      }, 300);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [visible]);

  const createParticles = () => {
    const rect = ref.current?.getBoundingClientRect();
    const x = rect?.left + (rect?.width) / 2 + 100;
    const y = -100;
    for (let i = 0; i < numberOfParticles; i++) {
      createParticle(x + (Math.random() - 0.5) * 300, y);
    }
  };

  const createParticle = (x, y) => {
    const particle = document.createElement('particle');
    document.body.appendChild(particle);
    let width = Math.floor(Math.random() * 100 + 30);
    const height = width;
    let destinationX = (Math.random() - 0.5) * 300;
    let destinationY = -1 * (Math.random()) * 300;
    let delay = Math.random() * 200;
    const balloons = [balloon1, balloon2, balloon3, balloon4, balloon5, balloon6, balloon7];
    const balloon = balloons[Math.floor(Math.random() * balloons.length)];
    particle.style.backgroundImage = `url(${balloon})`;
    particle.style.backgroundRepeat = "no-repeat";
    particle.style.backgroundSize = "contain";
    particle.style.width = `${width}px`;
    particle.style.height = `${height}px`;
    particle.style.position = "absolute";
    particle.style.left = "-100px";

    const animation = particle.animate([
      {
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(0deg)`,
        opacity: 1
      },
      {
        transform: `translate(-50%, -50%) translate(${x + destinationX}px, ${y + destinationY + 30}px) rotate(${0}deg)`,
        opacity: 1
      },
      {
        transform: `translate(-50%, -50%) translate(${x + destinationX}px, ${y + destinationY}px) rotate(${0}deg)`,
        opacity: 0
      },
    ], {
      duration: Math.random() * 1000 + 5000,
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
    <div className={clsx(style.Wrapper, visible ? style.Visible : '')} ref={ref}>
      <div className={clsx(style.Winner)}>
        <div className={clsx(style.WinnerImageWrapper)}>
          <img className={clsx(style.WinnerImage)} src={avatar} alt="avatar" />
        </div>

        <div className={clsx(style.WinnerText)}>
          <span>
            OPTIMISTIC HONEY BADGER WINS!
          </span>
        </div>
      </div>

      <div className={clsx(style.Footer)}>
        <span>NEXT GAME STARTING IN 30s</span>
      </div>
    </div>
  )
}

export default EndScreen;