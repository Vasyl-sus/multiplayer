import React from "react";
import clsx from "clsx";
import style from "./Animations.module.scss";
import MonsterAnimation from "./MonsterAnimation";
import HeroAnimation from "./HeroAnimation";
import BalloonsAnimation from "./BalloonsAnimation";

const Animations = () => {
  return (
    <div className={clsx(style.Wrapper)}>
      <div className={clsx(style.Monster)}>
        <MonsterAnimation/>
      </div>

      <div className={clsx(style.Balloons)}>
        <BalloonsAnimation/>
      </div>

      <div className={clsx(style.Hero)}>
        <HeroAnimation/>
      </div>
    </div>
  )
}

export default Animations;