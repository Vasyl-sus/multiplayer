import React, {useState, useEffect} from "react";
import Animation from "./Animation";
import clsx from "clsx";
import style from "./HeroAnimation.module.scss";
import {useAnimationContext} from "../providers/AnimationProvider";
import {useGameContext} from "../providers/GameProvider";
import data from "../data";
import {useAudioContext} from "../providers/AudioProvider";

const HeroAnimation = () => {
  const {heroVisible, setHeroVisible, setMonsterVisible, setBalloonsVisible} = useAnimationContext();
  const {remainingGuesses, setRendering} = useGameContext();
  const remainingGuessesRef = React.useRef(remainingGuesses);
  const [idle, setIdle] = useState(0);
  const idles = [1, 2, 4];
  const numberOfBurstFrames = {"7": 20, "6": 20, "5": 19, "4": 21, "3": 24, "2": 31};
  const numberOfBurstFrame = numberOfBurstFrames[(remainingGuesses + 1).toString()] - 1;
  const numberOfIdleFrames = {"1": 34, "2": 12, "3": 42, "4": 58};
  const numberOfIdleFrame = numberOfIdleFrames[(idle + 1).toString()] - 1;
  const {playSound} = useAudioContext();

  useEffect(() => {
    // if not first time and wasted
    if (!([remainingGuessesRef.current, 7].includes(remainingGuesses))) {
      playSound('wrong-letter');
      setHeroVisible({burst: true});
      setBalloonsVisible({burst: true});
      setRendering(true);
      setTimeout(() => {
        setRendering(false);
      }, 930);
      remainingGuessesRef.current = remainingGuesses;
    }

    if (remainingGuesses === 0) {
      setRendering(true);
      setTimeout(() => {
        setRendering(false);
      }, 840);
      setHeroVisible({lose: true});
      setMonsterVisible({eat: true});
      setBalloonsVisible({});
      setTimeout(() => {
        playSound('monster-chomp');
      }, 240);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingGuesses]);

  const pickNextIdle = () => {
    // const randomAction = Math.floor(Math.random() * idles.length);
    // setIdle(randomAction);
    setIdle(prevState => (prevState + 1) % 3);
  }

  const actionsWhileRendering = {
    73: () => {
      setMonsterVisible({death: true});
      playSound('monster-dead');
    }
  };

  return (
    <div className={clsx(style.Wrapper)}>
      {
        heroVisible.walkInfinite &&
        <div className={clsx(style.WalkNoBalloonsWrapper)}>
          <Animation
            id="heroVisible.walkInfinite"
            atlasName="animations_5_atlas"
            imageName="animations_5_image"
            path="hero_walk_no_balloons/frame_"
            start={1}
            count={25}
            fps={30}
            iterative={true}
            onWillLoad={() => {}}
            onLoad={() => {}}
          />
        </div>
      }
      {
        heroVisible.walk &&
        <div className={clsx(style.WalkWrapper)}>
          <Animation
            id="heroVisible.walk"
            atlasName="animations_9_atlas"
            imageName="animations_9_image"
            path="hero_walk_7/frame_"
            start={1}
            count={26}
            fps={30}
            onPreWillLoad={() => {
              setHeroVisible({walk: true, jump: true});
            }}
            onWillLoad={() => {}}
            onLoad={() => {
              setMonsterVisible({appear: true});
              setHeroVisible({jump: true});
              playSound('monster-appear');
            }}
          />
        </div>
      }
      {
        heroVisible.jump &&
        <div className={clsx(style.JumpWrapper)}>
          <Animation
            id="heroVisible.jump"
            atlasName="animations_8_atlas"
            imageName="animations_8_image"
            path="hero_jump_7/frame_"
            start={1}
            count={46}
            fps={30}
            onPreWillLoad={() => {
              setBalloonsVisible({idle: true});
              setHeroVisible({jump: true, idle: true});
            }}
            onWillLoad={() => {}}
            onLoad={() => {
              playSound('play');
              setHeroVisible({idle: true});
            }}
          />
        </div>
      }
      {
        heroVisible.idle &&
        <div className={clsx(idles[idle] === 3 ? style.OtherIdleWrapper : style.IdleWrapper)} key="hero">
          <Animation
            id="heroVisible.idle"
            atlasName="animations_2_atlas"
            imageName="animations_2_image"
            path={`hero_idle_${idles[idle]}/frame_`}
            start={1}
            count={numberOfIdleFrame}
            fps={30}
            onWillLoad={() => {}}
            onLoad={() => {
              pickNextIdle();
            }}
          />
        </div>
      }

      {
        heroVisible.burst &&
        <div className={clsx(style.BurstWrapper)} key="hero">
          <Animation
            id={"heroVisible.burst"}
            atlasName="animations_2_atlas"
            imageName="animations_2_image"
            path={`hero_balloons_burst_${remainingGuesses + 1}/frame_`}
            start={1}
            count={numberOfBurstFrame}
            fps={30}
            onLoad={() => {
              setHeroVisible({idle: true});
            }}
            onWillLoad={() => {}}
          />
        </div>
      }

      {
        heroVisible.win &&
        <div className={clsx(style.WinWrapper)}>
          <Animation
            id={"heroVisible.win"}
            atlasName="animations_5_atlas"
            imageName="animations_5_image"
            path={`hero_win/frame_`}
            start={1}
            count={87}
            fps={30}
            actionsWhileRendering={actionsWhileRendering}
            onPreWillLoad={() => {
              setHeroVisible({win: true, walkInfinite: true});
            }}
            onWillLoad={() => {}}
            onLoad={() => {
              setHeroVisible({walkInfinite: true});
            }}
          />
        </div>
      }

      {
        heroVisible.lose &&
        <div className={clsx(style.LoseWrapper)}>
          <Animation
            id={"heroVisible.lose"}
            atlasName="animations_2_atlas"
            imageName="animations_2_image"
            path={`hero_lose/frame_`}
            start={1}
            count={8}
            fps={30}
            onLoad={() => {
              setHeroVisible({lose: false});
            }}
          />
        </div>
      }

      {
        heroVisible.correct &&
        <div className={clsx(style.CorrectWrapper)}>
          <Animation
            id={"heroVisible.correct"}
            atlasName="animations_2_atlas"
            imageName="animations_2_image"
            path={`hero_right_word/frame_`}
            start={1}
            count={26}
            fps={30}
            onWillLoad={() => {}}
            onLoad={() => {
              setHeroVisible({idle: true});
            }}
          />
        </div>
      }

      <img src={data["animations_2_image"]} className={clsx(style.Hidden)} alt="animation 2"/>
      <img src={data["animations_5_image"]} className={clsx(style.Hidden)} alt="animation 5"/>
      <img src={data["animations_8_image"]} className={clsx(style.Hidden)} alt="animation 8"/>
      <img src={data["animations_9_image"]} className={clsx(style.Hidden)} alt="animation 9"/>
    </div>
  )
}

export default HeroAnimation;