import {Room, Client, Delayed} from "colyseus";
import {Dispatcher} from "@colyseus/command";

import {GameRoomState, Player, Puzzle, Round} from "./schema/GameRoomState";
import {OnLeaveCommand} from "./commands/OnLeaveCommand";
import WordGenerator from "../utils/WordGenerator";
import {PUBLIC_MAXIMUM, PUBLIC_MINIMUM, PRIVATE_ROUNDS_MAX, PRIVATE_ROUNDS_MIN} from "../constant";

export class GameRoom extends Room<GameRoomState> {

  dispatcher = new Dispatcher(this);
  public delayedInterval!: Delayed;
  private pointsForSolve = 0;
  private pointsForFirst = 100;
  private pointsForSecond = 50;
  private pointsForThird = 30;
  private pointsForLetter = 10;
  private pointsForBalloon = 40;
  private totalRounds = 5;
  private timer = 30; // earlier finish
  private reviewTimer = 3;
  private prepareRoundTimer = 4;
  private prepareGameTimer = 14;
  private resetTimer = 1;
  private endTimer = 7;
  private globalTimer = 60;
  private globalTimerSignalTimer = 20;
  private globalTimerSignalStarted = false;
  private numberOfBalloons = 7;
  private visibleWinnerTimer = 3;
  private wordGenerator = new WordGenerator();
  private startingTimer = 10;

  async onCreate(options: any) {
    this.setPatchRate(250); // 250 ms
    this.setSeatReservationTime(15); // 15 seconds
    this.maxClients = options.maxClients;
    const initialGameState = new GameRoomState({
      mode: options.mode || "public",
      status: "waiting",
      numberOfRounds: this.totalRounds,
    });
    this.setState(initialGameState);

    if (options.mode === "private") {
      await this.setPrivate(true);
    }

    this.onMessage("signal", (client, message) => {
      const {type, payload} = message;
      const requestedUser = this.state.players.get(client.sessionId);

      switch (type) {
        case "pick":
          // check if the player can pick
          if (!["starting", "playing", "countdown"].includes(this.state.status)) {
            break;
          }
          const {letter} = payload;
          const activeRound = this.state.rounds.get(this.state.activeRound.toString());
          const puzzle = activeRound.puzzle;
          requestedUser.activeForRound = true;
          requestedUser.numberOfInActiveRounds = 0;
          if (requestedUser.pickedLetters.includes(letter))
            break;

          if (puzzle?.word?.toUpperCase()?.indexOf(letter.toUpperCase()) !== -1) { // if picked correct one
            let indices = [];
            for (let i = 0; i < puzzle?.word?.length; i++) {
              if (puzzle?.word?.charAt(i).toUpperCase() === letter.toUpperCase()) {
                if (requestedUser.matchedIndices) {
                  requestedUser.matchedIndices.push(i);

                  if (requestedUser.matchedIndices.length === puzzle?.word?.replace(/\W/g, '')?.length) {
                    requestedUser.status = 'solved';
                    let solvedPlayers = 0;
                    this.state.players.forEach(player => {
                      if (player.status === "solved") {
                        solvedPlayers++;
                      }
                    });
                    this.broadcast("signal", {
                      type: "solved",
                      payload: {
                        player: requestedUser.name,
                        playerId: client.sessionId,
                        solvedAtFirst: solvedPlayers === 1,
                      },
                    });
                    this.calculateScore(requestedUser, client.sessionId, puzzle?.word);
                  }
                } else {
                  requestedUser.matchedIndices = [i];
                }
                indices.push(i);
              }
            }
            if (requestedUser.matchedLetters) {
              requestedUser.matchedLetters.push(letter);
            } else {
              requestedUser.matchedLetters = [letter];
            }
            // "Hello, World's Proud" will be "HelloWorldsProud"
            if (puzzle?.word?.replace(/\W/g, '')?.length === requestedUser?.matchedIndices?.length) {
              if (!activeRound.winner) {
                activeRound.winner = client.sessionId;

                if (!this.globalTimerSignalStarted) { // if global timer did not started yet
                  this.delayedInterval && this.delayedInterval.clear();

                  this.broadcast("signal", {
                    type: "visibleWinner",
                    winner: activeRound.winner,
                  });

                  this.clock.setTimeout(() => {
                    let remaining = this.timer;

                    this.broadcast("signal", {
                      type: "initializeTimer",
                      payload: {value: this.timer},
                    });

                    this.state.timerMode = true;

                    this.clock.start();
                    this.delayedInterval = this.clock.setInterval(() => {
                      this.state.status = "countdown";
                      if (remaining === 0) {
                        this.end();
                        this.broadcast("signal", {
                          type: "timeRemaining",
                          payload: {remaining},
                        });
                      } else {
                        this.broadcast("signal", {
                          type: "timeRemaining",
                          payload: {remaining},
                        });
                        remaining--;
                      }
                    }, 1000);
                  }, 1000 * this.visibleWinnerTimer);
                }
              }
            }

            this.broadcast("signal", {type: "matched", payload: {letter, playerId: client.sessionId}});
            this.broadcast("signal", {
              type: "matchedIndices",
              payload: {letter: letter, indices: indices, playerId: client.sessionId}
            });
            this.broadcast("signal", {
              type: "numberOfSolvedLetters",
              payload: {playerId: client.sessionId, number: requestedUser?.matchedIndices?.length || 0}
            })
          } else {
            this.broadcast("signal", {type: "wasted", payload: {letter, playerId: client.sessionId}});
          }

          if (requestedUser.pickedLetters) {
            requestedUser.pickedLetters.push(letter);
          } else {
            requestedUser.pickedLetters = [letter];
          }

          const playerMatchedLetters = requestedUser.matchedLetters;
          const playerPickedLetters = requestedUser.pickedLetters;
          const playerFailedLetters = playerPickedLetters.filter(x => !playerMatchedLetters.includes(x));
          const playerRemainingGuesses = (this.numberOfBalloons - (playerFailedLetters && playerFailedLetters.length || 0));

          if (playerRemainingGuesses === 0) {
            requestedUser.status = "failed";
            this.broadcast("signal", {type: "playFailedSound", payload: {playerId: client.sessionId}});
          }

          // check if all players finished the puzzle
          if (this.checkIfAllPlayersFinished()) {
            this.end();
          }
          break;
        case "start-private":
          this.startNewGame();
          break;
        case "increase-round":
          if (this.state.numberOfRounds < PRIVATE_ROUNDS_MAX)
            this.state.numberOfRounds = this.state.numberOfRounds + 1;
          break;
        case "decrease-round":
          if (this.state.numberOfRounds > PRIVATE_ROUNDS_MIN)
            this.state.numberOfRounds = this.state.numberOfRounds - 1;
          break;
        case "change-setting":
          requestedUser.name = payload?.name;
          requestedUser.hairIndex = payload?.hairIndex;
          requestedUser.faceIndex = payload?.faceIndex;
          break;
        case "redirect-lobby":
          this.state.status = "waiting";
          this.initializeScore();
          this.broadcast("signal", {type: "redirect-lobby"});
          break;
        case "restart":
          this.initializeScore();
          this.startNewGame();
          break;
        default:
          console.log("type not registered");
      }
    });

  }

