# 1D Pacman Server-based Implementation (CSI3140 Assignment 3)

**Authors**:

- Jay Ghosh (300243766)
- Noah Do Rego (300234846)

## Instructions

To run the game:

1. Download the source code from Github.
2. Navigate to the root dir (`/csi3140_a3`).
3. To run the game via the included shell script, run `sh start.sh` in your CLI.
   - Otherwise, navigate to `/public` and run `php -S localhost:8000`.
4. Open localhost:8000 in your browser.

## Rules:

- Use the `LEFT` and `RIGHT` arrow keys to move PACMAN consume as many hollow circles as possible without encountering a ghost.
- If PACMAN encounters a ghost, the game ends and the final score is printed out.
- If PACMAN encounters a cherry, the ghosts on the board are turned into surprised faces.
- If PACMAN encounters a suprised face, PACMAN consumes it and gains 5 points.
- If PACMAN encounters a hollow circle, PACMAN consumes it and gains 1 point.

## Game States:

#### Game Started

![Game Started](docs/design_system/images/game_started.png "State 1: Game Started")

#### Game In Progress

![Game In Progress](docs/design_system/images/game_in_progress.png "State 2: Game In Progress")

#### Game Over

![Game Over](docs/design_system/images/game_finished.png "State 2: Game Finished")

## Design System:

[Link to design system](docs/design_system.md)
