import React, {useEffect} from "react";
import * as Colyseus from "colyseus.js";
import {socketUrl} from "../config";

function Lobby(props) {
  const {id, session} = props;
  let client = new Colyseus.Client(socketUrl);

  useEffect(() => {
    async function reconnect() {
      if (id && session) {
        try {
          const room = await client.reconnect(id, session);
          console.log("socket reconnect success", room);
          roomListener(room);
        } catch (e) {
          console.error("socket reconnect error", e);
        }
      }
    }

    reconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roomListener = (room) => {
    const {id, sessionId} = room;
    room.state.listen("status", (value) => {
      if (value !== "waiting") { // if game started
        window.location.href = `/play/${id}/${sessionId}`;
      }
    });
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center'}}>
      <div>
        <h2>Searching for game</h2>
      </div>
    </div>
  );
}

export default Lobby;