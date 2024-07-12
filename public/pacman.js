document.addEventListener('DOMContentLoaded', () => {
    // Flag to track leaderboard updates
    var leaderboardUpdated = false;

    // Variables to store HTML elements
    const boardElement = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    const messageElement = document.getElementById('message');
    const leaderboardElement = document.createElement('div');
    document.body.appendChild(leaderboardElement);

    // API call to update game state
    const updateGameState = () => {
        fetch('/api/game.php')
            .then(response => response.json())
            .then(data => {
                console.log('API Response:', data);
                if (Array.isArray(data.board)) {
                    boardElement.innerHTML = data.board.join(" ");
                } else {
                    console.error('Board data is not an array:', data.board);
                }
                scoreElement.textContent = 'Score: ' + data.score;
                if (data.game_over) {
                    messageElement.textContent = 'Game Over! Press R to restart.';
                    !leaderboardUpdated && fetchLeaderboard();
                    leaderboardUpdated = true;
                } else {
                    messageElement.textContent = '';
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // API call to move Pacman in passed in direction
    const movePacman = (direction) => {
        fetch(`/api/game.php?action=move&direction=${direction}`)
            .then(response => response.json())
            .then(data => {
                console.log('Move response:', data);
                updateGameState();
            })
            .catch(error => console.error('Error:', error));
    }

    // API call to reset game to initial state
    const resetGame = () => {
        fetch('/api/game.php?action=reset')
            .then(response => response.json())
            .then(data => {
                console.log('Reset response:', data);
                leaderboardUpdated = false;
                updateGameState();
            })
            .catch(error => console.error('Error:', error));
    }

    // API call to get updated leaderboard
    const fetchLeaderboard = () => {
        fetch('/api/game.php?action=get_leaderboard')
            .then(response => response.json())
            .then(data => {
                leaderboardElement.innerHTML = '<h2>Leaderboard</h2>';
                const list = document.createElement('ul');
                data.forEach((score, index) => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${index + 1}. Score: ${score}`;
                    list.appendChild(listItem);
                });
                leaderboardElement.appendChild(list);
            })
            .catch(error => console.error('Error:', error));
    }

    // API call for clearing session
    const clearSession = () => {
        fetch('/api/game.php?action=clear_session')
            .then(response => response.json())
            .then(data => {
                console.log('Session cleared:', data);
                fetchLeaderboard();
                resetGame();
            })
            .catch(error => console.error('Error:', error));
    }

    // Defining button behaviour
    document.getElementById('restartButton').addEventListener('click', resetGame);
    document.getElementById('clearSessionButton').addEventListener('click', clearSession);

    // Add listener for left/right arrow keys to control movement
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            movePacman('left');
        } else if (event.key === 'ArrowRight') {
            movePacman('right');
        }
    });

    // Reset game when "R" is pressed
    document.addEventListener("keypress", (event) => {
        if (event.key === 'r' || event.key === 'R') {
            resetGame();
        }
    });

    // Initial call to update game state when DOM is loaded
    updateGameState();
});