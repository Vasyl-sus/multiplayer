class Resize {
  resize(ref, initialWidth, initialHeight) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const widthRatio = width / initialWidth;
    const heightRatio = height / initialHeight;
    let ratio = 1;

    if (widthRatio < heightRatio && widthRatio < 1) {
      ratio = width / initialWidth;
      ref.current.style.transformOrigin = "left top";
    } else if (heightRatio < widthRatio && heightRatio < 1) {
      ratio = height / initialHeight;
      ref.current.style.transformOrigin = "top left";
    }

    ref.current.style.transform = `scale(${ratio})`;

    document.body.style.height = (height) + "px";
    document.body.style.width = (width) + "px";
    document.body.style.overflow = "hidden";

    document.getElementById("root").style.height = initialHeight * ratio + "px";
    document.getElementById("root").style.width = initialWidth * ratio + "px";
  }
}

export default Resize;