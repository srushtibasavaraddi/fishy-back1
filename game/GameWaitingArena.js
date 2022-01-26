const { roomArrayMap } = require("./GameVariables")

module.exports = (io, socket) => {
    const startNextRound = (code) => {
        const roomObject = roomArrayMap.get(code)
        roomObject.roundNumber += 1
        io.in(code).emit('next-round-started', roomObject.roundNumber)
        
    }

    const joinGame = (code) => {
        socket.join(code)
        io.in(code).emit('round-number', roomArrayMap.get(code).roundNumber + 1)
    }

    const skipRound = (code) => {
        let roomObject = roomArrayMap.get(code)
        console.log(roomObject.roundNumber);
        roomObject.roundNumber += 1
        roomObject.scores[roomObject.roundNumber - 1] =  []
        for(let i in roomObject.playerDetails){
            roomObject.scores[roomObject.roundNumber - 1].push(0)
            roomObject.playerDetails[i].indivScore.push(0)
        }
        io.to(socket.id).emit('skipped-round-number', roomArrayMap.get(code).roundNumber + 1)
        io.in(code).emit('message',  {message : `Round ${roomObject.roundNumber} was skipped!`})
    }

    const gameOver = (code) => {
        io.in(code).emit('game-over')
    }

    socket.on('game-over', gameOver)
    socket.on('join-game', joinGame)
    socket.on('start-next-round', startNextRound)
    socket.on('skip-round', skipRound)
}