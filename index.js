document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.querySelector('.progress');
    const gameContainer = document.querySelector('.game-container');
    
    // Имитация загрузки
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 10;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        
        if (progress >= 100) {
            clearInterval(loadingInterval);
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                gameContainer.style.display = 'block';
                initGame();
            }, 500);
        }
    }, 200);
    // Добавляем стили для анимаций напрямую в CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes jump {
            0%, 100% { bottom: 120px; }
            50% { bottom: 300px; }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
    `;
    // Безопасное добавление стилей
    if (document.head) {
        document.head.appendChild(styleElement);
    } else {
        document.documentElement.appendChild(styleElement);
    }

    // Остальной код игры
    const squirrel = document.getElementById('squirrel');
    const obstaclesContainer = document.getElementById('obstacles-container');
    const nutsContainer = document.getElementById('nuts-container');
    const gameOverScreen = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    
    // Настройки игры
    const GAME_SPEED = 8;
    const JUMP_HEIGHT = 180;
    const OBSTACLE_GAP = 1500;
    const NUT_GAP = 1200;
    
    let isJumping = false;
    let isGameOver = false;
    let nutsCollected = 0;
    let distance = 0;
    let gameInterval;
    let obstacleInterval;
    let nutInterval;

    // Прыжок белки
    function jump() {
        if (isJumping || isGameOver) return;
        
        isJumping = true;
        squirrel.style.animation = 'jump 0.6s linear';
        
        setTimeout(() => {
            squirrel.style.animation = 'none';
            isJumping = false;
        }, 600);
    }

    // Создание препятствий
    function createObstacle() {
        if (isGameOver) return;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.left = '100%';
        obstaclesContainer.appendChild(obstacle);
        
        let pos = window.innerWidth;
        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }
            
            pos -= GAME_SPEED;
            obstacle.style.left = `${pos}px`;
            distance += 0.1;
            document.getElementById('meters-count').textContent = Math.floor(distance);
            
            // Проверка столкновения
            const squirrelRect = squirrel.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();
            
            if (
                squirrelRect.right > obstacleRect.left + 50 &&
                squirrelRect.left < obstacleRect.right - 50 &&
                squirrelRect.bottom > obstacleRect.top + 40 &&
                !isJumping
            ) {
                gameOver();
            }
            
            if (pos < -200) {
                clearInterval(moveInterval);
                obstacle.remove();
            }
        }, 20);
    }

    // Создание орехов
    function createNut() {
        if (isGameOver) return;
        
        const nut = document.createElement('div');
        nut.className = 'nut';
        nut.style.left = '100%';
        nutsContainer.appendChild(nut);
        
        let pos = window.innerWidth;
        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }
            
            pos -= GAME_SPEED;
            nut.style.left = `${pos}px`;
            
            // Проверка сбора
            const squirrelRect = squirrel.getBoundingClientRect();
            const nutRect = nut.getBoundingClientRect();
            
            if (
                squirrelRect.right > nutRect.left + 30 &&
                squirrelRect.left < nutRect.right - 30 &&
                squirrelRect.bottom > nutRect.top + 20 &&
                squirrelRect.top < nutRect.bottom - 20 &&
                isJumping
            ) {
                nutsCollected++;
                document.getElementById('nuts-count').textContent = nutsCollected;
                clearInterval(moveInterval);
                nut.remove();
            }
            
            if (pos < -100) {
                clearInterval(moveInterval);
                nut.remove();
            }
        }, 20);
    }

    // Конец игры
    function gameOver() {
        isGameOver = true;
        clearInterval(obstacleInterval);
        clearInterval(nutInterval);
        
        document.getElementById('final-nuts').textContent = nutsCollected;
        document.getElementById('final-meters').textContent = Math.floor(distance);
        gameOverScreen.style.display = 'block';
        
        // Эффект тряски
        document.querySelector('.game-container').style.animation = 'shake 0.5s';
    }

    // Рестарт игры
    restartBtn.addEventListener('click', () => {
        isGameOver = false;
        nutsCollected = 0;
        distance = 0;
        obstaclesContainer.innerHTML = '';
        nutsContainer.innerHTML = '';
        gameOverScreen.style.display = 'none';
        document.getElementById('nuts-count').textContent = '0';
        document.getElementById('meters-count').textContent = '0';
        squirrel.style.bottom = '120px';
        squirrel.style.animation = '';
        document.querySelector('.game-container').style.animation = '';
        startGame();
    });

    // Управление
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });
    
    document.addEventListener('click', jump);
    
    // Запуск игры
    function startGame() {
        obstacleInterval = setInterval(createObstacle, OBSTACLE_GAP);
        nutInterval = setInterval(createNut, NUT_GAP);
    }
    
    startGame();
});