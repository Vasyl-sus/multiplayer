import React, {useState, useEffect, useRef} from "react";
import clsx from "clsx";
import style from "./Animation.module.scss";
import frames from "../data";

const Animation = (
  {
    id,
    atlasName,
    imageName,
    path,
    start,
    count,
    fps,
    iterative,
    customStyle,
    actionsWhileRendering,
    onLoad,
    onWillLoad,
    onPreWillLoad,
  }) => {
  const [monster, setMonster] = useState({});
  const [monsterWrapper, setMonsterWrapper] = useState({});
  const interval = useRef(null);

  useEffect(() => {
    renderMonster();

    return () => {
      clearInterval(interval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, atlasName, imageName, path, start, count, fps]);

  const renderMonster = () => {
    let i = start;
    let cnt = count;
    interval.current = setInterval(() => {
      const index = i?.toLocaleString("en-US", {
        minimumIntegerDigits: 4,
        useGrouping: false,
      });

      const wrapperStyle = {
        width: frames[atlasName].frames[`${path}${index}.png`]?.sourceSize.w + 'px',
        height: frames[atlasName].frames[`${path}${index}.png`]?.sourceSize.h + 'px',
      };

      switch (id) {
        /*case "heroVisible.walkInfinite":
          wrapperStyle["marginLeft"] = '92px';
          wrapperStyle["marginTop"] = '126px';
          break;
        case "heroVisible.walk":
          wrapperStyle["marginLeft"] = '-19px';
          wrapperStyle["marginTop"] = '-10px';
          break;
        case "heroVisible.jump":
          wrapperStyle["marginLeft"] = '-19px';
          wrapperStyle["marginTop"] = '-273px';
          break;*/
        case "heroVisible.idle":
          wrapperStyle["marginLeft"] = '92px';
          wrapperStyle["marginTop"] = '-94px';
          break;
        case "heroVisible.burst":
          wrapperStyle["marginLeft"] = '66px';
          wrapperStyle["marginTop"] = '-100px';
          break;
        /*case "heroVisible.lose":
          wrapperStyle["marginTop"] = '-284px';
          wrapperStyle["marginLeft"] = '71px';
          break;
        case "heroVisible.correct":
          wrapperStyle["marginTop"] = '-94px';
          wrapperStyle["marginLeft"] = '92px';
          break;
        case "heroVisible.win":
          wrapperStyle["marginLeft"] = '-4px';
          wrapperStyle["marginTop"] = '-98px';
          break;*/
        case "balloonsVisible.idle":
          wrapperStyle["marginLeft"] = '0';
          wrapperStyle["marginTop"] = '0';
          break;
        case "balloonsVisible.burst":
          wrapperStyle["marginLeft"] = '-22px';
          wrapperStyle["marginTop"] = '38px';
          break;
        /*case "balloonsVisible.fly":
          wrapperStyle["marginLeft"] = '-31px';
          wrapperStyle["marginTop"] = '-144px';
          break;*/
        /*case "monsterVisible.appear":
          wrapperStyle["marginLeft"] = '0px';
          wrapperStyle["marginTop"] = '0px';
          break;
        case "monsterVisible.idle":
          wrapperStyle["marginLeft"] = '23px';
          wrapperStyle["marginTop"] = '97px';
          break;*/
        case "monsterVisible.eat":
          wrapperStyle["marginLeft"] = '27px';
          wrapperStyle["marginTop"] = '34px';
          break;
        case "monsterVisible.chew":
          wrapperStyle["marginLeft"] = '98px';
          wrapperStyle["marginTop"] = '116px';
          break;
        /*case "monsterVisible.toIdle":
          wrapperStyle["marginLeft"] = '30px';
          wrapperStyle["marginTop"] = '96px';
          break;
        case "monsterVisible.death":
          wrapperStyle["marginLeft"] = '40px';
          wrapperStyle["marginTop"] = '139px';
          break;*/
        default:
      }

      setMonster({
        backgroundPosition: '-' + frames[atlasName].frames[`${path}${index}.png`]?.frame.x + 'px -'
          + frames[atlasName].frames[`${path}${index}.png`]?.frame.y + 'px',
        top: frames[atlasName].frames[`${path}${index}.png`]?.spriteSourceSize.y + 'px',
        left: frames[atlasName].frames[`${path}${index}.png`]?.spriteSourceSize.x + 'px',
        width: frames[atlasName].frames[`${path}${index}.png`]?.frame.w + 'px',
        height: frames[atlasName].frames[`${path}${index}.png`]?.frame.h + 'px',
      });
      setMonsterWrapper(wrapperStyle);


      if (cnt === 0) {
        if (iterative) {
          cnt = count;
          i = start;
        } else {
          onLoad && onLoad();
          clearInterval(interval.current);
        }
      } else {
        if (cnt === 1 && !iterative)
          onWillLoad && onWillLoad();

        if (cnt === 2 && !iterative)
          onPreWillLoad && onPreWillLoad();

        i++;
        cnt--;
      }

      actionsWhileRendering?.[cnt] && actionsWhileRendering?.[cnt]();
    }, 1000 / fps);
  };

  return (
    <div className={clsx(style.MonsterWrapper)} style={{...monsterWrapper, ...customStyle}}>
      <div className={style.MonsterStart} style={{backgroundImage: `url(${frames[imageName]})`, ...monster}}>

      </div>
    </div>
  )
};

export default Animation;