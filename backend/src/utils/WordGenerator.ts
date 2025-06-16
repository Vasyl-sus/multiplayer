import {words} from "../assets/WordList";

export default class WordGenerator {
  constructor(

  ) {
  }

  pickRandomWord() {
    // return {
    //   "word": "chocolate chip cookies",
    //   "hint": "Eat & Drink"
    // };
    return words[Math.floor(Math.random() * words.length)];
  }
}