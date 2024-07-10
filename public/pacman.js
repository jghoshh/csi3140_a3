document.addEventListener('DOMContentLoaded', () => {
  const boardElement = document.getElementById('board');
  const scoreElement = document.getElementById('score');
  const messageElement = document.getElementById('message');
  const leaderboardElement = document.createElement('div');
  document.body.appendChild(leaderboardElement);

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
                  fetchLeaderboard();
              } else {
                  messageElement.textContent = '';
              }
          })
          .catch(error => console.error('Error:', error));
  }

 const movePacman = (direction) => {
      fetch(`/api/game.php?action=move&direction=${direction}`)
          .then(response => response.json())
          .then(data => {
              console.log('Move response:', data);
              updateGameState();
          })
          .catch(error => console.error('Error:', error));
  }

  const resetGame = () => {
      fetch('/api/game.php?action=reset')
          .then(response => response.json())
          .then(data => {
              console.log('Reset response:', data);
              updateGameState();
          })
          .catch(error => console.error('Error:', error));
  }

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

  const clearSession = () => {
    fetch('/api/game.php?action=clear_session')
        .then(response => response.json())
        .then(data => {
            console.log('Session cleared:', data);
            resetGame();  
        })
        .catch(error => console.error('Error:', error));
}


document.getElementById('clearSessionButton').addEventListener('click', clearSession);  

  document.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
          movePacman('left');
      } else if (event.key === 'ArrowRight') {
          movePacman('right');
      } else if (event.key === 'r' || event.key === 'R') {
          resetGame();
      }
  });

  updateGameState();
});