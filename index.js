document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM элементы =====
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.querySelector('.progress');
    const gameContainer = document.querySelector('.game-container');
    const squirrel = document.getElementById('squirrel');
    const obstaclesContainer = document.getElementById('obstacles-container');
    const nutsContainer = document.getElementById('nuts-container');
    const gameOverScreen = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    const nutsCount = document.getElementById('nuts-count');
    const metersCount = document.getElementById('meters-count');
    const finalNuts = document.getElementById('final-nuts');
    const finalMeters = document.getElementById('final-meters');
    

    // ===== Настройки игры =====
    const GAME_SPEED = 10; // Увеличенная скорость
    const JUMP_HEIGHT = 250; // Высокий прыжок
    const OBSTACLE_GAP = 1000; // Интервал между айсбергами
    const NUT_GAP = 1200; // Интервал между орех0 
    const PLATFORM_HEIGHT = 150; // Высота платформы
    const DISTANCE_FACTOR = 0.3;
    const METERS_PER_FRAME = 0.5;
    
    let isJumping = false;
    let isGameOver = false;
    let nutsCollected = 0;
    let distance = 0;
    let lastFrameTime = 0;
    let obstacleInterval;
    let nutInterval;

    // ===== Инициализация =====
    initGame();

    function initGame() {
        // Анимация загрузки
        simulateLoading();
        
        // Добавление стилей анимации
        addAnimationStyles();
       
    }

    let lastTime = 0;
function gameLoop(currentTime) {
    if (isGameOver) return;
    
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    

    checkCollisions();
    requestAnimationFrame(gameLoop);
}

    function simulateLoading() {
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
                    startGame();
                }, 500);
            }
        }, 200);
    }

    function addAnimationStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @keyframes jump {
                0%, 100% { bottom: ${PLATFORM_HEIGHT}px; }
                50% { bottom: ${PLATFORM_HEIGHT + JUMP_HEIGHT}px; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                20%, 40%, 60%, 80% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(styleElement);
    }

    // ===== Игровая логика =====
    function startGame() {
        isGameOver = false;
         nutsCollected = 0;
         distance = 0;
         lastTime = 0;
        
        // Очистка предыдущих элементов
        obstaclesContainer.innerHTML = '';
        nutsContainer.innerHTML = '';
        
        // Сброс позиции белки
        squirrel.style.bottom = `${PLATFORM_HEIGHT}px`;
        squirrel.style.animation = '';

        // Сбрасываем отображение
       metersCount.textContent = '0';
       nutsCount.textContent = '0';
        
        // Запуск генерации объектов
        obstacleInterval = setInterval(createObstacle, OBSTACLE_GAP);
        nutInterval = setInterval(createNut, NUT_GAP);
        
        requestAnimationFrame(gameLoop);
        obstacleLoop();
        initGame();
    }

    // ===== Создание объектов =====
    function createObstacle() {
        if (isGameOver) return;

        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.width = '220px';
        obstacle.style.height = '220px';
        obstacle.style.left = `${window.innerWidth}px`;
        obstacle.style.bottom = `${PLATFORM_HEIGHT}px`;
        
        obstaclesContainer.appendChild(obstacle);

        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }

            const currentLeft = parseInt(obstacle.style.left);
            obstacle.style.left = `${currentLeft - GAME_SPEED}px`;

            // Проверка столкновения
            if (checkCollision(squirrel, obstacle) && !isJumping) {
                gameOver();
                clearInterval(moveInterval);
            }

            if (currentLeft < -220) {
                clearInterval(moveInterval);
                obstacle.remove();
            }
        }, 16);
    }

    function createNut() {
        if (isGameOver) return;

        const nut = document.createElement('div');
        nut.className = 'nut';
        nut.style.width = '100px';
        nut.style.height = '100px';
        nut.style.left = `${window.innerWidth}px`;
        nut.style.bottom = '350px';
        
        nutsContainer.appendChild(nut);

        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }

            const currentLeft = parseInt(nut.style.left);
            nut.style.left = `${currentLeft - GAME_SPEED}px`;

            // Проверка сбора ореха
            if (checkNutCollection(nut)) {
                nutsCollected++;
                document.getElementById('nuts-count').textContent = nutsCollected;
                clearInterval(moveInterval);
                nut.remove();
            }

            if (currentLeft < -100) {
                clearInterval(moveInterval);
                nut.remove();
            }
        }, 16);
    }


    function gameLoop(timestamp) {
    if (isGameOver) return;
    
    
    // Проверяем столкновения
    checkCollisions();
    
    // Продолжаем игровой цикл
    requestAnimationFrame(gameLoop);
    }

    // ===== Проверка столкновений =====
    function checkCollision(squirrel, obstacle) {
        const squirrelRect = squirrel.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        
        return (
            squirrelRect.right > obstacleRect.left + 60 &&
            squirrelRect.left < obstacleRect.right - 60 &&
            squirrelRect.bottom > obstacleRect.top + 40 &&
            squirrelRect.top < obstacleRect.bottom
        );
    }

    function checkNutCollection(nut) {
        const squirrelRect = squirrel.getBoundingClientRect();
        const nutRect = nut.getBoundingClientRect();
        
        return (
            squirrelRect.right > nutRect.left + 40 &&
            squirrelRect.left < nutRect.right - 40 &&
            squirrelRect.bottom > nutRect.top + 30 &&
            squirrelRect.top < nutRect.bottom - 30 &&
            isJumping
        );
    }

    // ===== Прыжок =====
    function jump() {
        if (isJumping || isGameOver) return;
        
        isJumping = true;
        squirrel.style.animation = 'jump 0.7s ease-out';
        
        setTimeout(() => {
            squirrel.style.animation = 'none';
            isJumping = false;
        }, 700);
    }

    // ===== Конец игры =====
    function gameOver() {
        isGameOver = true;
        clearInterval(obstacleInterval);
        clearInterval(nutInterval);
        
        document.getElementById('final-nuts').textContent = nutsCollected;
        document.getElementById('final-meters').textContent = Math.floor(distance);
        gameOverScreen.style.display = 'block';
        
        // Эффект тряски
        gameContainer.style.animation = 'shake 0.5s';
    }

    // ===== Управление =====
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });
    
    document.addEventListener('click', jump);
    
    restartBtn.addEventListener('click', () => {
        gameOverScreen.style.display = 'none';
        gameContainer.style.animation = '';
        startGame();
    });
});