import React, {useRef, useState, useEffect} from "react";
import * as Colyseus from "colyseus.js";
import Resize from "../utils/Resize";
import textureAtlas from "../assets/frames/texture_atlas.json";
import "../assets/css/home.css";
import {backendUrl, socketUrl} from "../config";
import Loading from "../components/Loading";
import style from "./Home.module.scss";
import clsx from "clsx";
import Animation from "../components/Animation";
import speakerIcon from "../assets/images/speaker.png";
import muteIcon from "../assets/images/mute.png";
import questionMarkIcon from "../assets/images/question-mark.png";
import {useSettingContext} from "../providers/SettingProvider";
import HomeBackground from "../components/HomeBackground";
import SettingModalV2 from "../components/SettingModalV2";
import Button from "../components/Button";
import {useAudioContext} from "../providers/AudioProvider";
import ConfirmModal from "../components/ConfirmModal";
import {getItem, setItem} from "../utils/Storage";

function Home() {
  let client = new Colyseus.Client(socketUrl);
  const [loading, setLoading] = useState(false);
  const [visibleSettingModal, setVisibleSettingModal] = useState(false);
  const [visibleConfirmModal, setVisibleConfirmModal] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinMode, setJoinMode] = useState(undefined);
  const {publicName, privateName, hairIndex, faceIndex} = useSettingContext();
  const mapping = {
    "logo": "logo.png",
  };
  const ref = useRef(null);
  const resize = new Resize();
  const [atlas, setAtlas] = useState({});
  const {mute, toggleMute} = useAudioContext();

  useEffect(() => {
    renderAtlas();
    resize.resize(ref, 870, 845);

    const visibleFullModal = getItem("modal") === "room-full";
    // const visibleFullModal = localStorage?.getItem("modal") === "room-full";
    const visibleNotFoundModal = getItem("modal") === "room-not-found";
    // const visibleNotFoundModal = localStorage?.getItem("modal") === "room-not-found";
    if (visibleFullModal) {
      setVisibleConfirmModal(true);
      setJoinError("The room you tried to join is full");
    }
    if (visibleNotFoundModal) {
      setVisibleConfirmModal(true);
      setJoinError("The room you tried to join no longer exists");
    }
    setItem("modal", undefined);
    // localStorage?.setItem("modal", undefined);

    window.addEventListener('resize', handleScreenSizeChange);
    return () => {
      window.removeEventListener('resize', handleScreenSizeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderAtlas = () => {
    // logo
    for (const [key, value] of Object.entries(mapping)) {
      const texture = textureAtlas["frames"][value]["frame"];

      setAtlas(prevState => ({
        [key]: {
          width: texture.w + "px",
          height: texture.h + "px",
          backgroundPosition: `${-1 * texture.x}px ${-1 * texture.y}px`,
        },
        ...prevState,
      }));
    }
  };

  const handleScreenSizeChange = () => resize.resize(ref, 870, 845);

  const play = async () => {
    if ([publicName, hairIndex, faceIndex].includes(undefined)) {
      setJoinMode("public");
      setVisibleSettingModal(true);
      return;
    }

    await joinToPublic(publicName, hairIndex, faceIndex);
  };

  const joinToPublic = async (a, b, c) => {
    try {
      setLoading(true);
      const room = await client.joinOrCreate("multiplayer", {
        maxClients: 8,
        mode: "public",
        name: a,
        hairIndex: b,
        faceIndex: c,
      });
      roomListener(room);
    } catch (e) {
      console.log("joining error", e);
      setLoading(false);
    }
  };

  const singleMode = async () => {
    window.location.href = `${backendUrl}/single`;
  };

  const createPrivate = async () => {
    if ([privateName, hairIndex, faceIndex].includes(undefined)) {
      setJoinMode("private");
      setVisibleSettingModal(true);
      return;
    }

    await joinToPrivate(privateName, hairIndex, faceIndex);
  };

  const joinToPrivate = async (a, b, c) => {
    try {
      setLoading(true);
      const room = await client.create("multiplayer", {
        maxClients: 8,
        mode: "private",
        name: a,
        hairIndex: b,
        faceIndex: c,
      });
      roomListener(room);
    } catch (e) {
      console.log("joining error", e);
      setLoading(false);
    }
  };

  const roomListener = (room) => {
    const {id, sessionId} = room;
    room.onMessage("signal", data => {
      const {type} = data;

      switch (type) {
        case "wait":
          setLoading(false);
          if (data.mode === "public") {
            window.location.href = (`/lobby/${id}/${sessionId}`);
          } else {
            window.location.href = (`/private-lobby/${id}/${sessionId}`);
          }
          break;
        default:
          console.log("type not registered", type);
      }
    });

    room.state.listen("status", (value) => {
      if (value !== "waiting") { // if game was started
        setLoading(false);
        window.location.href = (`/play/${id}/${sessionId}`);
      }
    });
  };

  const handleOnSave = (name, hair, face) => {
    setVisibleSettingModal(false);
    if (joinMode === "public") {
      joinToPublic(name, hair, face)
    } else if (joinMode === "private") {
      joinToPrivate(name, hair, face);
    }
  };

  return (
    <>
      <div className="scaled" ref={ref}>
        <div className={clsx(style.Header)}>
          <div className={clsx(style.Logo, "logo mx-auto")} style={{...atlas["logo"]}}>

          </div>
        </div>

        <div className={clsx(style.Content)}>
          <div className={clsx(style.ButtonWrapper)}>
            <Button className={clsx(style.Button, style.Mt15)} onClick={play}>
              <span>
                quick play
              </span>
            </Button>

            <Button className={clsx(style.Button, style.Mt15)} onClick={createPrivate}>
              <span>
                private game
              </span>
            </Button>

            <Button className={clsx(style.Button, style.Mt15)} onClick={singleMode}>
              <span>
                single player
              </span>
            </Button>
          </div>

          <div className={clsx(style.HeroWrapper)}>
            <div className={clsx(style.WalkWrapper)}>
              <Animation
                atlasName="animations_9_atlas"
                imageName="animations_9_image"
                path="hero_walk_7/frame_"
                start={1}
                count={26}
                fps={30}
                iterative={true}
              />
            </div>

            <HomeBackground/>
          </div>
        </div>

        <div className={clsx(style.Footer)}>
          {/*<Button className={clsx(style.Icon)}>
            <img src={questionMarkIcon} alt="help icon"/>
          </Button>*/}

          <Button
            className={clsx(style.Ml20, style.Icon)}
            onClick={toggleMute}
          >
            <img
              src={mute ? muteIcon : speakerIcon}
              alt="mute icon"
            />
          </Button>
        </div>
        <SettingModalV2
          isPublic={joinMode === "public"}
          isOpen={visibleSettingModal}
          onClose={() => {
            setVisibleSettingModal(false);
            setJoinMode(undefined);
          }}
          onSave={handleOnSave}
        />
        <ConfirmModal
          isOpen={visibleConfirmModal}
          content={joinError}
          onClose={() => {setVisibleConfirmModal(false)}}
        />
      </div>
      {
        loading &&
        <Loading
          transparent={true}
        />
      }
    </>
  );
}

export default Home;