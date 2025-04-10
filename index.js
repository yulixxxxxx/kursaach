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
    const GAME_SPEED = 12;
    const JUMP_HEIGHT = 250;
    const OBSTACLE_GAP = 1000;
    const NUT_GAP = 900;
    const PLATFORM_HEIGHT = 150;
    const METERS_SPEED = 0.05;

    let isNightMode = false;
    let lastTransitionMeters = 0;
    let isJumping = false;
    let isGameOver = false;
    let nutsCollected = 0;
    let distance = 0;
    let nutInterval;


    // ===== Функция проверки столкновений =====
    function checkCollisions() {
        const squirrelRect = squirrel.getBoundingClientRect();
        
        // Проверка столкновений с айсбергами
        document.querySelectorAll('.obstacle').forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            
            if (
                squirrelRect.right > obstacleRect.left + 50 &&
                squirrelRect.left < obstacleRect.right - 50 &&
                squirrelRect.bottom > obstacleRect.top + 40 &&
                !isJumping
            ) {
                gameOver();
            }
        });
        
        // Проверка сбора орехов
        document.querySelectorAll('.nut').forEach(nut => {
            if (checkNutCollection(nut)) {
                nutsCollected++;
                nutsCount.textContent = nutsCollected;
                nut.remove();
            }
        });
    }

    // ===== Проверка сбора орехов =====
    function checkNutCollection(nut) {
        const squirrelRect = squirrel.getBoundingClientRect();
        const nutRect = nut.getBoundingClientRect();
        
        return (
            squirrelRect.right > nutRect.left + 30 &&
            squirrelRect.left < nutRect.right - 30 &&
            squirrelRect.bottom > nutRect.top + 20 &&
            squirrelRect.top < nutRect.bottom - 20 &&
            isJumping
        );
    }

    // ===== Генерация айсбергов =====
    function obstacleLoop() {
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

            // Проверка столкновения с помощью checkCollisions
            checkCollisions();

            if (currentLeft < -220) {
                clearInterval(moveInterval);
                obstacle.remove();
            }
        }, 16);

        setTimeout(obstacleLoop, OBSTACLE_GAP);
    }

    // ===== Генерация орехов =====
    function createNut() {
        if (isGameOver) return;

        const nut = document.createElement('div');
        nut.className = 'nut';
        nut.style.width = '80px';
        nut.style.height = '80px';
        nut.style.left = `${window.innerWidth}px`;
        nut.style.bottom = `${PLATFORM_HEIGHT + 150}px`; // Чуть выше платформы
        
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
                nutsCount.textContent = nutsCollected;
                clearInterval(moveInterval);
                nut.remove();
            }

            if (currentLeft < -80) {
                clearInterval(moveInterval);
                nut.remove();
            }
        }, 16);
    }

    // ===== Игровой цикл =====
    function gameLoop() {
        if (isGameOver) return;
        
        distance += METERS_SPEED;
        metersCount.textContent = Math.floor(distance);

        // Проверка смены дня и ночи
    checkDayNightTransition();

         // Активация ночного режима при 500 метрах
    if (distance >= 500 && !isNightMode) {
        activateNightMode();
        isNightMode = true;
    }
        
        checkCollisions();
        requestAnimationFrame(gameLoop);
    }

    function checkDayNightTransition() {
        const currentMeters = Math.floor(distance);
        
        // Массив с точками перехода 
        const transitions = [
            [500, true],   // 500м → ночь
            [700, false],  // 700м → день
            [1000, true],  // 1000м → ночь
            [1400, false], // 1400м → день
            [1700, true],  // 1700м → ночь
            [2000, false]  // 2000м → день
        ];
        
        // Проверяем все переходы
        for (const [meters, shouldBeNight] of transitions) {
            if (currentMeters >= meters && lastTransitionMeters < meters) {
                if (shouldBeNight !== isNightMode) {
                    toggleDayNight();
                }
                lastTransitionMeters = meters;
                break;
            }
        }
    }

    function toggleDayNight() {
        isNightMode = !isNightMode;
        const nightOverlay = document.getElementById('night-overlay');
        
        if (isNightMode) {
            nightOverlay.classList.add('night-mode');
            document.body.classList.add('night-mode');
            createStars();
        } else {
            nightOverlay.classList.remove('night-mode');
            document.body.classList.remove('night-mode');
            clearStars();
        }
    }


    function activateNightMode() {
        const nightOverlay = document.getElementById('night-overlay');
        nightOverlay.classList.add('night-mode');
        document.body.classList.add('night-mode');
        
        // Можно добавить дополнительные эффекты, например, звезды
        createStars();
    }

    function createStars() {
        const nightOverlay = document.getElementById('night-overlay');
        nightOverlay.innerHTML = '';
        for (let i = 0; i < 150; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.width = `${Math.random() * 3 + 1}px`;
            star.style.height = star.style.width;
            star.style.opacity = Math.random();
            star.style.animationDelay = `${Math.random() * 5}s`;
            nightOverlay.appendChild(star);
        }
    }
    // Функция очистки звезд
function clearStars() {
    const nightOverlay = document.getElementById('night-overlay');
    nightOverlay.innerHTML = '';
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
        clearInterval(nutInterval);
        
        finalNuts.textContent = nutsCollected;
        finalMeters.textContent = Math.floor(distance);
        gameOverScreen.style.display = 'block';
        
        gameContainer.style.animation = 'shake 0.5s';
    }

    // ===== Запуск игры =====
    function startGame() {
        isGameOver = false;
        isNightMode = false;
        lastTransitionMeters = 0;
        nutsCollected = 0;
        distance = 0;

        // Сброс ночного режима
    document.getElementById('night-overlay').classList.remove('night-mode');
    document.body.classList.remove('night-mode');
    document.getElementById('night-overlay').innerHTML = '';
    clearStars();
        
        obstaclesContainer.innerHTML = '';
        nutsContainer.innerHTML = '';
        
        squirrel.style.bottom = `${PLATFORM_HEIGHT}px`;
        squirrel.style.animation = '';
        
        metersCount.textContent = '0';
        nutsCount.textContent = '0';
        
        gameContainer.style.animation = '';
        gameOverScreen.style.display = 'none';
        
        requestAnimationFrame(gameLoop);
        nutInterval = setInterval(createNut, NUT_GAP);
        obstacleLoop();
    }

    // ===== Инициализация =====
    function initGame() {
        // Проверка элементов
        if (!loadingScreen || !progressBar || !gameContainer) {
            console.error("Не найдены необходимые элементы!");
            return;
        }

        // Анимация загрузки
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

    // Запускаем игру
    initGame();

    // Управление
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            jump();
        }
    });
    
    document.addEventListener('click', jump);
    
    restartBtn.addEventListener('click', startGame);
});