  end() {
    this.delayedInterval && this.delayedInterval.clear();
    this.clock && this.clock.clear();

    this.clock.setTimeout(() => {
      if (this.state.activeRound < this.state.numberOfRounds) { // start new round
        this.reviewRound();
      } else { // end game
        this.endGame();
      }
    }, 2000);
  }

  checkIfAllPlayersFinished() {
    let allFinished = true;
    this.state.players.forEach(player => {
      if (!["solved", "failed"].includes(player.status)) {
        allFinished = false;
      }
    });

    return allFinished;
  }

  onJoin(client: Client, options: any) {
    /*this.dispatcher.dispatch(new OnJoinCommand(), {
      sessionId: client.sessionId,
      playerName: options?.name,
    });*/
    const sessionId = client.sessionId;
    const playerName = options?.name;
    const hairIndex = options?.hairIndex;
    const faceIndex = options?.faceIndex;
    const playerData: Partial<Player> = {
      name: playerName,
      hairIndex,
      faceIndex,
      numberOfRoundsSoFar: 0,
      joinedAt: new Date().toISOString(),
    };
    if (!(["waiting"].includes(this.state.status))) {
      playerData["numberOfRoundsSoFar"] = 1;
    }

    if (this.state.players.size < PUBLIC_MAXIMUM) {
      const newPlayer = new Player(playerData);
      this.state.players.set(sessionId, newPlayer);

      if (
        this.state.mode === "public" &&
        (this.state.status === "waiting") &&
        this.state.players.size >= PUBLIC_MINIMUM
      ) { // start game
        this.startNewGame();
      }
    } else {
      throw new Error("room is full");
    }

    // TODO check if game started already
    // if game started flag is true, then bug
    if (this.state.players.size < PUBLIC_MINIMUM) {
      client.send("signal", {type: "wait", mode: this.state.mode});
    }
  }

