const { roomArrayMap } = require("./GameVariables");

module.exports = (io, socket) => {
  const toggleChoice = ({ num, playerName, code }) => {
    let roomObject = roomArrayMap.get(code);
    roomObject.playerDetails.find(player => {
      if (player.name === playerName) {
        player.toggle = num;
        player.choice = num;
        player.realChoice = 0;
      }
    });
    io.in(code).emit("toggled", roomObject.playerDetails);
  };

  const submitChoice = ({ choice, playerName, code }) => {
    let roomObject = roomArrayMap.get(code);
    console.log(choice, playerName, code);
    roomObject.playerDetails.find(player => {
      //   console.log("type of player id ", typeof player.id);
      if (player.name === playerName) {
        console.log("Found player", player.name);
        if (player.realChoice === 0) {
          console.log(roomObject.totalPeopleWhoSubmittedChoice);
          roomObject.totalPeopleWhoSubmittedChoice += 1;
        }
        player.toggle = 0;
        player.choice = choice;
        player.realChoice = choice;
        player.disabled = true;
        // if (!player.disabled || (player.disabled && roomArrayMap.get(code).paused)) {
        //   console.log("disabling", player.name);
        //   roomObject.totalPeopleWhoSubmittedChoice += 1;
        // }
        if (player.realChoice)
          io.in(code).emit("updateChoice", {
            name: player.name,
            choice: player.choice,
          });
      }
    });
    io.in(code).emit("chosen", roomObject.playerDetails);
    if (
      roomObject.totalPeopleWhoSubmittedChoice === roomObject.players.length
    ) {
      console.log("stopped timer");
      io.in(code).emit("stop-timer");
    }
    // console.log("Player Submitted choice!");
  };

  const playGame = ({ code, playerName }) => {
    socket.join(code);
    let roomObject = roomArrayMap.get(code);
    roomObject.playerDetails.find(player => {
      if (player.name === playerName) {
        if (player.realChoice > 0)
          io.to(socket.id).emit("choice", player.choice);
        if (player.disabled === true)
          io.to(socket.id).emit("disabled-status", player.disabled);
        io.to(socket.id).emit("indivScore", player.indivScore);
      }
    });

    io.to(socket.id).emit("new-timer", roomObject.timer);
    io.to(socket.id).emit("pause-status", roomObject.paused);
  };

  const pause = code => {
    io.in(code).emit("pause");
    console.log(code);
    roomArrayMap.get(code).paused = true;
    roomArrayMap.get(code).disabled = true;
    for (const player of roomArrayMap.get(code).playerDetails) {
      player.disabled = true;
    }
  };

  const resume = code => {
    io.in(code).emit("resume");
    roomArrayMap.get(code).disabled = false;
    roomArrayMap.get(code).paused = false;
    for (const player of roomArrayMap.get(code).playerDetails) {
      player.disabled = false;
    }
  };

  const playGameAsHost = code => {
    let roomObject = roomArrayMap.get(code);
    socket.join(code);
    io.to(socket.id).emit("new-timer", roomObject.timer);
    io.to(socket.id).emit("pause-status", roomObject.paused);
    io.to(socket.id).emit("player-values", roomObject.playerDetails);
  };

  const quitGame = code => {
    console.log(`Quit Game called!`);
    io.in(code).emit("quit-game");
  };

  socket.on("quitGame", quitGame);
  socket.on("join-host", playGameAsHost);
  socket.on("resume", resume);
  socket.on("pause", pause);
  socket.on("join-players", playGame);
  socket.on("toggle", toggleChoice);
  socket.on("submit", submitChoice);
};
