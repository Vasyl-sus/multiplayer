import React, {useState, useEffect, useContext} from "react";
import correctLetterSound from "../assets/audios/sound_correct_letter.m4a";
import dundunSound from "../assets/audios/sound_game_end.m4a";
import newGameEndSound from "../assets/audios/sound_game_end_new.wav";
import roundEndSound from "../assets/audios/sound_round_end.wav";
import clickSound from "../assets/audios/sound_click.m4a";
import monsterChompSound from "../assets/audios/sound_monster_chomp.m4a";
import monsterDeadSound from "../assets/audios/sound_monster_dead.m4a";
import monsterAppearSound from "../assets/audios/sound_monster_appears.m4a";
import timerAppearSound from "../assets/audios/sound_timer_appear.wav";
import timerClickSound from "../assets/audios/sound_timer_click.mp3";
import wrongLetterSound from "../assets/audios/sound_balloon_pop.m4a";
import playSound from "../assets/audios/sound_button_play.m4a";
import {getItem, setItem} from "../utils/Storage";

const AudioContext = React.createContext(null);

export const AudioProvider = ({children}) => {
  const [mute, setMute] = useState(getItem("multiplayer-mute") === "on");
  // const [mute, setMute] = useState(localStorage?.getItem("multiplayer-mute") === "on");
  useEffect(() => {
  }, []);
  const audioCorrectLetter = new Audio(correctLetterSound);
  const audioGameEnd = new Audio(newGameEndSound);
  const audioDundun = new Audio(dundunSound);
  const audioRoundEnd = new Audio(roundEndSound);
  const audioClick = new Audio(clickSound);
  const audioMonsterChomp = new Audio(monsterChompSound);
  const audioMonsterDead = new Audio(monsterDeadSound);
  const audioMonsterAppear = new Audio(monsterAppearSound);
  const audioTimerAppear = new Audio(timerAppearSound);
  const audioTimerClick = new Audio(timerClickSound);
  const audioWrongLetter = new Audio(wrongLetterSound);
  const audioPlay = new Audio(playSound);

  const play = (mode) => {
    if (!mute) {
      switch (mode) {
        case 'correct-letter':
          audioCorrectLetter.play().catch(e => console.log(e));
          break;
        case 'game-end':
          audioGameEnd.play().catch(e => console.log(e));
          break;
        case 'round-end':
          audioRoundEnd.play().catch(e => console.log(e));
          break;
        case 'click':
          audioClick.play().catch(e => console.log(e));
          break;
        case 'monster-chomp':
          audioMonsterChomp.play().catch(e => console.log(e));
          break;
        case 'monster-dead':
          audioMonsterDead.play().catch(e => console.log(e));
          break;
        case 'monster-appear':
          audioMonsterAppear.play().catch(e => console.log(e));
          break;
        case 'timer-appear':
          audioTimerAppear.play().catch(e => console.log(e));
          break;
        case 'timer-click':
          audioTimerClick.play().catch(e => console.log(e));
          break;
        case 'wrong-letter':
          audioWrongLetter.play().catch(e => console.log(e));
          break;
        case 'play':
          audioPlay.play().catch(e => console.log(e));
          break;
        case 'dun-dun':
          audioDundun.play().catch(e => console.log(e));
          break;
        default:
          console.log('audio not registered');
      }
    }
  };

  const toggleMute = () => {
    setItem("multiplayer-mute", !mute ? "on" : "off");
    // localStorage?.setItem("multiplayer-mute", !mute ? "on" : "off");
    setMute(prevState => !prevState);
  };

  const providerValue = {
    mute,
    toggleMute,
    playSound: play,
  };

  return (
    <AudioContext.Provider value={providerValue}>
      {children}
    </AudioContext.Provider>
  )
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioContext must be used within AudioProvider");
  }
  return context;
};