  async onLeave(client: Client, consented: boolean) {
    try {
      if (consented) {
        throw new Error("consented leave");
      }
      // allow disconnected client to reconnect into this room until 20 seconds
      await this.allowReconnection(client, 20);
    } catch (e) {
      this.dispatcher.dispatch(new OnLeaveCommand(), {
        sessionId: client.sessionId,
      });
    }
  }

  onDispose() {
    this.dispatcher.stop();
  }

  startGlobalTimer() {
    this.delayedInterval && this.delayedInterval.clear();
    this.clock.start();
    let timer = this.globalTimer;

    this.broadcast("signal", {
      type: "initializeTimer",
      payload: {value: this.globalTimer},
    });

    this.state.timerMode = false;

    this.delayedInterval = this.clock.setInterval(() => {
      if (timer === 0) {
        this.broadcast("signal", {
          type: "globalTimer",
          payload: {remaining: timer},
        });
        this.end();
      } else if (timer <= this.globalTimerSignalTimer) {
        this.state.status = "countdown";
        this.globalTimerSignalStarted = true;
        this.broadcast("signal", {
          type: "globalTimer",
          payload: {remaining: timer},
        });
      }
      timer--;
    }, 1000);
  }

  reviewRound() {
    this.state.status = "reviewing";
    const activeRound = this.activeRound();
    const puzzle = activeRound.puzzle;
    this.state.players.forEach((player, playerId) => {
      if (player.status !== "solved") {
        this.calculateScore(player, playerId, puzzle?.word);
      }
    });

    let totalReviewingTime = this.reviewTimer + this.prepareRoundTimer;
    this.delayedInterval && this.delayedInterval.clear();
    this.clock.start();
    this.delayedInterval = this.clock.setInterval(() => {
      this.broadcast("signal", {
        type: "reviewTimer",
        payload: {
          remaining: totalReviewingTime,
        }
      });
      if (totalReviewingTime === this.prepareRoundTimer) {
        this.kickIdlePlayersV2();

        this.addScore();
        // this.initializeRoundScore();
        // prepare time
        this.state.status = "preparing_new_round";
      } else if (totalReviewingTime === 0) {
        this.delayedInterval && this.delayedInterval.clear();
        this.clock && this.clock.clear();
        this.startNewRound();
      }
      totalReviewingTime--;
    }, 1000);
  }

  startNewGame() {
    this.state.activeRound = 1;
    // status for showing game start animation
    this.initializeRoundForNewGame();
    this.clock.setTimeout(() => {
      this.state.status = "playing";
    }, this.startingTimer * 1000);
  }

  startNewRound() {
    this.state.activeRound += 1;
    this.initializeRound();
  }

  initializeRoundForNewGame() {
    this.state.status = "starting";
    this.initializeForShare();
  }

  initializeRound() {
    this.state.status = "playing";
    this.initializeForShare();
  }

  initializeForShare() {
    const puzzle = this.wordGenerator.pickRandomWord();
    console.log("puzzle", puzzle);
    const newRound = new Round({
      puzzle: new Puzzle(puzzle),
    });
    this.state.rounds.set(this.state.activeRound.toString(), newRound);
    this.startGlobalTimer();
    this.globalTimerSignalStarted = false;
    this.initializePlayers();
  }

  kickIdlePlayersV2() {
    this.state.players.forEach((player, playerId) => {
      if (!player.activeForRound)
        player.numberOfInActiveRounds++;

      let allowedRounds = 2;

      if (this.state.mode === "public") {
        if ((player.numberOfRoundsSoFar - player.numberOfInActiveRounds) >= 5) {
          allowedRounds = 5;
        } else {
          allowedRounds = 2;
        }
      } else { // private
        allowedRounds = 10;
      }

      if (player.numberOfInActiveRounds >= allowedRounds) {
        this.broadcast("signal", {
          type: "kick",
          payload: {
            playerId,
          },
        });
      }
    });
  }

  initializePlayers() {
    this.state.players.forEach((player, playerId) => {
      this.initializePlayer(player);
    });
  }

