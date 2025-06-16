import { Schema, MapSchema, ArraySchema, Context, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("string") name: string;
  @type("number") hairIndex: number;
  @type("number") faceIndex: number;
  @type("number") score: number;
  @type("number") previousGameScore: number;
  @type("number") roundScore: number;
  @type(["string"]) pickedLetters: string[] = new ArraySchema<string>();
  @type(["string"]) matchedLetters: string[] = new ArraySchema<string>();
  @type(["number"]) matchedIndices: number[] = new ArraySchema<number>();
  @type("string") status: string;
  @type("number") trophy: number;
  @type("boolean") activeForRound: boolean = false;
  @type("number") numberOfInActiveRounds: number = 0;
  @type("number") numberOfRoundsSoFar: number;
  @type("string") joinedAt: string;
}

export class Puzzle extends Schema {
  @type("string") word: string;
  @type("string") hint: string;
}

export class Round extends Schema {
  @type(Puzzle) puzzle: Puzzle;
  @type("string") winner: string;
}

export class GameRoomState extends Schema {
  @type({map: Player}) players = new MapSchema<Player>();

  @type("string") status: string; // waiting(lobby), starting, playing, countdown, reviewing, preparing_new_round, ending, preparing_new_game(in game room), wait_after_end

  @type("number") activeRound: number;

  @type({map: Round}) rounds = new MapSchema<Round>();

  @type("string") mode: string; // private, public

  @type("number") numberOfRounds: number;

  @type("boolean") timerMode: boolean; // if earlier finisher: true, global finisher: false
}
