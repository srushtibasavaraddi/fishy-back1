const { roomArrayMap } = require("./GameVariables")

module.exports = (io, socket) => {
    const showScores = (code) => {
        let roomObject = roomArrayMap.get(code)
        const scores = roomObject.scores
        const players = roomObject.playerDetails
        io.to(code).emit('come-to-scores')
        io.to(socket.id).emit('scores', {scores, players})
    }

    const joinScores = (code) => {
        socket.join(code)
        let roomObject = roomArrayMap.get(code)
        const scores = roomObject.scores
        const players = roomObject.playerDetails
        io.to(socket.id).emit('scores', {scores, players})
    }

    const setVisible = (code) => {
        io.in(code).emit('set-visible')
    }

    const waitingArena = (code) => {
        let roomObject = roomArrayMap.get(code)
        roomObject.playerDetails.map(player => {
            player.eye = false
            player.choice = 0
            player.toggle = 0
            player.realChoice = 0
            player.disabled = false
            player.time = 120
            player.timeFormat = '0:00'
            player.timePercent = 0
        })
        roomObject.hostTime = roomObject.timer
        roomObject.hostTimeFormat = '0:00'
        roomObject.paused  = false,
        roomObject.hostDisabled = false
        roomObject.totalPeopleWhoSubmittedChoice = 0
        io.to(code).emit('join-waiting')
    }

    socket.on('waiting-arena', waitingArena)
    socket.on('join-scores', joinScores)
    socket.on('show-scores', showScores)
    socket.on('set-visible', setVisible)
}