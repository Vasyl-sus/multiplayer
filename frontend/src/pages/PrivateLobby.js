import React, {useState, useEffect, useRef} from "react";
import clsx from "clsx";
import * as Colyseus from "colyseus.js";
import style from "./PrivateLobby.module.scss";
import Resize from "../utils/Resize";
import buttonArrowLeft from "../assets/images/button_arrow_left.png";
import {useGameContext} from "../providers/GameProvider";
import LobbyPlayerList from "../components/LobbyPlayerList";
import {coolMathUrl, socketUrl} from "../config";
import {useSettingContext} from "../providers/SettingProvider";
import {PRIVATE_ROUNDS_MAX, PRIVATE_ROUNDS_MIN} from "../config/constant";
import homeIcon from "../assets/images/home.png";
import {QuitModal} from "../components/QuitModal";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import {setItem} from "../utils/Storage";

const PrivateLobby = ({id, session}) => {
  let client = new Colyseus.Client(socketUrl);
  const ref = useRef(null);
  const resize = new Resize();
  const {privateName, hairIndex, faceIndex, setNewName, setDefaultAvatar, loaded} = useSettingContext();
  const {host, startPrivateGame, roomStatus, numberOfRounds, increaseRound, decreaseRound, leave} = useGameContext();
  const [readyToJoin, setReadyToJoin] = useState(false);
  const [visibleQuitModal, setVisibleQuitModal] = useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loaded) {
      if (!id) {
        window.location.href = "/home";
      } else if (session === "-1") { // this invited user
        // check if name and avatar were set
        if (!privateName) {
          setNewName(true, false);
          setDefaultAvatar(true);
        }
        setReadyToJoin(true);
      }
      resize.resize(ref, 1455, 875);

      window.addEventListener('resize', handleScreenSizeChange);
      return () => {
        window.removeEventListener('resize', handleScreenSizeChange);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  useEffect(() => {
    if (([
      "starting",
      "playing",
      "countdown",
      "reviewing",
      "preparing_new_round",
      "ending",
      "preparing_new_game",
      "wait_after_end",
    ].includes(roomStatus))) {
      if (id && session && session !== '-1')
        window.location.href = `${webAddress()}/play/${id}/${session}`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomStatus]);

  useEffect(() => {
    if (readyToJoin && privateName) {
      joinToRoom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToJoin, privateName]);

  const joinToRoom = async () => {
    try {
      setLoading(true);
      const room = await client.joinById(id, {
        name: privateName,
        hairIndex,
        faceIndex,
      });
      const mySession = room.sessionId;
      if (mySession) {
        window.location.href = `${webAddress()}/private-lobby/${id}/${mySession}`;
      }
    } catch (e) {
      if (e?.code?.toString() === "4212") {
        if (e.toString().includes('locked')) {
          setItem("modal", "room-full");
          // localStorage?.setItem("modal", "room-full");
        } else if (e.toString().includes('not found')) {
          setItem("modal", "room-not-found");
          // localStorage?.setItem("modal", "room-not-found");
        }
      }
      console.log(e);
      window.location.href = "/home";
    } finally {
      setLoading(false);
    }
  }

  const handleScreenSizeChange = () => resize.resize(ref, 1455, 875);

  const webAddress = () => {
    const url = window.location.href;
    const arr = url.split("/");
    return arr[0] + "//" + arr[2];
  };

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
  };

  const amIHost = (host?.playerId === session);

  const goToHome = () => {
    leave();
    window.location.href = "/home";
  };

  return (
    <>
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
        <LobbyPlayerList/>

        <div className={clsx(style.MainContent)}>
          <div className={clsx(style.Toolbar)}>
            <Button onClick={() => setVisibleQuitModal(true)}>
              <img className={clsx(style.HomeIcon)} src={homeIcon} alt="home icon"/>
            </Button>
          </div>

          <div className={clsx(style.HostArea)}>
            <div className={clsx(style.HostLabel)}>
              <span>host:</span>
            </div>

            <div className={clsx(style.Host)}>
              {
                !loading && host &&
                <div className={clsx(style.HostAvatar)}>
                  <Avatar
                    faceIndex={host?.faceIndex}
                    hairIndex={host?.hairIndex}
                    width={80}
                  />
                </div>
              }
              {/*<img className={clsx(style.HostAvatar)} src={avatars[host?.avatarIndex || 0]} alt="host avatar"/>*/}

              <div className={clsx(style.HostName)}>
                <span>{host?.name}</span>
              </div>
            </div>
          </div>

          <div className={clsx(style.RoomInfo)}>
            <div className={clsx(style.RoomID)}>
            <span>
              {/*room id {id}*/}
              &nbsp;
            </span>
            </div>

            <div>
              <div className={clsx(style.RoomUrl)}>
                <span>
                  {shareUrl}
                </span>
              </div>
            </div>

            <div>
              <Button className={clsx(style.Copy)} onClick={copyUrl}>
                <span>copy url</span>
                {
                  visibleTooltip &&
                  <span className={clsx(style.Tooltip)}>Copied!</span>
                }
              </Button>
            </div>

            <div className={clsx(style.RoomRound)}>
              <div className={clsx(style.RoundLabel)}>
              <span>
                number of rounds:
              </span>
              </div>

              <div className={clsx(style.RoundControl)}>
                <Button
                  onClick={() => {
                    amIHost && (numberOfRounds > PRIVATE_ROUNDS_MIN) && decreaseRound();
                  }}
                >
                  <img
                    className={clsx(
                      style.Arrow,
                      amIHost && (numberOfRounds > PRIVATE_ROUNDS_MIN) ? style.Enable : style.Disable
                    )}
                    src={buttonArrowLeft} alt="arrow left"
                  />
                </Button>

                <div className={clsx(style.Round)}>
                  <span>{numberOfRounds}</span>
                </div>

                <Button
                  onClick={() => {
                    amIHost && (numberOfRounds < PRIVATE_ROUNDS_MAX) && increaseRound();
                  }}
                >
                  <img
                    className={clsx(
                      style.Arrow,
                      style.ArrowRight,
                      amIHost && (numberOfRounds < PRIVATE_ROUNDS_MAX) ? style.Enable : style.Disable
                    )}
                    src={buttonArrowLeft}
                    alt="arrow left"
                  />
                </Button>
              </div>
            </div>
          </div>
          {
            amIHost ?
              <Button className={clsx(style.PlayButton)} onClick={startPrivateGame}>
                <span>play</span>
              </Button> :
              <div className={clsx(style.Waiting)}>
                <span>Waiting for host to start the game</span>
              </div>
          }
        </div>
      </div>
    </>
  )
};

export default PrivateLobby;
