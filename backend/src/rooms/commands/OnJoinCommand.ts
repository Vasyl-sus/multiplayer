// OnJoinCommand.ts
import { Command } from "@colyseus/command";
import {GameRoomState, Player, Puzzle, Round} from "../schema/GameRoomState";
import {PUBLIC_MAXIMUM, PUBLIC_MINIMUM} from "../../constant";
import WordGenerator from "../../utils/WordGenerator";

export class OnJoinCommand extends Command<GameRoomState, {
  sessionId: string,
  playerName: string
}> {
  private wordGenerator = new WordGenerator();

  constructor(

  ) {
    super();
  }

  execute({ sessionId = "", playerName = "" }) {
    if (this.state.players.size < PUBLIC_MAXIMUM) {
      const newPlayer = new Player({
        name: playerName,
      });
      this.state.players.set(sessionId, newPlayer);

      if ((this.state.status === "waiting") && this.state.players.size >= PUBLIC_MINIMUM) { // start game
        this.state.status = "playing";
        this.state.activeRound = 1;
        const puzzle = this.wordGenerator.pickRandomWord();
        console.log("puzzle", puzzle);
        const newRound = new Round({
          puzzle: new Puzzle(puzzle),
        });
        this.state.rounds.set(this.state.activeRound.toString(), newRound);
      }
    } else {
      throw new Error("room is full");
    }
  }

}