import React, {useEffect, useState, useRef} from "react";
import Modal from 'react-modal';
import clsx from "clsx";
import style from "./SettingModalV2.module.scss";
import replayIcon from "../assets/images/replay.png";
import buttonArrowLeft from "../assets/images/button_arrow_left.png";
import {useSettingContext} from "../providers/SettingProvider";
import {faces, tops as hairs} from "../data/avatarV2";
import Avatar from "./Avatar";
import Button from "./Button";

const SettingModalV2 = (
  {
    isPublic,
    isOpen,
    isAvailableGameContext,
    changeSetting,
    onSave,
    onClose,
  }) => {
  const {
    publicName,
    privateName,
    faceIndex,
    hairIndex,
    save,
    generateNewName,
    checkNameValidity,
    setVisibleModal,
  } = useSettingContext();
  const inputRef = useRef(null);
  const randomName = generateNewName();
  const [displayName, setDisplayName] = useState((isPublic ? publicName : privateName) ?? randomName);
  const randomFaceIndex = Math.floor(Math.random() * faces?.length);
  const randomHairIndex = Math.floor(Math.random() * hairs?.length);
  const [displayFaceIndex, setDisplayFaceIndex] = useState(faceIndex ?? randomFaceIndex);
  const [displayHairIndex, setDisplayHairIndex] = useState(hairIndex ?? randomHairIndex);
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    setDisplayName((isPublic ? publicName : privateName) ?? randomName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublic]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
    setNameError(null);
    setVisibleModal(isOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const saveSetting = () => {
    if (!displayName) {
      setNameError("Please type a name");
    } else if (displayFaceIndex !== undefined && displayHairIndex !== undefined) {
      if (!checkNameValidity(displayName)) {
        setNameError("That name is not allowed. Please type a new name");
        return;
      }
      save(displayName, displayHairIndex, displayFaceIndex, isPublic);
      // change name and avatar in room
      if (isAvailableGameContext) {
        changeSetting({name: displayName, hairIndex: displayHairIndex, faceIndex: displayFaceIndex});
      }
      onSave(displayName, displayHairIndex, displayFaceIndex);
    }
  };

  const showOtherName = () => {
    const randomName = generateNewName();
    setDisplayName(randomName);
    inputRef.current?.focus();
  };

  return (
    <Modal
      isOpen={isOpen}
      className={clsx(style.SettingModal)}
      overlayClassName={clsx(style.ModalOverlay)}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      appElement={document.getElementsByTagName("body")}
    >
      <Button className={clsx(style.Close)} onClick={onClose}>
        <span className={clsx(style.CloseIcon)}>✖</span>
      </Button>

      <div className="text-center">
        <h2>
          CUSTOMIZE
        </h2>
      </div>

      <div className={clsx(style.Content)}>
        <div className="d-flex justify-content-between">
          <div className={clsx(style.Name)}>
            {
              !isPublic ?
                <input
                  ref={inputRef}
                  type="text"
                  className={clsx(style.NameInput)}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                /> :
                <span>{displayName}</span>
            }
          </div>
          <Button onClick={showOtherName}>
            <img
              className={clsx(style.ReplayIcon, "cursor-pointer")}
              src={replayIcon}
              alt="refresh icon"
            />
          </Button>
        </div>

        <div className={clsx(style.AvatarPickArea)}>
          <div className={clsx(style.Previous)}>
            <div className={style.PreviewUnit}>
              <Button
                onClick={() => {
                  setDisplayHairIndex(prevState => (prevState - 1 + hairs.length) % hairs.length)
                }}
              >
                <img
                  className={clsx(style.Arrow)}
                  src={buttonArrowLeft} alt="arrow left"
                />
              </Button>
              <div className={clsx(style.TopAvatar)}>
                <Avatar
                  faceIndex={displayFaceIndex}
                  hairIndex={(displayHairIndex - 1 + hairs.length) % hairs.length}
                  width={60}
                  opacity={0.5}
                  visibleFace={false}
                />
              </div>
            </div>

            <div className={style.PreviewUnit}>
              <Button
                onClick={() => {
                  setDisplayFaceIndex(prevState => (prevState - 1 + faces.length) % faces.length)
                }}
              >
                <img
                  className={clsx(style.Arrow)}
                  src={buttonArrowLeft} alt="arrow left"
                />
              </Button>
              <div className={clsx(style.BottomAvatar)}>
                <Avatar
                  faceIndex={(displayFaceIndex - 1 + faces.length) % faces.length}
                  hairIndex={displayHairIndex}
                  width={60}
                  opacity={0.5}
                  visibleHair={false}
                />
              </div>
            </div>
          </div>

          <div className={clsx(style.Avatar)}>
            <Avatar
              faceIndex={displayFaceIndex}
              hairIndex={displayHairIndex}
            />
          </div>

          <div className={clsx(style.Next)}>
            <div className={clsx(style.PreviewUnitRight)}>
              <div className={clsx(style.TopAvatar)}>
                <Avatar
                  faceIndex={displayFaceIndex}
                  hairIndex={(displayHairIndex + 1) % hairs.length}
                  visibleFace={false}
                  width={60}
                  opacity={0.5}
                />
              </div>
              <Button
                onClick={() => {
                  setDisplayHairIndex(prevState => (prevState + 1) % hairs.length)
                }}
              >
                <img
                  className={clsx(style.Arrow, style.ArrowRight)}
                  src={buttonArrowLeft}
                  alt="arrow right"
                />
              </Button>
            </div>

            <div className={style.PreviewUnitRight}>
              <div className={clsx(style.BottomAvatar)}>
                <Avatar
                  faceIndex={(displayFaceIndex + 1) % faces.length}
                  hairIndex={displayHairIndex}
                  visibleHair={false}
                  opacity={0.5}
                  width={60}
                />
              </div>
              <Button
                onClick={() => {
                  setDisplayFaceIndex(prevState => (prevState + 1) % faces.length)
                }}
              >
                <img
                  className={clsx(style.Arrow, style.ArrowRight)}
                  src={buttonArrowLeft}
                  alt="arrow right"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={clsx(style.Footer)}>
        {
          nameError &&
          <div className={clsx(style.NameError)}>
            <span>{nameError}</span>
          </div>
        }
        <div>
          <Button onClick={saveSetting}>
            <button
              className="button"
              style={{width: '120px'}}
            >
              SAVE
            </button>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default SettingModalV2;