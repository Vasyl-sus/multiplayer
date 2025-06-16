import React, {useState, useEffect, useRef} from "react";
import clsx from "clsx";
import style from "./PlayerItem.module.scss";
import solveIcon from "../assets/images/mark_check.png";
import failIcon from "../assets/images/mark_fail.png";
import trophyIcon from "../assets/images/trophy.png";
import Avatar from "./Avatar";
import SettingModalV2 from "./SettingModalV2";
import {useGameContext} from "../providers/GameProvider";
import Button from "./Button";

const PlayerItem = ({player}) => {
  const [visibleSettingModal, setVisibleSettingModal] = useState(false);
  const {changeSetting, session, mode} = useGameContext();
  const height = 100;
  const [top, _setTop] = useState(player?.order * height);
  const topRef = useRef(top);
  const setTop = (val) => {
    topRef.current = val;
    _setTop(val);
  };

  const [order, _setOrder] = useState(player?.order);
  const orderRef = useRef(order);
  const setOrder = val => {
    _setOrder(val);
    orderRef.current = val;
  }

  const [big, _setBig] = useState("none");
  const bigRef = useRef(big);
  const setBig = (val) => {
    _setBig(val);
    bigRef.current = val;
  };

  const bigStyles = {
    "big": style.Big,
    "big-odd": style.BigOdd,
    "none": style.None,
  };
  const [trophy, _setTrophy] = useState(player?.trophy);
  const trophyRef = useRef(trophy);
  const setTrophy = (val) => {
    _setTrophy(val);
    trophyRef.current = val;
  };

  const [bigTrophy, _setBigTrophy] = useState("");
  const bigTrophyRef = useRef(bigTrophy);
  const setBigTrophy = val => {
    _setBigTrophy(val);
    bigTrophyRef.current = val;
  };

  const bigTrophyStyles = {
    "big": style.BigTrophy,
    "big-odd": style.BigTrophyOdd,
    "appear": style.AppearTrophy,
    "none": style.NoneTrophy,
  };
  const [score, _setScore] = useState(player?.score);
  const scoreRef = useRef(score);
  const setScore = (val) => {
    scoreRef.current = val;
    _setScore(val);
  };
  const intervalRef = useRef(null);
  const timeoutForTopRef = useRef(null);
  const timeoutForTrophyRef = useRef(null);

  useEffect(() => {
    const newRank = player?.order;
    timeoutForTopRef.current = setTimeout(() => {
      setTop(newRank * height);
    }, 500);

    if (((newRank && parseInt(newRank)) ?? 10) < ((orderRef.current && parseInt(orderRef.current)) ?? 10)) {
      setBig(bigRef.current === 'big' ? 'big-odd' : 'big');
    } else {
      setBig('none');
    }

    setTimeout(() => {
      setBig("none");
    }, 3000);

    setOrder(newRank);

    return () => {
      timeoutForTopRef.current && clearTimeout(timeoutForTopRef.current);
    };
  }, [player?.order]);

  useEffect(() => {
    if (!player.score || player.score === 0) {
      setScore(player.score ?? 0);
    } else if (player.score && (player.score > (scoreRef.current ?? 0))) {
      intervalRef.current = setInterval(() => {
        if ((scoreRef.current ?? 0) < player.score) {
          setScore((scoreRef.current ?? 0) + 1);
        } else {
          clearInterval(intervalRef.current);
        }
      }, 3);
    }

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [player?.score]);

  useEffect(() => {
    if (player.trophy !== trophy) {
      if (player.trophy > 1) { // got new trophy
        setBigTrophy(bigTrophyRef.current === "big" ? 'big-odd' : 'big');
        timeoutForTrophyRef.current = setTimeout(() => {
          setTrophy(player.trophy);
        }, 666);
      } else { // got first trophy
        setBigTrophy("appear");
        setTrophy(player.trophy);
      }
    } else {
      setBigTrophy('none');
    }

    setTimeout(() => {
      setBigTrophy("none")
    }, 3000);

    return () => {
      timeoutForTrophyRef.current && clearTimeout(timeoutForTrophyRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.trophy]);

  const renderRoundScore = (player) => {
    let ret;
    if (player.solved) {
      ret = (
        <img src={solveIcon} alt="solve icon"/>
      );
    } else if (player.failed) {
      ret = (
        <img src={failIcon} alt="fail icon"/>
      );
    } else {
      ret = (
        <div className={clsx(style.RoundScore)}>
          <span className={clsx(style.WonScore)}>{player.matchedLength}/</span>
          <span className={clsx(style.LimitScore)}>{player.wordLength}</span>
        </div>
      );
    }

    return ret;
  };

  return (
    <div className={clsx(style.PlayerItem, orderRef.current % 2 === 1 ? style.BgOdd : style.BgEven, bigStyles[bigRef.current])} style={{top: `${topRef.current}px`}}>
      <SettingModalV2
        isPublic={mode === 'public'}
        isOpen={visibleSettingModal}
        isAvailableGameContext={true}
        changeSetting={changeSetting}
        onClose={() => setVisibleSettingModal(false)}
        onSave={() => setVisibleSettingModal(false)}
      />
      <div className={clsx(style.PlayerInfo)}>
        <div className={clsx(style.PlayerName)}>
          <span>{player.name}</span>
        </div>

        <div className={clsx(style.PlayerScore)}>
          <span>{score ?? 0} pts</span>
        </div>
      </div>

      {
        player.id === session ? (
          <Button
            className={clsx(style.PlayerAvatar, style.DFlex, style.AlignCenter, style.Me)}
            onClick={() => setVisibleSettingModal(true)}
          >
            <Avatar
              faceIndex={player.faceIndex}
              hairIndex={player.hairIndex}
            />
          </Button>
        ) :
        <div
          className={clsx(style.PlayerAvatar, style.DFlex, style.AlignCenter)}
        >
          <Avatar
            faceIndex={player.faceIndex}
            hairIndex={player.hairIndex}
          />
        </div>
      }



      <div className={clsx(style.TrophyWrapper)}>
        {
          trophy &&
          <>
            <img src={trophyIcon} alt="trophy" className={clsx(style.Trophy, bigTrophyStyles[bigTrophy])}/>
            <span className={clsx(style.TrophyBadge)}>{trophy}</span>
          </>
        }
      </div>

      <div className={clsx(style.PlayerRoundStatus, style.DFlex, style.AlignCenter)}>
        {
          renderRoundScore(player)
        }
      </div>
    </div>
  )
};

export default PlayerItem;