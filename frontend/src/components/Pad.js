import React from "react";
import {useGameContext} from "../providers/GameProvider";
import style from "./Pad.module.scss";
import clsx from "clsx";
import {useAnimationContext} from "../providers/AnimationProvider";

const Pad = () => {
  const {padLetters, clickPad, ableToPick} = useGameContext();
  const {heroVisible} = useAnimationContext();
  const startAnimation = heroVisible.jump || heroVisible.walk;

  const handleClickPad = (letter) => {
    clickPad(letter);
  };

  return (
    !startAnimation &&
    <div className={clsx(style.Pad)}>
      {
        padLetters && padLetters.map((padLetter, index) => (
          <div className={clsx(style.WordWrapper)} key={`letter-${index}`}>
            <div
              className={clsx(style.Word, padLetter.used ? style.Used : '', ableToPick ? 'cursor-pointer' : 'cursor-default')}
              style={{...padLetter["style"]}}
              onClick={() => handleClickPad(padLetter["letter"])}
            />
            {
              padLetter["failed"] &&
              <div className={clsx(style.Cross)}/>
            }
          </div>
        ))
      }
    </div>
  )
};

export default Pad;