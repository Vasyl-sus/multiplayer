import React, {useState} from "react";
import clsx from "clsx";
import style from "./Test.module.scss";
import {
  faces,
  tops,
  shapes,
} from "../data/avatarV2";
import {curses, numericCurses} from "../data/curses";

const Test = () => {
  const [faceIndex, setFaceIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const faceIndicesForShape2 = [3];
  const [value, setValue] = useState('');
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

  const handleValidate = () => {
    const valid = validate();
    console.log(valid);
  };

  const includeCurse = (str) => {
    for (let i = 0; i < curses.length; i++) {
      if (str.includes(curses[i])) {
        return true;
      }
    }

    return false;
  };

  const includeNumericCurse = (str) => {
    for (let i = 0; i < numericCurses.length; i++) {
      if (str.includes(numericCurses[i])) {
        return true;
      }
    }

    return false;
  };

  const validate = () => {
    if (value?.length >= 2) {
      const regex = /^[a-z0-9]+$/i;
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

  return (
    <div>
      <div className={clsx(style.Wrapper)}>
        <img draggable={false} src={faces[faceIndex].default} alt="face" className={clsx(style.Face)}/>
        <img draggable={false} src={shapes[faceIndicesForShape2.includes(faceIndex) ? 1 : 0].default} alt="shape" className={clsx(style.Shape)}/>
        <img draggable={false} src={tops[topIndex].default} alt="top" className={clsx(style.Top)}/>
      </div>

      <div>
        <button
          onClick={() => setFaceIndex(prevState => ((prevState - 1) + faces.length) % faces.length)}
        >
          {'<'}
        </button>
        <h1 style={{display: 'inline'}}>Face</h1>
        <button
          onClick={() => setFaceIndex(prevState => (prevState + 1) % faces.length)}
        >
          {'>'}
        </button>
      </div>

      <div>
        <button
          onClick={() => setTopIndex(prevState => ((prevState - 1) + tops.length) % tops.length)}
        >
          {'<'}
        </button>
        <h1 style={{display: 'inline'}}>Hair</h1>
        <button
          onClick={() => setTopIndex(prevState => (prevState + 1) % tops.length)}
        >
          {'>'}
        </button>
      </div>

      <div>
        <input type="text" value={value} onChange={e => setValue(e.target.value)} />

        <button onClick={handleValidate}>
          Validate
        </button>
      </div>
    </div>
  )
}

export default Test;