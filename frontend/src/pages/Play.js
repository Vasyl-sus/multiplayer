import React, {useRef, useEffect, useState} from "react";
import style from "./Play.module.scss";
import clsx from "clsx";
import Resize from "../utils/Resize";
import Puzzle from "../components/Puzzle";
import Pad from "../components/Pad";
import Timer from "../components/Timer";
import PlayerList from "../components/PlayerList";
import {useGameContext} from "../providers/GameProvider";
import RoundBetweenBoard from "../components/RoundBetweenBoard";
import Animations from "../components/Animations";
import Winner from "../components/Winner";
import homeIcon from "../assets/images/home.png";
import {QuitModal} from "../components/QuitModal";
import RoomBackground from "../components/RoomBackground";
import Loading from "../components/Loading";
import EndScreenV2 from "../components/EndScreenV2";
import Button from "../components/Button";
import Notification from "../components/Notification";
import {useSettingContext} from "../providers/SettingProvider";
import {coolMathUrl} from "../config";

const Play = () => {
  const ref = useRef(null);
  const resize = new Resize();
  const {loading, visibleMode, clickPad, leave, id, isPrivate} = useGameContext();
  const [visibleQuitModal, setVisibleQuitModal] = useState(false);
  const visibleModeRef = useRef(visibleMode);
  const [fadeOut, setFadeOut] = useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState(false);
  const {visibleModal} = useSettingContext();
  const [visibleSettingModal, _setVisibleSettingModal] = useState(visibleModal);
  const visibleSettingModalRef = useRef(visibleSettingModal);
  const setVisibleSettingModal = val => {
    _setVisibleSettingModal(val);
    visibleSettingModalRef.current = val;
  };

  useEffect(() => {
    setVisibleSettingModal(visibleModal);
  }, [visibleModal]);

  useEffect(() => {
    if (["round-between", "end-before"].includes(visibleModeRef.current)) {
      setFadeOut(true);
    } else {
      setFadeOut(false);
    }
    visibleModeRef.current = visibleMode;
  }, [visibleMode]);

  useEffect(() => {
    if (!loading) {
      resize.resize(ref, 1455, 875);

      window.addEventListener('resize', handleScreenSizeChange);
      document.addEventListener("keydown", handleKeydown);
    }
    return () => {
      window.removeEventListener('resize', handleScreenSizeChange);
      document.removeEventListener('keydown', handleKeydown);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleScreenSizeChange = () => resize.resize(ref, 1455, 875);

  const handleKeydown = (e) => {
    if (!visibleSettingModalRef.current && e.keyCode >= 65 && e.keyCode <= 90) {
      const letter = String.fromCharCode(e.keyCode);
      clickPad(letter);
    }
  };

  const goToHome = () => {
    leave();
    window.location.href = "/home";
  };

  const visibleRoomBackground = !(["end-game", "wait-after-end"].includes(visibleMode));
  const visibleRoundBetween = ["round-between", "end-before"].includes(visibleMode);
  const visibleEndScreen = ["end-game", "wait-after-end"].includes(visibleMode);

  const webAddress = () => {
    const url = window.location.href;
    const arr = url.split("/");
    return arr[0] + "//" + arr[2];
  };

  // const shareUrl = `${webAddress()}/private-lobby/${id}/-1`;
  const shareUrl = `${coolMathUrl}?private-lobby=${id}&xid=-1`;

  const copyUrl = () => {
    const el = document.createElement('textarea');
    el.value = shareUrl;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setVisibleTooltip(true);
    setTimeout(() => {
      setVisibleTooltip(false);
    }, 3000);
  }

  return (
    loading ? (
      <Loading/>
    ) : (
      <div className={clsx(style.ScaleWrapper)} ref={ref}>
        <QuitModal
          isOpen={visibleQuitModal}
          onClickOk={() => {
            setVisibleQuitModal(false);
            goToHome();
          }}
          onClickCancel={() => {
            setVisibleQuitModal(false);
          }}
        />

        <PlayerList/>

        <div className={clsx(style.MainContent, visibleRoundBetween ? style.FadeIn : fadeOut ? style.FadeOut : '')}>
          {
            visibleRoomBackground &&
            <RoomBackground/>
          }

          <div className={clsx(style.ToolBar)}>
            <Button onClick={() => setVisibleQuitModal(true)}>
              <img
                className={clsx(style.HomeIcon)}
                src={homeIcon} alt="home icon"
              />
            </Button>

            {
              isPrivate &&
              <Button className={clsx(style.CopyLink)} onClick={copyUrl}>
                <span>Copy Room Link</span>
                {
                  visibleTooltip &&
                  <span className={clsx(style.Tooltip)}>Copied!</span>
                }
              </Button>
            }
          </div>

          <Puzzle/>

          <div className={clsx(style.DFlex, style.Central)}>
            <Pad/>
            {
              visibleRoomBackground &&
              <Animations/>
            }
          </div>

          <Notification/>
          <Winner/>
          <Timer/>
        </div>

        <EndScreenV2
          visible={visibleEndScreen}
        />

        <RoundBetweenBoard
          visible={visibleRoundBetween}
        />
      </div>
    )
  )
};

export default Play;