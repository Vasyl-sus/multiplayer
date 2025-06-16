import React from "react";
import Animation from "./Animation";
import clsx from "clsx";
import style from "./MonsterAnimation.module.scss";
import {useAnimationContext} from "../providers/AnimationProvider";
import data from "../data";

const MonsterAnimation = () => {
  const {monsterVisible, setMonsterVisible} = useAnimationContext();

  return (
    <div className={clsx(style.Wrapper)}>
      {
        monsterVisible.appear &&
        <div className={clsx(style.JumpWrapper)}>
          <Animation
            id="monsterVisible.appear"
            atlasName="animations_4_atlas"
            imageName="animations_4_image"
            path="monster_start/frame_"
            start={1}
            count={44}
            fps={30}
            onWillLoad={() => setMonsterVisible({appear: true, idle: true})}
            onLoad={() => {
              setMonsterVisible({idle: true});
            }}
          />
        </div>
      }
      {
        monsterVisible.idle &&
        <div className={clsx(style.IdleWrapper)}>
          <Animation
            id="monsterVisible.idle"
            iterative={true}
            atlasName="animations_4_atlas"
            imageName="animations_4_image"
            path="monster_idle_1/frame_"
            start={1}
            count={35}
            fps={30}
            onLoad={() => {
            }}
          />
        </div>
      }
      {
        monsterVisible.eat &&
        <div className={clsx(style.EatWrapper)} key="monster">
          <Animation
            id="monsterVisible.eat"
            atlasName="animations_5_atlas"
            imageName="animations_5_image"
            path="monster_eat/frame_"
            start={1}
            count={28}
            fps={30}
            onLoad={() => {
              setMonsterVisible({chew: true});
            }}
          />
        </div>
      }

      {
        monsterVisible.chew &&
        <div className={clsx(style.ChewWrapper)} key="monster">
          <Animation
            id="monsterVisible.chew"
            atlasName="animations_5_atlas"
            imageName="animations_5_image"
            path="monster_chew/frame_"
            start={1}
            count={12}
            fps={30}
            onPreWillLoad={() => {
              setMonsterVisible({chew: true, toIdle: true});
            }}
            onLoad={() => {
              setMonsterVisible({toIdle: true})
            }}
          />
        </div>
      }

      {
        monsterVisible.toIdle &&
        <div className={clsx(style.ChewToIdleWrapper)}>
          <Animation
            id="monsterVisible.toIdle"
            atlasName="animations_10_atlas"
            imageName="animations_10_image"
            path="monster_eat_idle/frame_"
            start={0}
            count={39}
            fps={30}
            onPreWillLoad={() => {
              setMonsterVisible({idle: true, toIdle: true});
            }}
            onLoad={() => {
              setMonsterVisible({idle: true})
            }}
          />
        </div>
      }

      {
        monsterVisible.death &&
        <div className={clsx(style.DeathWrapper)}>
          <Animation
            id="monsterVisible.death"
            atlasName="animations_5_atlas"
            imageName="animations_5_image"
            path="monster_death/frame_"
            start={1}
            count={24}
            fps={30}
            onLoad={() => {
              setMonsterVisible({});
            }}
          />
        </div>
      }

      <img src={data["animations_5_image"]} className={clsx(style.Hidden)} alt="animation 5"/>
      <img src={data["animations_10_image"]} className={clsx(style.Hidden)} alt="animation 10"/>
      <img src={data["animations_4_image"]} className={clsx(style.Hidden)} alt="animation 4"/>
    </div>
  )
}

export default MonsterAnimation;

