import React, {useState, useEffect, useContext} from "react";
import NameGenerator from "../utils/NameGenerator";
import {faces, tops as hairs} from "../data/avatarV2";
import {curses, numericCurses} from "../data/curses";
import {getItem, setItem} from "../utils/Storage";

const SettingContext = React.createContext(null);

export const SettingProvider = ({children}) => {
  const [publicName, setPublicName] = useState(undefined);
  const [privateName, setPrivateName] = useState(undefined);
  const [faceIndex, setFaceIndex] = useState(undefined);
  const [hairIndex, setHairIndex] = useState(undefined);
  const nameGenerator = new NameGenerator();
  const [loaded, setLoaded] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);

  useEffect(() => {
    const savedPublicName = getItem("multiplayer-public-name");
    // const savedPublicName = localStorage?.getItem("multiplayer-public-name");
    const savedPrivateName = getItem("multiplayer-private-name");
    // const savedPrivateName = localStorage?.getItem("multiplayer-private-name");
    const savedHairIndex = getItem("multiplayer-hair");
    // const savedHairIndex = localStorage?.getItem("multiplayer-hair");
    const savedFaceIndex = getItem("multiplayer-face");
    // const savedFaceIndex = localStorage?.getItem("multiplayer-face");
    // if (savedPublicName)
      setPublicName(savedPublicName);
    if (savedPrivateName)
      setPrivateName(savedPrivateName);
    if (savedHairIndex || parseInt(savedHairIndex) === 0)
      setHairIndex(parseInt(savedHairIndex));
    if (savedFaceIndex || parseInt(savedFaceIndex) === 0)
      setFaceIndex(parseInt(savedFaceIndex));

    setLoaded(true);
  }, []);

  const setNewName = (saveFlag, modeFlag) => {
    const newName = generateNewName();
    if (modeFlag) { // public
      setPublicName(newName);
    } else {
      setPrivateName(newName);
    }

    if (saveFlag) {
      if (modeFlag) { // public
        setItem("multiplayer-public-name", newName);
        // localStorage?.setItem("multiplayer-public-name", newName);
      } else {
        setItem("multiplayer-private-name", newName);
        // localStorage?.setItem("multiplayer-private-name", newName);
      }
    }
  };

  const generateNewName = () => {
    return nameGenerator.generateName();
  };

  const setDefaultAvatar = (flag) => {
    const newFaceIndex = Math.floor(Math.random() * faces.length);
    setFaceIndex(newFaceIndex);
    const newHairIndex = Math.floor(Math.random() * hairs.length);
    setHairIndex(newHairIndex);

    if (flag) {
      setItem("multiplayer-hair", newHairIndex.toString());
      // localStorage?.setItem("multiplayer-hair", newHairIndex.toString());
      setItem("multiplayer-face", newFaceIndex.toString());
      // localStorage?.setItem("multiplayer-face", newFaceIndex.toString());
    }
  };

  const save = (newName, newHairIndex, newFaceIndex, modeFlag) => {
    if (newName !== undefined) {
      if (modeFlag) { // public
        setPublicName(newName);
        setItem("multiplayer-public-name", newName);
        // localStorage?.setItem("multiplayer-public-name", newName);
      } else {
        setPrivateName(newName);
        setItem("multiplayer-private-name", newName);
        // localStorage?.setItem("multiplayer-private-name", newName);
      }
    }
    if (newHairIndex !== undefined) {
      setHairIndex(newHairIndex);
      setItem("multiplayer-hair", newHairIndex.toString());
      // localStorage?.setItem("multiplayer-hair", newHairIndex.toString());
    }
    if (newFaceIndex !== undefined) {
      setFaceIndex(newFaceIndex);
      setItem("multiplayer-face", newFaceIndex.toString());
      // localStorage?.setItem("multiplayer-face", newFaceIndex.toString());
    }
  };

  const mapNumberToCharacters = {
    "1": ["i", "l"],
    "3": ["e"],
    "4": ["a"],
    "5": ["s"],
    "7": ["t"],
    "8": ["b"],
    "9": ["g"],
    "0": ["o"],
  };

  const includeCurse = (str) => {
    for (let i = 0; i < curses.length; i++) {
      if (str.toLowerCase().includes(curses[i])) {
        return true;
      }
    }

    return false;
  };

  const includeNumericCurse = (str) => {
    for (let i = 0; i < numericCurses.length; i++) {
      if (str.toLowerCase().includes(numericCurses[i])) {
        return true;
      }
    }

    return false;
  };

  const validate = (value) => {
    if (value?.length > 2) {
      // const regex = /^[a-zA-Z0-9]+$/i;
      const regex = /^[a-zA-Z0-9\s]*$/;
      if (regex.test(value)) {
        if (includeNumericCurse(value)) {
          return false;
        }

        let dummy = [];
        // operation result a55 will be => [a, as, a5, as5, a55, ass, a5s]
        for (let i = 0; i < value.length; i++) {
          let possibleReplaces = [value.charAt(i)];
          if (!isNaN(parseInt(value.charAt(i)))) {
            if (mapNumberToCharacters[value.charAt(i)]) {
              possibleReplaces = [...mapNumberToCharacters[value.charAt(i)], value.charAt(i)];
            }
          }

          const newDummy = JSON.parse(JSON.stringify(dummy));
          for (let j = 0; j < possibleReplaces.length; j++) {
            if (dummy.length > 0) {
              for (let k = 0; k < dummy.length; k++) {
                if (dummy[k].length === i) {
                  const newItem = `${dummy[k]}${possibleReplaces[j]}`;
                  if (newItem.length >= 3) {
                    if (includeCurse(newItem)) {
                      return false;
                    }
                  }
                  newDummy.push(`${dummy[k]}${possibleReplaces[j]}`);
                }
              }
            } else {
              newDummy.push(possibleReplaces[j]);
            }
          }
          dummy = JSON.parse(JSON.stringify(newDummy));
        }
        return true;
      } else {
        console.log('regex validation error');
        return false;
      }
    } else {
      console.log('string should be longer than 3 letters');
      return false;
    }
  };

  const checkNameValidity = (name) => {
    if (name) {
      if (name?.length > 50) {
        return false;
      }
      return validate(name);
      /*const splits = name?.split(" ");
      if (splits.length === 2) {
        return (nameGenerator.validAdjective(splits[0]) && nameGenerator.validNoun(splits[1]));
      } else {
        return validate(name);
      }*/
    } else {
      return false;
    }
  };

  const providerValue = {
    publicName,
    privateName,
    hairIndex,
    faceIndex,
    loaded,
    visibleModal,
    setVisibleModal,
    setNewName,
    setDefaultAvatar,
    save,
    generateNewName,
    checkNameValidity,
  };

  return (
    <SettingContext.Provider value={providerValue}>
      {children}
    </SettingContext.Provider>
  )
};

export const useSettingContext = () => {
  const context = useContext(SettingContext);
  if (!context) {
    throw new Error("useSettingContext must be used within SettingProvider");
  }
  return context;
};