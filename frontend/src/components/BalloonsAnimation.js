import React from "react";
import Animation from "./Animation";
import clsx from "clsx";
import style from "./BalloonsAnimation.module.scss";
import {useAnimationContext} from "../providers/AnimationProvider";
import {useGameContext} from "../providers/GameProvider";
import data from "../data";

const BalloonsAnimation = () => {
  const {remainingGuesses} = useGameContext();
  const {balloonsVisible, setBalloonsVisible} = useAnimationContext();
  const numberOfBurstFrames = {"7": 20, "6": 20, "5": 20, "4": 21, "3": 24, "2": 31};
  const numberOfBurstFrame = numberOfBurstFrames[(remainingGuesses + 1).toString()] - 1;

  return (
    <div className={clsx(style.Wrapper)}>
      {
        balloonsVisible.idle &&
        <div className={clsx(style.IdleWrapper)} key="balloons">
          <Animation
            id="balloonsVisible.idle"
            atlasName="animations_3_atlas"
            imageName="animations_3_image"
            path="balloons/frame_"
            start={remainingGuesses}
            count={0}
            fps={30}
            onLoad={() => {}}
          />
        </div>
      }

      {
        balloonsVisible.burst &&
        <div className={clsx(style.BurstWrapper)} key="balloons">
          <Animation
            id="balloonsVisible.burst"
            atlasName="animations_3_atlas"
            imageName="animations_3_image"
            path={`balloons_burst_${remainingGuesses + 1}/frame_`}
            start={1}
            count={numberOfBurstFrame}
            fps={30}
            onLoad={() => {
              setBalloonsVisible({idle: true});
            }}
            onWillLoad={() => {}}
          />
        </div>
      }

      {
        balloonsVisible.fly &&
        <div className={clsx(style.FlyWrapper)}>
          <Animation
            id="balloonsVisible.fly"
            atlasName="animations_6_atlas"
            imageName="animations_6_image"
            path={`balloon_fly_${remainingGuesses}/frame_`}
            start={1}
            count={16}
            fps={30}
            onLoad={() => {}}
            onWillLoad={() => {}}
          />
        </div>
      }

      <img src={data["animations_3_image"]} className={clsx(style.Hidden)} alt="animation 3"/>
      <img src={data["animations_6_image"]} className={clsx(style.Hidden)} alt="animation 6"/>
    </div>
  )
}

export default BalloonsAnimation;