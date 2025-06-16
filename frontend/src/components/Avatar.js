import React from "react";
import style from "./Avatar.module.scss";
import clsx from "clsx";
import {tops as hairs, shapes, faces} from "../data/avatarV2";

const Avatar = (
  {
    faceIndex,
    hairIndex,
    visibleHair = true,
    visibleFace = true,
    width = 100,
    opacity = 1,
  }) => {
  const faceIndicesForShape2 = [3];
  return (
    <div className={clsx(style.Wrapper)} style={{height: `${width * 0.88}px`, opacity}}>
      {
        visibleHair &&
        <img src={hairs[hairIndex ?? 0].default} className={clsx(style.Hair)} style={{width: `${width}px`}} draggable={false} alt="hair"/>
      }
      <img src={shapes[faceIndicesForShape2.includes(faceIndex) ? 1 : 0].default} className={clsx(style.Shape)} style={{width: `${width}px`}} draggable={false} alt="shape"/>
      {
        visibleFace &&
        <img src={faces[faceIndex ?? 0].default} className={clsx(style.Face)} style={{width: `${width}px`}} draggable={false} alt="face"/>
      }
    </div>
  )
};

export default Avatar;