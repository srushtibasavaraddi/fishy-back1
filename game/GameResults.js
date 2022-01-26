const { roomArrayMap } = require("./GameVariables")

module.exports = (io, socket) => {

    const viewOptions = (code) => {
        let roomObject = roomArrayMap.get(code)
        calculateScores(roomObject.playerDetails, code)
        io.to(socket.id).emit('updated-players',roomObject.playerDetails)
        io.to(code).emit('showChoices')
    }

    const show = ({code, playerName}) => {
        let roomObject = roomArrayMap.get(code)
        for(var i in roomObject.playerDetails){
            if(roomObject.playerDetails[i].name === playerName)
                {
                    console.log('Match found!');
                    roomObject.playerDetails[i].eye = !roomObject.playerDetails[i].eye
                }
        }
        io.to(socket.id).emit('updated-players', roomObject.playerDetails)
        io.to(code).emit('updated-players', roomObject.playerDetails)
    }

    const calculateScores = (players, code) => {
        let choices = []
        choices[1] = 0
        choices[2] = 0
        let numberFish = []
        numberFish[1] = 0
        numberFish[2] = 0
        const roomObject = roomArrayMap.get(code)

        for (const player of players) {
            if (Number(player.choice) === 1) {
              choices[1] += 1;
            } else if (Number(player.choice) === 2) {
              choices[2] += 1;
            }
        }

        if (choices[1] === 4 && choices[2] === 0) {
            numberFish[1] = 250;
            numberFish[2] = 0;
          } else if (choices[1] === 3 && choices[2] === 1) {
            numberFish[1] = 0;
            numberFish[2] = 750;
          } else if (choices[1] === 2 && choices[2] === 2) {
            numberFish[1] = -125;
            numberFish[2] = 500;
          } else if (choices[1] === 1 && choices[2] === 3) {
            numberFish[1] = -250;
            numberFish[2] = 250;
          } else if (choices[1] === 0 && choices[2] === 4) {
            numberFish[1] = 0;
            numberFish[2] = -250;
          }
          if (roomObject.roundNumber === 5) {
            numberFish = numberFish.map(n => n * 3);
          } else if (roomObject.roundNumber === 8) {
            numberFish = numberFish.map(n => n * 5);
          } else if (roomObject.roundNumber === 10) {
            numberFish = numberFish.map(n => n * 10);
          }
          
        roomObject.scores[roomObject.roundNumber - 1] = []
        for (const player of players) {
            if(player.choice === 0)
              player.score = 0
            else
              player.score = numberFish[player.choice];   
            roomObject.scores[roomObject.roundNumber - 1].push(player.score)
            player.indivScore.push(player.score)
        }
    }

    const resultsRoom = (code) => {
        socket.join(code)
        io.to(socket.id).emit('updated-players', roomArrayMap.get(code).playerDetails)
    }

    
    socket.on('new-room', resultsRoom)
    socket.on('options', viewOptions)
    socket.on('show', show)
}