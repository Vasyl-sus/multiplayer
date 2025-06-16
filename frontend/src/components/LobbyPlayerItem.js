import React, {useState} from "react";
import clsx from "clsx";
import style from "./LobbyPlayerItem.module.scss";
import pencilIcon from "../assets/images/button_customize0001.png";
import SettingModalV2 from "./SettingModalV2";
import {useGameContext} from "../providers/GameProvider";
import Avatar from "./Avatar";
import Button from "./Button";

const LobbyPlayerItem = ({player}) => {
  const [visibleSettingModal, setVisibleSettingModal] = useState(false);
  const {changeSetting} = useGameContext();

  return (
    <div className={clsx(style.PlayerItem)}>
      <SettingModalV2
        isPublic={false}
        isOpen={visibleSettingModal}
        isAvailableGameContext={true}
        changeSetting={changeSetting}
        onClose={() => setVisibleSettingModal(false)}
        onSave={() => setVisibleSettingModal(false)}
      />

      <div className={clsx(style.PlayerAvatar, style.DFlex, style.AlignCenter)}>
        {/*<img src={avatars[player.avatarIndex || 0]} alt="user avatar" className={style.PlayerAvatarImage}/>*/}
        <Avatar
          faceIndex={player?.faceIndex ?? 0}
          hairIndex={player?.hairIndex ?? 0}
        />
      </div>

      <div className={clsx(style.PlayerInfo)}>
        <div className={clsx(style.PlayerName)}>
          <span>{player.name}</span>
        </div>
      </div>

      {
        player?.isMe &&
          <Button className={clsx(style.PencilIconWrapper)} onClick={() => setVisibleSettingModal(true)}>
            <img className={clsx(style.PencilIcon)} src={pencilIcon} alt="pencil"/>
          </Button>
      }
    </div>
  )
};

export default LobbyPlayerItem;