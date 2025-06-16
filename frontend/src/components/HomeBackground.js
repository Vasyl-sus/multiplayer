import React, {useEffect, useState, useRef} from "react";
import clsx from "clsx";
import style from "./HomeBackground.module.scss";
import frames from "../data";

const HomeBackground = () => {
  const canvas = useRef(null);
  const img = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [backImage, setBackImage] = useState(null);
  const trees = [
    "tree_0002",
    "tree_0001",
    "tree_0005",
    "tree_0001",
    "tree_0004",
    "tree_0002",
    "tree_0001",
    "tree_0003",
    "tree_0004",
    "tree_0003",
    "tree_0002",
    "tree_0005",
    "tree_0004",
    "tree_0003",
    "tree_0004",
  ];
  const bushes = [
    'bush_0002',
    'bush_0004',
    'bush_0008',
    'bush_0003',
    'bush_0007',
    'bush_0004',
    'bush_0002',
    'bush_0004',
    'bush_0001',
    'bush_0005',
    'bush_0005',
    'bush_0009',
    'bush_0006',
    'bush_0008',
    'bush_0003',
  ];
  const bushesForRight = [
    'bush_0008',
    'bush_0002',
    'bush_0005',
    'bush_0007',
    'bush_0004',
    'bush_0002',
    'bush_0008',
    'bush_0002',
    'bush_0008',
    'bush_0002',
    'bush_0006',
    'bush_0009',
    'bush_0005',
    'bush_0006',
    'bush_0009',
  ];

  useEffect(() => {
    if (loaded) {
      setBackImage(drawOnCtx(canvas.current, trees, bushes, bushesForRight));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const drawOnCtx = (canvasElement, treeList, bushList, rightBushList) => {
    const ctx = canvasElement.getContext("2d");

    treeList.forEach((tree, index) => {
      const data = frames["texture_atlas"].frames[`Scene/elements/${tree}.png`];
      const width = data.frame.w;
      const height = data.frame.h;
      const spriteX = data.spriteSourceSize.x;
      const spriteY = data.spriteSourceSize.y;
      ctx.drawImage(img.current, data.frame.x, data.frame.y, width, height, spriteX + 140 * index, spriteY, width, height);
    });

    bushList.forEach((bush, index) => {
      const data = frames["texture_atlas"].frames[`Scene/elements/${bush}.png`];
      const width = data.frame.w;
      const height = data.frame.h;
      const spriteX = data.spriteSourceSize.x;
      const spriteY = data.spriteSourceSize.y;
      ctx.drawImage(img.current, data.frame.x, data.frame.y, width, height, spriteX + 140 * index, spriteY + 460, width, height);
    });

    // draw road
    ctx.beginPath();
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 568, 2200, 50);

    ctx.globalAlpha = 0.4;
    rightBushList.forEach((bush, index) => {
      const data = frames["texture_atlas"].frames[`Scene/elements/${bush}.png`];
      const width = data.frame.w;
      const height = data.frame.h;
      const spriteX = data.spriteSourceSize.x;
      const spriteY = data.spriteSourceSize.y;
      ctx.drawImage(img.current, data.frame.x, data.frame.y, width, height, spriteX + 140 * index + 70, spriteY + 540, width, height);
    });

    return canvasElement.toDataURL();
  };

  return (
    <>
      <div className={clsx(style.Test)} style={{backgroundImage: `url(${backImage})`}}/>
      <canvas ref={canvas} width={2200} height={800} style={{display: 'none'}}/>
      <img
        ref={img}
        src={frames.texture_image}
        alt="texture"
        style={{display: 'none'}} onLoad={() => setLoaded(true)}
      />
    </>
  )
}

export default HomeBackground;
