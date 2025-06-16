import React, {useState, useContext} from "react";
import PropTypes from 'prop-types';

const AnimationContext = React.createContext(null);

export const AnimationProvider = (props) => {
  const [heroVisible, setHeroVisible] = useState({
    walkInfinite: false,
    walk: false,
    jump: false,
    idle: false,
    burst: false,
    win: false,
    lose: false,
    correct: false,
  });
  const [balloonsVisible, setBalloonsVisible] = useState({
    idle: false,
    burst: false,
    fly: false,
  });
  const [monsterVisible, setMonsterVisible] = useState({
    appear: false,
    idle: false,
    eat: false,
    chew: false,
    death: false,
    toIdle: false,
  });

  const providerValue = {
    heroVisible,
    balloonsVisible,
    monsterVisible,
    setHeroVisible,
    setBalloonsVisible,
    setMonsterVisible,
  };

  return (
    <AnimationContext.Provider value={providerValue}>
      {props.children}
    </AnimationContext.Provider>
  )
}

AnimationProvider.propTypes = {
  children: PropTypes.element,
}

export const useAnimationContext = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimationContext must be used within GameProvider");
  }
  return context;
}