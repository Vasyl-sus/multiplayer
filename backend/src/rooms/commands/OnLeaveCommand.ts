// OnLeaveCommand.ts
import { Command } from "@colyseus/command";
import {GameRoomState} from "../schema/GameRoomState";

export class OnLeaveCommand extends Command<GameRoomState, {
  sessionId: string,
}> {

  execute({ sessionId = ""}) {
    if (this.state.players.has(sessionId)) {
      this.state.players.delete(sessionId);
    }
  }

}