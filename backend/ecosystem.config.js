// ecosystem.config.js
const os = require('os');
module.exports = {
    apps: [{
        port        : 3000,
        name        : "colyseus",
        script      : "lib/index.js", // your entrypoint file
        watch       : true,           // optional
        instances   : os.cpus().length,
        exec_mode   : 'fork',         // IMPORTANT: do not use cluster mode.
        env: {
            DEBUG: "colyseus:errors",
            NODE_ENV: "production",
        }
    }]
}