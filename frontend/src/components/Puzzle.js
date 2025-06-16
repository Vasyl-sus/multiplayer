import clsx from "clsx";
import style from "./Puzzle.module.scss";
import React from "react";
import {useGameContext} from "../providers/GameProvider";
import {useAnimationContext} from "../providers/AnimationProvider";

const Puzzle = () => {
  const {puzzleStatus, hint, visibleMode} = useGameContext();
  const {heroVisible} = useAnimationContext();
  const startAnimation = heroVisible.jump || heroVisible.walk;
  const visiblePuzzle = (!["end-game", "wait-after-end"].includes(visibleMode) && !startAnimation);
  const visiblePuzzleLetter = ["end-before", "round-between"].includes(visibleMode);

  return (
    visiblePuzzle ? (
      <div className={clsx(style.Wrapper)}>
        <div className={clsx(style.Hint)}>
        <span>
          {hint}
        </span>
        </div>
        <div className={clsx(style.Puzzle)}>
          {
            puzzleStatus?.map((it, index) => {
              let ret = (
                <div className={clsx(style.PuzzleLetterWrapper)} key={`puzzle-letter-${index}`}>
                  <div className="puzzle-letter"><span>&nbsp;</span></div>
                </div>
              );
              switch (it.type) {
                case "letter":
                  ret = (
                    <div className={clsx(style.PuzzleLetterWrapper)} key={`puzzle-letter-${index}`}>
                      <div className="puzzle-letter"><h1>{it.value}</h1></div>
                    </div>
                  );
                  break;
                case "underline":
                  if (visiblePuzzleLetter) {
                    ret = (
                      <div className={clsx(style.PuzzleLetterWrapper)} key={`puzzle-letter-${index}`}>
                        <div className="puzzle-letter"><h1>{it.value}</h1></div>
                      </div>
                    );
                  } else {
                    ret = (
                      <div className={clsx(style.PuzzleLetterWrapper)} key={`puzzle-letter-${index}`}>
                        <div className="puzzle-letter underline"/>
                      </div>
                    );
                  }
                  break;
                case "space":
                  break;
                default:

              }
              return ret;
            })
          }
        </div>
      </div>
    ) : (
      <div className={clsx(style.Wrapper)}/>
    )
  )
};

export default Puzzle;