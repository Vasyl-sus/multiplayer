import React, {useRef, useState, useEffect, useContext} from "react";
import PropTypes from 'prop-types';
import textureAtlas from "../assets/frames/texture_atlas.json";
import * as Colyseus from "colyseus.js";
import {socketUrl} from "../config";
import {useAnimationContext} from "./AnimationProvider";
import {useAudioContext} from "./AudioProvider";
import {getItem, setItem} from "../utils/Storage";

const numberOfGuesses = 7;

const GameContext = React.createContext(null);

export const GameProvider = (props) => {
  let client = new Colyseus.Client(socketUrl);
  const {id, session} = props;
  const [loading, setLoading] = useState(false);
  const {setHeroVisible, setMonsterVisible, setBalloonsVisible, heroVisible} = useAnimationContext();
  const heroVisibleRef = useRef(heroVisible);
  useEffect(() => {
    heroVisibleRef.current = heroVisible;
  }, [heroVisible]);

  const [stateChangeCounter, _setStateChangeCounter] = useState(0);
  const stateChangeCounterRef = useRef(stateChangeCounter);
  const setStateChangeCounter = (val) => {
    stateChangeCounterRef.current = val;
    _setStateChangeCounter(val);
  };
  const {playSound} = useAudioContext();
  const [padLetters, _setPadLetters] = useState([]);
  const padLettersRef = useRef(padLetters);
  const setPadLetters = data => {
    padLettersRef.current = data;
    _setPadLetters(data);
  };
  const [countdown, _setCountdown] = useState(null);
  const countdownRef = useRef(countdown);
  const setCountdown = (val) => {
    _setCountdown(val);
    countdownRef.current = val;
  };
  const [viewId, _setViewId] = useState(session);
  const viewIdRef = useRef(viewId);
  const setViewId = (val) => {
    viewIdRef.current = val;
    _setViewId(val);
  };
  const [visibleCountDown, _setVisibleCountDown] = useState(false);
  const visibleCountDownRef = useRef(visibleCountDown);
  const setVisibleCountDown = (val) => {
    _setVisibleCountDown(val);
    visibleCountDownRef.current = val;
  };
  const [visibleWinner, _setVisibleWinner] = useState(false);
  const visibleWinnerRef = useRef(visibleWinner);
  const setVisibleWinner = (val) => {
    _setVisibleWinner(val);
    visibleWinnerRef.current = val;
  }
  const [visibleMode, _setVisibleMode] = useState(null); // playing, round-between, end-game
  const visibleModeRef = useRef(visibleMode);
  const setVisibleMode = (val) => {
    visibleModeRef.current = val;
    _setVisibleMode(val);
  };
  const [rendering, _setRendering] = useState(false);
  const renderingRef = useRef(rendering);
  const setRendering = (val) => {
    renderingRef.current = val;
    _setRendering(val);
  };

  let roomRef = useRef(null);

  useEffect(() => {
    reconnect();
    renderWordPad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown?.toString() === '0' && roomRef.current?.state?.status === 'countdown') {
      playSound('dun-dun');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const reconnect = async () => {
    if (id && session && (session !== "-1")) {
      try {
        setLoading(true);
        roomRef.current = await client.reconnect(id, session);
        roomListener(roomRef.current);
      } catch (e) {
        console.error("socket reconnect error", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const renderWordPad = () => {
    const player = roomRef?.current?.state["players"]?.[viewIdRef.current];

    if (!player)
      return;

    const internActiveRound = roomRef.current?.state?.["activeRound"];
    const internPuzzle = roomRef.current?.state?.["rounds"]?.[internActiveRound]?.["puzzle"];
    const word = internPuzzle?.word;

    if (!word)
      return;
    // render from a to z
    const data = [];
    const matchedLetters = player?.matchedLetters;
    const matchedIndices = player?.matchedIndices;
    const pickedLetters = player?.pickedLetters;
    const failedLetters = pickedLetters && pickedLetters.filter(x => !matchedLetters.includes(x));
    const usedAllGuesses = ((failedLetters && failedLetters.length) || 0) >= numberOfGuesses;
    const wordLength = (word?.replace(/\W/g, '')?.length || 0);
    const solved = (matchedIndices.length === wordLength);

    for (let i = 1; i <= 26; i++) {
      const twoDigits = ("0" + i).slice(-2);
      const frame = textureAtlas["frames"][`ScreenGame/letters/letter_00${twoDigits}.png`]["frame"];
      const letter = String.fromCharCode(i + 64);
      const failed = (failedLetters && failedLetters.findIndex(item => item.toUpperCase() === letter.toUpperCase()) !== -1);
      const used = (pickedLetters && pickedLetters.findIndex(item => item.toUpperCase() === letter.toUpperCase()) !== -1);

      data.push({
        style: {
          width: `${frame.w}px`,
          height: `${frame.h}px`,
          backgroundPosition: `${-1 * frame.x}px ${-1 * frame.y}px`,
        },
        letter,
        used: usedAllGuesses || used,
        failed,
        inactive: solved,
      });
    }
    setPadLetters(data);
  };

  const roomListener = (room) => {
    room.state.listen("status", (value) => {
      setVisibleCountDown(false);

      const players = playerList();
      const player = players?.find(it => it.id === viewIdRef.current);

      switch (value) {
        case "ending":
          setVisibleMode("end-before"); // screen that calculates before end screen
          setViewId(session);
          setCountdown(15);
          /*setTimeout(() => { // delay 2s to show animation fully
            setVisibleMode("end-before"); // screen that calculates before end screen
            setViewId(session);
            setCountdown(15);
          }, 2000);*/

          if (!renderingRef.current) {
            // if player has remaining balloons, but timeout
            if (player && !player.failed && !player.solved) {
              showHeroLose();
            }
          }
          break;
        case "wait_after_end":
          setVisibleMode("wait-after-end");
          showNothing();
          break;
        case "preparing_new_game":
          setVisibleMode("end-game");
          showNothing();
          break;
        case "starting":
          setVisibleMode("starting");
          whenStarting();
          break;
        case "playing":
          setCountdown(20); // set to global timer
          if (visibleModeRef.current !== "starting") {
            playSound('play');
          }
          setVisibleMode("playing");
          if (!renderingRef.current) { // if not rendering the monster die animation
            player && whenPlaying(player);
          }
          break;
        case "waiting":
          setViewId(session);
          setCountdown(5);
          break;
        case "reviewing":
          setVisibleMode("round-between");
          setViewId(session);
          /*setTimeout(() => { // delay 2s to show animation fully
            setVisibleMode("round-between");
            setViewId(session);
          }, 2000);*/

          if (!renderingRef.current) {
            // if player has remaining balloons, but timeout
            if (player && !player.failed && !player.solved) {
              showHeroLose();
            }
          }
          break;
        case "preparing_new_round":
          setVisibleMode("round-between");
          if (!renderingRef.current) { // if not rendering the monster die animation
            // if solved show walk animation or monster idle,
            whenPreparingNewRound(player);
          }
          break;
        case "countdown":
          setVisibleMode("playing");
          setVisibleCountDown(true);
          if (getItem("multiplayer-notification") === 'seen') {
          // if (localStorage?.getItem("multiplayer-notification") === 'seen') {
            setItem("multiplayer-notification", "off");
            // localStorage?.setItem("multiplayer-notification", "off");
          }
          if (!renderingRef.current) {
            // animation only when refreshing the page
            if (!(heroVisibleRef.current && Object.values(heroVisibleRef.current).includes(true))) {
              player && whenPlaying(player);
            }
          }
          break;
        default:
          console.log("status type not registered");
      }
    });

    const showIdle = () => {
      // 200ms delay not to show before fade
      setTimeout(() => {
        setHeroVisible({idle: true});
        setMonsterVisible({idle: true});
        setBalloonsVisible({idle: true});
      }, 200);
    };

    const showHeroLose = () => {
      setHeroVisible({lose: true});
      setMonsterVisible({eat: true});
      setBalloonsVisible({});
      setTimeout(() => {
        playSound('monster-chomp');
      }, 240);
    };

    const showNothing = () => {
      setHeroVisible({});
      setMonsterVisible({});
      setBalloonsVisible({});
    };

    const whenStarting = () => {
      setHeroVisible({walk: true});
    };
    
    const whenPlaying = (player) => {
      if (player.solved) {
        setHeroVisible({walkInfinite: true});
        setMonsterVisible({});
        setBalloonsVisible({});
      } else if (player.failed) {
        setHeroVisible({});
        setMonsterVisible({idle: true});
        setBalloonsVisible({});
      } else {
        showIdle();
      }
    };
    
    const whenPreparingNewRound = (player) => {
      if (player.solved) {
        setHeroVisible({walkInfinite: true});
        setMonsterVisible({});
        setBalloonsVisible({});
      } else {
        setHeroVisible({});
        setBalloonsVisible({});
        setMonsterVisible({idle: true});
      }
    };

    room.onStateChange(() => {
      renderWordPad();
      setStateChangeCounter(stateChangeCounterRef.current + 1);
    });

    room.onStateChange.once(() => {
      renderWordPad();
      setStateChangeCounter(stateChangeCounterRef.current + 1);
    });

    room.onMessage("signal", data => {
      const {type, payload} = data;

      switch (type) {
        case "matched":
          if (payload.playerId === viewIdRef.current) {
            playSound('correct-letter');
            // setHeroVisible({correct: true});
          }
          break;

        case "wasted":
          if (payload.playerId === viewIdRef.current) {
            // playSound('wrong-letter');
            // setHeroVisible({burst: true});
            // setBalloonsVisible({burst: true});
            // setRendering(true);
            // setTimeout(() => {
            //   setRendering(false);
            // }, 930);
          }
          break;

        case "kick":
          if (payload.playerId === session) {
            leave();
            window.location.href = "/home";
          }
          break;

        case "redirect-lobby":
          window.location.href = `/private-lobby/${id}/${session}`;
          break;

        case "solved":
          if (payload.playerId === viewIdRef.current) {
            setRendering(true);
            setTimeout(() => {
              setRendering(false);
            }, 1500);
            setHeroVisible({...heroVisible, win: true});
            setBalloonsVisible({fly: true});
            setTimeout(() => {
              setHeroVisible({win: true});
            }, 60);
          }
          break;

        case "timeRemaining": // when first player solved
        case "globalTimer": // when global timer hits 20
          setCountdown(payload["remaining"]);
          if (parseInt(payload["remaining"]) === 20) {
            // TODO play countdown start audio
          } else if (payload["remaining"] <= 5) {
            // TODO play countdown 5 left audio
          }
          break;

        case "reviewTimer":
        case "endTimer":
          setVisibleWinner(false);
          setCountdown(payload["remaining"]);
          break;

        case "visibleWinner":
          setVisibleWinner(true);
          break;

        default:
          console.log("signal type not registered");
      }
    });
  };

  const clickPad = (letter) => {
    if (ableToPick()) {
      const padLetter = padLettersRef.current?.find(padLetter => padLetter.letter.toUpperCase() === letter.toUpperCase());
      if (padLetter && !padLetter.used && !padLetter.inactive) {
        roomRef?.current?.send("signal", {type: "pick", payload: {letter}});
      }
    }
  };

  const activeRound = roomRef.current?.state?.["activeRound"];
  const puzzle = roomRef.current?.state?.["rounds"]?.[activeRound]?.["puzzle"];

  const hint = puzzle?.hint;

  const winner = () => {
    const winnerId = roomRef.current?.state?.rounds?.[activeRound]?.winner;
    const players = playerList();
    return players?.find(player => player.id === winnerId);
  }

  const visibleNotification = () => {
    const noti = getItem("multiplayer-notification");
    // const noti = localStorage?.getItem("multiplayer-notification");
    if (noti !== 'off') {
      if (["starting", "playing"].includes(roomRef.current?.state?.status)) {
        if (noti !== 'seen') {
          setItem("multiplayer-notification", "seen");
          // localStorage?.setItem("multiplayer-notification", "seen");
        }
        return true;
      }
    }

    return false;
  };

  const puzzleStatus = () => {
    if (puzzle) {
      const word = puzzle?.word;
      const wordCap = word.toUpperCase();
      const letters = [];
      const matchedLetters = roomRef?.current?.state?.players?.[viewIdRef.current]?.["matchedLetters"];

      for (let i = 0; i < wordCap.length; i++) {
        if (wordCap.charCodeAt(i) >= 65 && wordCap.charCodeAt(i) <= 90) { // if a - z
          const matched = matchedLetters && matchedLetters.findIndex(matchedLetter => matchedLetter.toUpperCase() === wordCap.charAt(i)) !== -1;
          if (matched)
            letters.push({type: "letter", value: wordCap.charAt(i)});
          else
            letters.push({type: "underline", value: wordCap.charAt(i)});
        } else if (wordCap.charAt(i).trim() === "") { // if space
          letters.push({type: "space"});
        } else { // if special character
          letters.push({type: "letter", value: wordCap.charAt(i)});
        }
      }

      return letters;
    }
    return [];
  };

  const playerListForLobby = () => {
    const playersArr = [];
    if (roomRef?.current?.state?.players?.size > 0) {
      roomRef.current.state.players.forEach((player, playerId) => {
        playersArr.push({
          name: player.name,
          hairIndex: player.hairIndex,
          faceIndex: player.faceIndex,
          playerId: playerId,
          joinedAt: player.joinedAt,
          isMe: (session === playerId),
        });
      });
    }

    return playersArr;
  };

  const host = () => {
    const players = playerListForLobby();
    players?.sort((a, b) => {
      const timeA = new Date(a.joinedAt).getTime();
      const timeB = new Date(b.joinedAt).getTime();
      return timeA - timeB > 0 ? 1 : -1;
    });

    return players && players[0];
  };

  const playerList = () => {
    const internActiveRound = roomRef.current?.state?.["activeRound"];
    const internPuzzle = roomRef.current?.state?.["rounds"]?.[internActiveRound]?.["puzzle"];

    if (internPuzzle) {
      const word = internPuzzle?.word;
      const wordLength = (word?.replace(/\W/g, '')?.length || 0);
      if (roomRef?.current?.state?.players?.size > 0) {
        const playersArr = [];
        roomRef.current.state.players.forEach((player, playerId) => {
          playersArr.push({
            matchedLetters: player["matchedLetters"],
            pickedLetters: player["pickedLetters"],
            matchedIndices: player["matchedIndices"],
            hairIndex: player["hairIndex"],
            faceIndex: player["faceIndex"],
            name: player["name"],
            score: player["score"],
            previousGameScore: player["previousGameScore"],
            roundScore: player["roundScore"],
            playerId: playerId,
            trophy: player["trophy"],
          });
        });

        const sortedArray = JSON.parse(JSON.stringify(playersArr));

        sortedArray.sort((a, b) => {
          if (((b.score ?? 0) - (a.score ?? 0)) !== 0) {
            return (b.score ?? 0) - (a.score ?? 0);
          } else {
            return ((b.previousGameScore ?? 0) - (a.previousGameScore ?? 0));
          }
        });

        return playersArr.map((player) => {
          const playerMatchedLetters = player["matchedLetters"];
          const playerPickedLetters = player["pickedLetters"];
          const playerFailedLetters = playerPickedLetters.filter(x => !playerMatchedLetters.includes(x));
          const playerRemainingGuesses = (numberOfGuesses - (playerFailedLetters && playerFailedLetters.length)) || 0;
          const solved = (player["matchedIndices"]?.length === wordLength);
          const failed = playerRemainingGuesses < 1;
          const matchedLength = (player["matchedIndices"]?.length || 0);
          const order = sortedArray?.findIndex(it => it.playerId === player.playerId);

          return {
            id: player.playerId,
            score: player.score,
            name: player.playerId === session ? "You" : player.name,
            roundScore: player.roundScore,
            trophy: player.trophy,
            hairIndex: player.hairIndex,
            faceIndex: player.faceIndex,
            matchedLength,
            solved,
            failed,
            wordLength,
            order,
          };
        });
      }
    }
  };

  const ableToPick = () => {
    if (["starting", "playing"].includes(roomRef?.current?.state?.status)) {
      return true;
    } else if (roomRef?.current?.state?.status === "countdown") {
      return (parseInt(countdownRef.current ?? "0") >= 1);
    }

    return false;
  }


  const remainingGuesses = () => {
    const player = roomRef?.current?.state?.players[viewIdRef.current];
    if (!player)
      return null;

    const matchedLetters = player["matchedLetters"];
    const pickedLetters = player["pickedLetters"];
    const failedLetters = pickedLetters && pickedLetters.filter(x => !matchedLetters.includes(x));
    const remainingGuesses = numberOfGuesses - (failedLetters && failedLetters.length);

    return remainingGuesses > 0 ? remainingGuesses : 0;
  };

  const startPrivateGame = () => {
    roomRef?.current?.send("signal", {type: "start-private"});
  };

  const increaseRound = () => {
    roomRef?.current?.send("signal", {type: "increase-round"});
  };

  const decreaseRound = () => {
    roomRef?.current?.send("signal", {type: "decrease-round"});
  };

  const changeSetting = (setting) => {
    roomRef?.current?.send("signal", {type: "change-setting", payload: setting});
  };

  const leave = () => {
    roomRef?.current?.leave();
  };

  const topScorer = () => {
    let topScorers = [];
    roomRef?.current?.state?.players.forEach((player, playerId) => {
      if (!(topScorers?.length > 0)) {
        topScorers = [{
          player: player,
          id: playerId,
        }];
      } else {
        if (((topScorers[0]?.player?.score ?? 0) + (topScorers[0]?.player?.roundScore ?? 0))  < ((player.score || 0) + (player.roundScore || 0))) {
          topScorers = [{
            player: player,
            id: playerId,
          }];
        } else if (((topScorers[0]?.player?.score ?? 0) + (topScorers[0]?.player?.roundScore ?? 0))  === ((player.score || 0) + (player.roundScore || 0))) {
          topScorers.push({
            player: player,
            id: playerId,
          });
        }
      }
    });
    if (topScorers?.length > 0) {
      if (topScorers?.length === 1) {
        return {
          text: topScorers[0]?.id === session ? (
            "You win!"
          ): (
            `${topScorers[0]?.player?.name} wins!`
          ),
          hairIndex: topScorers[0]?.player?.hairIndex,
          faceIndex: topScorers[0]?.player?.faceIndex,
          tied: false,
        };
      } else {
        const topScorersNameList = topScorers?.map(it => it?.id === session ? 'You' : it.player?.name);
        const lastEntity = topScorersNameList?.splice(topScorersNameList.length - 1, 1);
        return {
          text: topScorersNameList?.join(", ") + ", and " + lastEntity + " tie for the win!",
          tied: true,
        };
      }
    }

    return null;
  };

  const isPrivate = roomRef.current?.state?.mode === 'private';

  const restart = () => {
    roomRef?.current?.send("signal", {type: "restart"});
  };

  const redirectLobby = () => {
    roomRef?.current?.send("signal", {type: "redirect-lobby"});
  };

  const providerValue = {
    loading,
    padLetters,
    countdown,
    ableToPick: ableToPick(),
    activeRound,
    numberOfRounds: roomRef?.current?.state?.numberOfRounds || 5,
    visibleCountDown,
    visibleMode,
    visibleWinner,
    hint,
    roomStatus: roomRef?.current?.state?.status,
    winner: winner(),
    puzzleStatus: puzzleStatus(),
    playerList: playerList(),
    remainingGuesses: remainingGuesses(),
    playerListForLobby: playerListForLobby(),
    host: host(),
    topScorer: topScorer(),
    visibleNotification: visibleNotification(),
    id,
    session,
    mode: roomRef?.current?.state?.mode,
    isPrivate,
    clickPad,
    startPrivateGame,
    increaseRound,
    decreaseRound,
    changeSetting,
    leave,
    restart,
    redirectLobby,
    setRendering,
  };

  return (
    <GameContext.Provider value={providerValue}>
      {props.children}
    </GameContext.Provider>
  )
};

GameProvider.propTypes = {
  id: PropTypes.string,
  session: PropTypes.string,
  children: PropTypes.element,
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};