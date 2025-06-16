# Welcome to Colyseus!

This project has been created using [⚔️ `create-colyseus-app`](https://github.com/colyseus/create-colyseus-app/) - an npm init template for kick starting a Colyseus project in TypeScript.

[Documentation](http://docs.colyseus.io/)

## :crossed_swords: Usage

```
npm start
```

## Frontend (single version)
```
src/frontend/Multiplayer/Core.js
    insert domain of production server(line 130 availableDomains)
```

## Frontend (multiplayer version https://github.com/[user]/Multiplayer-frontend-react)
```
    1. npm install
    2. edit src/config/index.js (set to production backend url and coolmath url for coping lobby url)
    3. npm run build
    you will see generated build directory that will be used for Setting up
```

## Setting up
```
1. under root
    npm install
2. under root
    npm run build
3. then lib directory will be made, move into lib
    npm install
4. copy src/frontend/Multiplayer to lib/frontend
5. run server
    pm2 index.js
6. Then You will see the running server on 3000 as http
    you can redirect this 3000 port to ssl secured domain by using nginx
```

## Structure

- `index.ts`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `src/rooms/MyRoom.ts`: an empty room handler for you to implement your logic
- `src/rooms/schema/MyRoomState.ts`: an empty schema used on your room's state.
- `loadtest/example.ts`: scriptable client for the loadtest tool (see `npm run loadtest`)
- `package.json`:
    - `scripts`:
        - `npm start`: runs `ts-node-dev index.ts`
        - `npm run loadtest`: runs the [`@colyseus/loadtest`](https://github.com/colyseus/colyseus-loadtest/) tool for testing the connection, using the `loadtest/example.ts` script.
- `tsconfig.json`: TypeScript configuration file


## License

MIT
