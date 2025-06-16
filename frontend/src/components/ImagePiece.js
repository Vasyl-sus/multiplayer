import React, {useEffect, useState} from "react";
import clsx from "clsx";
import style from "./ImagePiece.module.scss";
import frames from "../data";

const ImagePiece = (
  {
    atlasName,
    imageName,
    path,
  }) => {

  const [wrapperStyle, setWrapperStyle] = useState({});
  const [pieceStyle, setPieceStyle] = useState({});
  
  useEffect(() => {
    renderImagePiece();
  }, [atlasName, imageName, path]);
  
  const renderImagePiece = () => {
    const wrapperStyle = {
      width: frames[atlasName].frames[`${path}`]?.sourceSize.w + 'px',
      height: frames[atlasName].frames[`${path}`]?.sourceSize.h + 'px',
    };
    setWrapperStyle(wrapperStyle);
    const pieceStyle = {
      backgroundPosition: '-' + frames[atlasName].frames[`${path}`]?.frame.x + 'px -'
        + frames[atlasName].frames[`${path}`]?.frame.y + 'px',
      top: frames[atlasName].frames[`${path}`]?.spriteSourceSize.y + 'px',
      left: frames[atlasName].frames[`${path}`]?.spriteSourceSize.x + 'px',
      width: frames[atlasName].frames[`${path}`]?.frame.w + 'px',
      height: frames[atlasName].frames[`${path}`]?.frame.h + 'px',
    };
    setPieceStyle(pieceStyle);
  };
  
  return (
    <div className={clsx(style.Wrapper)} style={{...wrapperStyle}}>
      <div className={clsx(style.Piece)} style={{...pieceStyle, backgroundImage: `url(${frames[imageName]})`}}/>
    </div>
  )
}

export default ImagePiece;