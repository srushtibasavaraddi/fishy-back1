const { roomArrayMap } = require("./GameVariables")

module.exports = (io,socket) => {
    const joinLobby = (gameCode) => {
        socket.join(gameCode)
        const roomObject = roomArrayMap.get(gameCode)
        io.in(gameCode).emit('players', roomObject.players)
    }

    const startGame = (gameCode) => {
        roomArrayMap.get(gameCode).playerDetails.map(player => player.time = roomArrayMap.get(gameCode).timer)
        io.to(gameCode).emit('start')
    }

    socket.on('start-game', startGame)
    socket.on('join-lobby', joinLobby)
}