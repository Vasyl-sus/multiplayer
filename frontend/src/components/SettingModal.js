import React, {useState} from "react";
import Modal from 'react-modal';
import clsx from "clsx";
import style from "./SettingModal.module.scss";
import replayIcon from "../assets/images/replay.png";
import buttonArrowLeft from "../assets/images/button_arrow_left.png";
import avatars from "../data/avatar"
import {useSettingContext} from "../providers/SettingProvider";

const SettingModal = (
  {
    isOpen,
    isAvailableGameContext,
    changeSetting,
    onSave,
    onClose,
  }) => {
  const {
    name,
    avatarIndex,
    save,
    generateNewName,
  } = useSettingContext();
  const randomName = generateNewName();
  const [displayName, setDisplayName] = useState(name ?? randomName);
  const randomAvatarIndex = Math.floor(Math.random() * avatars?.length);
  const [displayAvatarIndex, setDisplayAvatarIndex] = useState(avatarIndex ?? randomAvatarIndex);

  const saveSetting = () => {
    if (displayName && displayAvatarIndex !== undefined) {
      save(displayName, displayAvatarIndex);
      // change name and avatar in room
      if (isAvailableGameContext) {
        changeSetting({name: displayName, avatarIndex: displayAvatarIndex});
      }
      onSave(displayName, displayAvatarIndex);
    }
  };

  const showOtherName = () => {
    const randomName = generateNewName();
    setDisplayName(randomName);
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
      <div className={clsx(style.Close)} onClick={onClose}>
        <span className={clsx(style.CloseIcon)}>✖</span>
      </div>
      <div className="text-center">
        <h2>
          CUSTOMIZE
        </h2>
      </div>

      <div className={clsx(style.Content)}>
        <div className="d-flex justify-content-between">
          <div className={clsx(style.Name)}>
            <span>{displayName}</span>
          </div>
          <img
            className={clsx(style.ReplayIcon, "cursor-pointer")}
            src={replayIcon}
            onClick={showOtherName}
          />
        </div>

        <div className={clsx(style.AvatarPicker)}>
          <img
            className={clsx(style.Arrow)} src={buttonArrowLeft} alt="arrow left"
            onClick={() => setDisplayAvatarIndex(prevState => {
              return (prevState + (avatars.length - 1)) % avatars.length;
            })}
          />

          <div className={clsx(style.AvatarArea)}>
            <img
              className={clsx(style.AvatarSmall)}
              src={avatars[(displayAvatarIndex + (avatars.length - 1)) % avatars.length]}
              alt="avatar"
            />

            <img className={clsx(style.Avatar, style.Ml10)} src={avatars[displayAvatarIndex]} alt="avatar"/>

            <img className={clsx(style.AvatarSmall, style.Ml10)}
                 src={avatars[(displayAvatarIndex + 1) % avatars.length]}
                 alt="avatar"/>
          </div>

          <img
            className={clsx(style.Arrow, style.ArrowRight)}
            src={buttonArrowLeft}
            alt="arrow left"
            onClick={() => setDisplayAvatarIndex(prevState => {
              return (prevState + 1) % avatars.length;
            })}
          />
        </div>
      </div>

      <div className="d-flex justify-content-center" style={{marginTop: '40px'}}>
        <button
          className="button"
          style={{width: '120px'}}
          onClick={saveSetting}>
          SAVE
        </button>
      </div>
    </Modal>
  )
}

export default SettingModal;