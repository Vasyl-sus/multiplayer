import { Room, Client } from "colyseus.js";

export function requestJoinOptions (this: Client, i: number) {
    return { requestNumber: i };
}

export function onJoin(this: Room) {
    console.log(this.sessionId, "joined.");
    setInterval(() => {
        console.log("send random number");
        this.send("random", {
            "country": "Canada",
            "day": 18,
            "gender": 0,
            "height": "6'11\"",
            "measureType": "Imperial",
            "month": 5,
            "timeZone": "GMT-06:00",
            "weight": "140",
            "workStartTime": "07:00",
            "workStartTimeType": "AM",
            "workdayLength": 12,
            "year": 1999
        });
    }, 200);
    this.onMessage("*", (type, message) => {
        console.log(this.sessionId, "received:", type, message);
    });
}

export function onLeave(this: Room) {
    console.log(this.sessionId, "left.");
}

export function onError(this: Room, err: any) {
    console.log(this.sessionId, "!! ERROR !!", err.message);
}

export function onStateChange(this: Room, state: any) {
    console.log(this.sessionId, "new state:", state);
}
