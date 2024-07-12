<?php
session_start();

header('Content-Type: application/json');

// Constant variables
const BOARD_SIZE = 10;
const PACMAN = "😀";
const GHOST = "👻";
const SCARED_GHOST = "😱";
const FRUIT = "🍒";
const EMPTY_CELL = "◦";
const DEAD = "💀";

// Sets initial board values
function initializeGameState() {
    $_SESSION['game_state'] = [
        'pacman_position' => floor(BOARD_SIZE / 2),
        'ghost_position' => -1,
        'score' => 0,
        'game_over' => false,
        'ghost_scared' => false,
        'board' => array_fill(0, BOARD_SIZE, EMPTY_CELL)
    ];
    $_SESSION['game_state']['board'][$_SESSION['game_state']['pacman_position']] = PACMAN;
    spawnFruit();
    spawnGhost();
}

// Returns a random empty cell index
function findEmptyCell() {
    $empty_cells = array_keys($_SESSION['game_state']['board'], EMPTY_CELL);
    return !empty($empty_cells) ? $empty_cells[array_rand($empty_cells)] : false;
}

// Spawns fruit in random location on board
function spawnFruit() {
    $pos = findEmptyCell();
    if ($pos !== false) {
        $_SESSION['game_state']['board'][$pos] = FRUIT;
    }
}

// Spawns ghost in random location on board
function spawnGhost() {
    $state = &$_SESSION['game_state'];
    $pos = findEmptyCell();
    if ($pos !== false) {
        $state['ghost_position'] = $pos;
        $state['board'][$pos] = GHOST;
        $state['ghost_scared'] = false;
    }
}

// Generic function for moving entity
function moveEntity(&$position, $direction) {
    $position = ($position + $direction + BOARD_SIZE) % BOARD_SIZE;
}

// Move Pacman left/right and update based on loation
function movePacman($direction) {
    $state = &$_SESSION['game_state'];
    if ($state['game_over']) return;

    $position = &$state['pacman_position'];
    $state['board'][$position] = EMPTY_CELL;
    moveEntity($position, $direction === 'left' ? -1 : 1);
    $newPositionValue = $state['board'][$position];

    $state['board'][$position] = PACMAN;  

    switch ($newPositionValue) { 
        case FRUIT:
            $state['score'] += 10;
            if ($state['ghost_position'] !== -1) {
                $state['ghost_scared'] = true;
                $state['board'][$state['ghost_position']] = SCARED_GHOST;
            }
            spawnFruit();
            moveGhost();
            break;
        case GHOST:
            $state['board'][$position] = DEAD;
            $state['game_over'] = true;
            return;
        case SCARED_GHOST:
            $state['score'] += 20;
            $state['ghost_position'] = -1;
            spawnGhost();
            break;
        default: 
            $state['score'] += 1;
            moveGhost();
    }

    if (!in_array(FRUIT, $state['board'])) {
        spawnFruit();
    }
}

// Move ghost and check if Pacman is hit
function moveGhost() {
    $state = &$_SESSION['game_state'];
    if ($state['ghost_position'] === -1 || $state['ghost_scared']) return;

    $previousCell = $state['board'][$state['ghost_position']];
    $state['board'][$state['ghost_position']] = $previousCell === FRUIT ? FRUIT : EMPTY_CELL;

    $direction = $state['pacman_position'] > $state['ghost_position'] ? 1 : -1;
    moveEntity($state['ghost_position'], $direction);

    if ($state['ghost_position'] === $state['pacman_position']) {
        $state['game_over'] = true;
        $state['board'][$state['pacman_position']] = DEAD;
    } else {
        $state['board'][$state['ghost_position']] = GHOST;
    }
}

// Update leaderboard with latest score
function updateLeaderboard() {
    if (!isset($_SESSION['leaderboard'])) $_SESSION['leaderboard'] = [];
    $_SESSION['leaderboard'][] = $_SESSION['game_state']['score'];
    rsort($_SESSION['leaderboard']);
    $_SESSION['leaderboard'] = array_slice($_SESSION['leaderboard'], 0, 10);
}

// Get action param from API calls
$action = $_GET['action'] ?? '';

// Check if game is initialized
if (!isset($_SESSION['game_state'])) {
    initializeGameState();
}

// Call functions based on passed action
switch ($action) {
    case 'move':
        $direction = isset($_GET['direction']) && in_array($_GET['direction'], ['left', 'right'])
            ? $_GET['direction'] : 'right';
        movePacman($direction);
        echo json_encode($_SESSION['game_state']);
        break;
    case 'reset':
        initializeGameState();
        echo json_encode($_SESSION['game_state']);
        break;
    case 'get_leaderboard':
        updateLeaderboard();
        echo json_encode($_SESSION['leaderboard'] ?? []);
        break;
    case 'clear_session':
        session_unset();
        session_destroy();
        echo json_encode(['message' => 'Session cleared']);
        break;
    default:
        echo json_encode($_SESSION['game_state']);
        break;
}
