<?php
session_start();

header('Content-Type: application/json');

const BOARD_SIZE = 10;
const PACMAN = "😀";
const GHOST = "👻";
const SCARED_GHOST = "😱";
const FRUIT = "🍒";
const EMPTY_CELL = "◦";
const DEAD = "💀";

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

function findEmptyCell() {
    $empty_cells = array_keys($_SESSION['game_state']['board'], EMPTY_CELL);
    return !empty($empty_cells) ? $empty_cells[array_rand($empty_cells)] : false;
}

function spawnFruit() {
    $pos = findEmptyCell();
    if ($pos !== false) {
        $_SESSION['game_state']['board'][$pos] = FRUIT;
    }
}

function spawnGhost() {
    $state = &$_SESSION['game_state'];
    $pos = findEmptyCell();
    if ($pos !== false) {
        $state['ghost_position'] = $pos;
        $state['board'][$pos] = GHOST;
        $state['ghost_scared'] = false;
    }
}

function moveEntity(&$position, $direction) {
    $position = ($position + $direction + BOARD_SIZE) % BOARD_SIZE;
}

function movePacman($direction) {
    $state = &$_SESSION['game_state'];
    if ($state['game_over']) return;

    $position = &$state['pacman_position'];
    $state['board'][$position] = EMPTY_CELL;
    moveEntity($position, $direction === 'left' ? -1 : 1);
    $newPositionValue = $state['board'][$position];

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
            $state['game_over'] = true;
            $state['board'][$position] = DEAD;
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

    $state['board'][$position] = PACMAN;  

    if (!in_array(FRUIT, $state['board'])) {
        spawnFruit();
    }
}

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


function updateLeaderboard() {
    if (!isset($_SESSION['leaderboard'])) $_SESSION['leaderboard'] = [];
    $_SESSION['leaderboard'][] = $_SESSION['game_state']['score'];
    rsort($_SESSION['leaderboard']);
    $_SESSION['leaderboard'] = array_slice($_SESSION['leaderboard'], 0, 10);
}

$action = $_GET['action'] ?? '';

if (!isset($_SESSION['game_state'])) {
    initializeGameState();
}

switch ($action) {
    case 'move':
        $direction = isset($_GET['direction']) && in_array($_GET['direction'], ['left', 'right'])
            ? $_GET['direction'] : 'right';
        movePacman($direction);
        if ($_SESSION['game_state']['game_over']) {
            updateLeaderboard();
        }
        echo json_encode($_SESSION['game_state']);
        break;
    case 'reset':
        initializeGameState();
        echo json_encode($_SESSION['game_state']);
        break;
    case 'get_leaderboard':
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
