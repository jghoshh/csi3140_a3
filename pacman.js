var score = 0, pacLoc = 0, fruitLoc = 0, ghostLoc = -1;
var board = [];
var player = "😀", ghost = "👻";
var ateGhost = true, gameEnded = false;

function createGame(n) {
    board = new Array(n);
    board.fill("◦");

    // Initialize Pacman in middle
    pacLoc = Math.floor(n / 2);
    board[pacLoc] = player;

    // Randomize fruit on board
    fruitLoc = fruitSpawnLocation(n, pacLoc);
    board[fruitLoc] = "🍒";

    document.getElementById("board").innerHTML = board.join(" ");
    document.getElementById("score").innerHTML = score;
}

function fruitSpawnLocation(length, pacLoc) {
    var num = Math.floor(Math.random() * length);
    return (num === pacLoc) ? num + 1 : num;
}

function movePac(direction) {
    board[pacLoc] = "&nbsp;";
    if (direction == 'right') {
        pacLoc = (pacLoc + 1) % (board.length);
        checkLocation(pacLoc);
    } else if (direction == 'left') {
        pacLoc = (pacLoc - 1);
        pacLoc = pacLoc < 0 ? board.length - 1 : pacLoc;
        checkLocation(pacLoc);
    }

    if (!board.includes("◦")) {
        board = board.toString().replaceAll("&nbsp;", "◦").split(",");
        fruitLoc = fruitSpawnLocation(board.length, pacLoc);
        board[fruitLoc] = "🍒";
        document.getElementById("board").innerHTML = board.join(" ");
    }
}

function checkLocation(loc) {
    if (board[loc] != " ") {
        if (board[loc] == "◦") {
            score += 1;
            document.getElementById("score").innerHTML = score;
        }
        else if (board[loc] == "🍒") {
            ghost = "😱"
            board[ghostLoc] = ghost;
            document.getElementById("board").innerHTML = board.join(" ");
        }
        else if (board[loc] == "😱") {
            document.getElementById("board").innerHTML = board.join(" ");
            score += 5;
            document.getElementById("score").innerHTML = score;
            ateGhost = true;
            setTimeout(spawnGhost, 2000);
        }
        else if (board[loc] == "👻") {
            endGame();
        }
    }

    board[pacLoc] = player;
    document.getElementById("board").innerHTML = board.join(" ");
}

function spawnGhost() {
    if (ateGhost) {
        ghost = "👻";
        ateGhost = false;
        if (pacLoc > board.length / 2) {
            ghostLoc = 0;
        } else {
            ghostLoc = board.length - 1;
        }

        board[ghostLoc] = ghost;
        document.getElementById("board").innerHTML = board.join(" ");

        setTimeout(moveGhost, 1000);
    }
}

function moveGhost() {
    if (ghost == "👻" && !ateGhost) {
        if (pacLoc < ghostLoc) {
            board[ghostLoc] = "◦";
            ghostLoc -= 1;
        } else if (pacLoc > ghostLoc) {
            board[ghostLoc] = "◦";
            ghostLoc += 1;
        }
    } else if (ghost == "😱") {
        if (pacLoc < ghostLoc) {
            board[ghostLoc] = "◦";
            ghostLoc = ghostLoc < board.length - 1 ? (ghostLoc + 1) : ghostLoc;
        } else if (pacLoc > ghostLoc) {
            board[ghostLoc] = "◦";
            ghostLoc = ghostLoc == 0 ? ghostLoc : ghostLoc - 1;
        }
    }
    board[ghostLoc] = ghost;
    document.getElementById("board").innerHTML = board.join(" ");

    if (ghostLoc == pacLoc) {
        if (ghost == "👻") {
            endGame();
        } else if (ghost == "😱") {
            document.getElementById("board").innerHTML = board.join(" ");
            score += 5;
            document.getElementById("score").innerHTML = score;
            ateGhost = true;
            setTimeout(spawnGhost, 2000);
        }
        return;
    }

    setTimeout(() => {
        if (!gameEnded && !ateGhost) {
            moveGhost();
        }
    }, 1000);
}

function endGame() {
    gameEnded = true;
    player = "💀";
    board[pacLoc] = player;
    document.getElementById("board").innerHTML = board.join(" ");
    score = "Game Over - Final Score: " + score;
    document.getElementById("score").innerHTML = score;
    return;
}

// Detect key presses
document.onkeyup = function (e) {
    if (!gameEnded && player != "💀") {
        switch (e.key) {
            case "ArrowLeft":
                movePac('left');
                break;
            case "ArrowRight":
                movePac('right');
                break;
        }
    }
};

createGame(10);
setTimeout(spawnGhost, 2000);