  initializePlayer(player: Player) {
    player.pickedLetters = [];
    player.matchedIndices = [];
    player.matchedLetters = [];
    player.status = "not_solved";
    player.roundScore = 0;
    player.activeForRound = false;
    player.numberOfRoundsSoFar++;
  }

  activeRound() {
    return this.state.rounds.get(this.state.activeRound.toString());
  }

  endGame() {
    this.state.status = "ending";
    const activeRound = this.activeRound();
    const puzzle = activeRound.puzzle;
    this.state.players.forEach((player, playerId) => {
      if (player.status !== "solved") {
        this.calculateScore(player, playerId, puzzle?.word);
      }
    });

    let totalEndingTime = this.prepareGameTimer + this.endTimer;
    this.delayedInterval && this.delayedInterval.clear();
    this.clock.start();
    this.delayedInterval = this.clock.setInterval(() => {
      this.broadcast("signal", {
        type: "endTimer",
        payload: {
          remaining: totalEndingTime,
        }
      });
      if (totalEndingTime === this.prepareGameTimer) {
        this.kickIdlePlayersV2();

        this.addScore();
        this.awardTrophy();
        this.initializeRoundScore();
        // prepare time
        if (this.state.mode === "public") {
          this.state.status = "preparing_new_game";
        } else {
          this.state.status = "wait_after_end";
        }
      } else if (totalEndingTime === 0) {
        this.delayedInterval && this.delayedInterval.clear();
        this.clock && this.clock.clear();
        if (this.state.mode === "public") {
          this.initializeScore();
          this.startNewGame();
        }
      }
      totalEndingTime--;
    }, 1000);
  }

  calculateScore(player: Player, playerId: string, puzzle: string) {
    let pointsToReceive = 0;

    if (player.status === "solved") {
      let numberOfSolvedPlayers = 0; // current player belongs to solved player
      // receive 100 points because user solved the puzzle
      pointsToReceive += this.pointsForSolve;
      // receive points according to length of puzzle
      pointsToReceive += this.pointsForLetter * (puzzle?.replace(/\W/g, '')?.length || 0);

      this.state.players.forEach(player => {
        numberOfSolvedPlayers += ((player.status === "solved") ? 1 : 0);
      });

      switch (numberOfSolvedPlayers) {
        case 1:
          pointsToReceive += this.pointsForFirst;
          break;
        case 2:
          pointsToReceive += this.pointsForSecond;
          break;
        case 3:
          pointsToReceive += this.pointsForThird;
          break;
        default:
          pointsToReceive += 0;
      }
      const numberOfPickedLetters = (player?.pickedLetters?.length) || 0;
      const numberOfMatchedLetters = (player?.matchedLetters?.length) || 0;
      const numberOfRemainingBalloons = this.numberOfBalloons - (numberOfPickedLetters - numberOfMatchedLetters);
      pointsToReceive += numberOfRemainingBalloons * this.pointsForBalloon;
    } else {
      const numberOfFilledLetters = (player.matchedIndices && player.matchedIndices.length) || 0;
      pointsToReceive += numberOfFilledLetters * this.pointsForLetter;
    }

    if (!player.roundScore) player.roundScore = 0;
    player.roundScore += pointsToReceive;
    // if (this.state.activeRound < this.state.numberOfRounds) {
    //   player.roundScore += pointsToReceive;
    // } else {
    //   player.roundScore += pointsToReceive * 2;
    // }
  }

  addScore() {
    this.state.players.forEach(player => {
      if (!player.score) {
        player.score = 0;
      }

      player.score += player.roundScore;
    });
  }

  awardTrophy() {
    let tops: Player[] = [];
    this.state.players.forEach(player => {
      if (!(tops?.length > 0))
        tops = [player];
      else {
        if (player.score > tops?.[0].score) {
          tops = [player];
        } else if (player.score === tops?.[0].score){
          tops.push(player);
        }
      }
    });
    tops?.forEach(top => {
      if ((top.score ?? 0) > 0) {
        if (!top.trophy) {
          top.trophy = 1;
        } else {
          top.trophy++;
        }
      }
    });
  }

  initializeRoundScore() {
    this.state.players.forEach(player => {
      player.roundScore = 0;
    });
  }

  initializeScore() {
    this.state.players.forEach(player => {
      player.previousGameScore = player.score;
      player.score = 0;
    });
  }
}
