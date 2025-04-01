
document.addEventListener('DOMContentLoaded', () => {
document.getElementById('nuts-count').textContent = nutsCollected;
document.getElementById('meters-count').textContent = Math.floor(distance);
    // Элементы игры

    // Проверка загрузки изображений
const images = [
    'images/squirrel.png',
    'images/iceberg.png',
    'images/nut.png'
];

images.forEach(src => {
    const img = new Image();
    img.onload = () => console.log(`Загружено: ${src}`);
    img.onerror = () => console.error(`Ошибка загрузки: ${src}`);
    img.src = src;
});
    const squirrel = document.getElementById('squirrel');
    const obstaclesContainer = document.getElementById('obstacles-container');
    const nutsContainer = document.getElementById('nuts-container');
    const gameOverScreen = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    
    // Настройки игры
    const GAME_SPEED = 10;
    const JUMP_HEIGHT = 180;
    const OBSTACLE_GAP = 1000;
    const NUT_GAP = 700;
    
    let isJumping = false;
    let isGameOver = false;
    let nutsCollected = 0;
    let distance = 0;
    let level = 1;
    let lastObstacleTime = 0;
    let lastNutTime = 0;
    let gameInterval;
    let squirrelX = 100; 
    
    // Прыжок белки
    function jump() {
        if (isJumping || isGameOver) return;
        
        isJumping = true;
        const jumpStart = Date.now();
        const jumpDuration = 700;
        
        function animateJump() {
            if (isGameOver) return;
            
            const elapsed = Date.now() - jumpStart;
            const progress = Math.min(elapsed / jumpDuration, 1);
            const jumpProgress = Math.sin(progress * Math.PI);
            
            squirrel.style.bottom = `${120 + jumpProgress * JUMP_HEIGHT}px`;
            
            if (progress < 1) {
                requestAnimationFrame(animateJump);
            } else {
                isJumping = false;
                squirrel.style.bottom = '120px';
            }
        }
        
        animateJump();
    }

    function moveSquirrel() {
        squirrelX += GAME_SPEED * 0.1;
        squirrel.style.left = `${squirrelX}px`;
    }
    
    // Создание препятствий
    function createObstacle() {
        const now = Date.now();
        if (now - lastObstacleTime < OBSTACLE_GAP) return;
        lastObstacleTime = now;
        
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        obstacle.style.left = '100%';
        obstaclesContainer.appendChild(obstacle);
        
        let pos = 1000;
        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }
            
            pos -= GAME_SPEED;
            obstacle.style.left = `${pos}px`;
            distance += 0.2;
            document.getElementById('meters-count').textContent = Math.floor(distance);
            
            // Проверка столкновения
            const squirrelRect = squirrel.getBoundingClientRect();
            const obstacleRect = obstacle.getBoundingClientRect();
            
            if (
                squirrelRect.right > obstacleRect.left + 40 &&
                squirrelRect.left < obstacleRect.right - 40 &&
                squirrelRect.bottom > obstacleRect.top + 30 &&
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
        const now = Date.now();
        if (now - lastNutTime < NUT_GAP) return;
        lastNutTime = now;
        
        const nut = document.createElement('div');
        nut.className = 'nut';
        nut.style.left = '100%';
        nutsContainer.appendChild(nut);
        
        let pos = 1000;
        const moveInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(moveInterval);
                return;
            }
            
            pos -= GAME_SPEED;
            nut.style.left = `${pos}px`;
            
            // Сбор орехов
            const squirrelRect = squirrel.getBoundingClientRect();
            const nutRect = nut.getBoundingClientRect();
            
            if (
                squirrelRect.right > nutRect.left + 20 &&
                squirrelRect.left < nutRect.right - 20 &&
                squirrelRect.bottom > nutRect.top + 10 &&
                squirrelRect.top < nutRect.bottom - 10 &&
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
        document.getElementById('final-nuts').textContent = nutsCollected;
        document.getElementById('final-meters').textContent = Math.floor(distance);
        gameOverScreen.style.display = 'block';
    }
    
    // Рестарт игры
    restartBtn.addEventListener('click', () => {
        isGameOver = false;
        nutsCollected = 0;
        distance = 0;
        level = 1;
        squirrelX = 100
        obstaclesContainer.innerHTML = '';
        nutsContainer.innerHTML = '';
        gameOverScreen.style.display = 'none';
        document.getElementById('nuts-count').textContent = '0';
        document.getElementById('meters-count').textContent = '0';
        document.getElementById('difficulty-level').textContent = '1';
        quirrel.style.bottom = '120px';
        squirrel.style.left = '100px';
        startGame();
    });
    
    // Управление
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') 
            jump();
    });
    document.addEventListener('click', jump);
    
    // Игровой цикл
    function gameLoop() {
        if (isGameOver) return;
        
        moveSquirrel();
        createObstacle();
        createNut();
        
        // Повышение уровня
        if (distance > level * 150) {
            level++;
            document.getElementById('difficulty-level').textContent = level;
        }
        
        requestAnimationFrame(gameLoop);
    }
    
    // Запуск игры
    function startGame() {
        gameInterval = requestAnimationFrame(gameLoop);
    }
    
    startGame();
});