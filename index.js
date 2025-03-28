// index.js
document.addEventListener('DOMContentLoaded', () => {
    const squirrel = document.getElementById('squirrel');
    const obstaclesContainer = document.getElementById('obstacles-container');
    const nutsContainer = document.getElementById('nuts-container');
    const gameOverDisplay = document.getElementById('game-over');
    const nutsCountDisplay = document.getElementById('nuts-count');
    const metersCountDisplay = document.getElementById('meters-count');
    const timeCountDisplay = document.getElementById('time-count');
    const finalNutsDisplay = document.getElementById('final-nuts');
    const finalMetersDisplay = document.getElementById('final-meters');
    const cloudsContainer = document.getElementById('clouds-container');
    
    let isJumping = false;
    let isGameOver = false;
    let isRunning = false;
    let nutsCollected = 0;
    let metersPassed = 0;
    let secondsPassed = 0;
    let gameSpeed = 1.0;
    let obstacleInterval;
    let nutInterval;
    let cloudInterval;
    let gameTimer;
    let distanceTimer;
    let difficultyLevel = 1;
    let lastObstacles = []; // Массив для хранения времени появления последних льдин
    const MIN_OBSTACLE_INTERVAL = 1500; // Минимальный интервал между льдинами (мс) 

    function loadSquirrelSprite() {
        const img = new Image();
        img.src = 'белка с орехом.png';
        img.onload = () => {
            squirrel.style.backgroundImage = `url('${img.src}')`;
            squirrel.style.backgroundSize = ' 120px 68px';
        };
        img.onerror = () => {
            squirrel.style.backgroundColor = 'brown';
        };
    }
    
    function createClouds() {
        cloudInterval = setInterval(() => {
            if (isGameOver) return;
            
            const cloud = document.createElement('div');
            cloud.classList.add('cloud');
            cloud.style.left = '800px';
            cloud.style.top = `${Math.random() * 70}px`;
            cloud.style.width = `${Math.random() * 50 + 40}px`;
            cloud.style.height = `${Math.random() * 20 + 15}px`;
            
            cloudsContainer.appendChild(cloud);
            
            let cloudPosition = 800;
            const cloudMove = setInterval(() => {
                if (cloudPosition < -100) {
                    clearInterval(cloudMove);
                    cloud.remove();
                } else {
                    cloudPosition -= gameSpeed / 3;
                    cloud.style.left = `${cloudPosition}px`;
                }
            }, 20);
        }, 3000);
    }
    
    function jump() {
        if (isJumping || isGameOver) return;
        
        isJumping = true;
        squirrel.classList.add('jump');
        
        setTimeout(() => {
            squirrel.classList.remove('jump');
            isJumping = false;
        }, 600);
    }
    
    function createObstacle() {
    if (isGameOver) return;
    
    const now = Date.now();
    
    // Проверяем, когда появлялись последние льдины
    if (lastObstacles.length >= 2) {
        const timeSinceLast = now - lastObstacles[lastObstacles.length - 1];
        const timeSincePrev = now - lastObstacles[lastObstacles.length - 2];
        
        // Если две последние льдины появились слишком быстро, пропускаем создание новой
        if (timeSinceLast < MIN_OBSTACLE_INTERVAL * 0.7 || 
            timeSincePrev < MIN_OBSTACLE_INTERVAL * 1.5) {
            return;
        }
    }
    
    // Ограничиваем массив последних льдин (храним только 4 последних)
    if (lastObstacles.length > 4) {
        lastObstacles.shift();
    }
    lastObstacles.push(now);
    
    const obstacle = document.createElement('div');
    obstacle.classList.add('bush', 'obstacle-move');
    obstacle.style.height = '60px';
    obstacle.style.bottom = '50px';
    obstacle.style.animationDuration = `${3000 / (gameSpeed * (1 + difficultyLevel * 0.1))}ms`;
    obstaclesContainer.appendChild(obstacle);
    
    const checkCollision = setInterval(() => {
        if (isGameOver) {
            clearInterval(checkCollision);
            return;
        }
        
        const obstacleRect = obstacle.getBoundingClientRect();
        const squirrelRect = squirrel.getBoundingClientRect();
        
        if (
            squirrelRect.right > obstacleRect.left + 20 &&
            squirrelRect.left < obstacleRect.right - 20 &&
            squirrelRect.bottom > obstacleRect.top + 10
        ) {
            gameOver();
            clearInterval(checkCollision);
        }
        
        if (obstacleRect.right < 0) {
            clearInterval(checkCollision);
            obstacle.remove();
        }
    }, 10);
}
    
    function createNut() {
        if (isGameOver) return;
        
        const nut = document.createElement('div');
        nut.classList.add('nut', 'nut-move');
        nut.style.top = `${Math.random() * 100 + 80}px`;
        nut.style.animationDuration = `${3000 / gameSpeed}ms`;
        nutsContainer.appendChild(nut);
        
        const checkCollection = setInterval(() => {
            if (isGameOver) {
                clearInterval(checkCollection);
                return;
            }
            
            const nutRect = nut.getBoundingClientRect();
            const squirrelRect = squirrel.getBoundingClientRect();
            
            if (
                squirrelRect.right > nutRect.left &&
                squirrelRect.left < nutRect.right &&
                squirrelRect.top < nutRect.bottom &&
                squirrelRect.bottom > nutRect.top
            ) {
                nutsCollected++;
                nutsCountDisplay.textContent = nutsCollected;
                nut.remove();
                clearInterval(checkCollection);
                
                const effect = document.createElement('div');
                effect.textContent = '+1';
                effect.style.position = 'absolute';
                effect.style.left = `${nutRect.left}px`;
                effect.style.top = `${nutRect.top}px`;
                effect.style.color = 'gold';
                effect.style.fontWeight = 'bold';
                effect.style.fontSize = '16px';
                effect.style.textShadow = '1px 1px 2px black';
                document.body.appendChild(effect);
                
                setTimeout(() => {
                    effect.style.transition = 'all 0.5s';
                    effect.style.opacity = '0';
                    effect.style.transform = 'translateY(-20px)';
                    setTimeout(() => effect.remove(), 500);
                }, 0);
            }
            
            if (nutRect.right < 0) {
                clearInterval(checkCollection);
                nut.remove();
            }
        }, 20);
    }

    function updateTimer() {
        secondsPassed++;
        timeCountDisplay.textContent = secondsPassed;
        
        // Увеличиваем уровень сложности каждые 30 секунд
        if (secondsPassed % 30 === 0 && difficultyLevel < 5) {
            difficultyLevel++;
            console.log(`Уровень сложности повышен: ${difficultyLevel}`);
        }
    }
    
    function updateDistance() {
        metersPassed += Math.floor(gameSpeed * 0,7);
        metersCountDisplay.textContent = metersPassed;
    }
    
    function gameOver() {
        isGameOver = true;
        isRunning = false;
        squirrel.classList.remove('running');
        clearInterval(obstacleInterval);
        clearInterval(nutInterval);
        clearInterval(cloudInterval);
        clearInterval(gameTimer);
        clearInterval(distanceTimer);
        
        finalNutsDisplay.textContent = nutsCollected;
        finalMetersDisplay.textContent = metersPassed;
        gameOverDisplay.style.display = 'block';
    }
    
    function scheduleNutCreation() {
        if (isGameOver) return;
        
        // Случайный интервал между 1 и 3 секундами в зависимости от уровня сложности
        const minInterval = 1000;
        const maxInterval = 3000 - (difficultyLevel * 300);
        const interval = Math.random() * (maxInterval - minInterval) + minInterval;
        
        setTimeout(() => {
            createNut();
            scheduleNutCreation();
        }, interval);
    }
    
    function startGame() {
        isGameOver = false;
        isRunning = true;
        nutsCollected = 0;
        metersPassed = 0;
        secondsPassed = 0;
        gameSpeed = 1.0;
        difficultyLevel = 1;
        
        nutsCountDisplay.textContent = nutsCollected;
        metersCountDisplay.textContent = metersPassed;
        timeCountDisplay.textContent = secondsPassed;
        
        gameOverDisplay.style.display = 'none';
        obstaclesContainer.innerHTML = '';
        nutsContainer.innerHTML = '';
        cloudsContainer.innerHTML = '';
        
        loadSquirrelSprite();
        
        // Препятствия с фиксированным интервалом (можно также сделать случайным)
        obstacleInterval = setInterval(() => {
            createObstacle();
            // Случайный интервал от 1.5 до 3 секунд
            return Math.random() * 1500 + 1500;
        }, MIN_OBSTACLE_INTERVAL);
        
        // Орехи со случайным интервалом
        scheduleNutCreation();
        
        createClouds();
        
        gameTimer = setInterval(updateTimer, 1000);
        distanceTimer = setInterval(updateDistance, 1000);
        
        const difficultyInterval = setInterval(() => {
            if (isGameOver) {
                clearInterval(difficultyInterval);
                return;
            }
            
            gameSpeed += 0.03;
            
            document.querySelectorAll('.obstacle-move').forEach(obstacle => {
                obstacle.style.animationDuration = `${3000 / (gameSpeed * (1 + difficultyLevel * 0.1))}ms`;
            });
            
            document.querySelectorAll('.nut-move').forEach(nut => {
                nut.style.animationDuration = `${3000 / gameSpeed}ms`;
            });
        }, 10000);
    }
    
    // Обработчик нажатия клавиши пробел
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (!isRunning) {
                startGame();
            } else {
                jump();
            }
        }
    });
    
    // Обработчик клика для мобильных устройств
    document.addEventListener('click', () => {
        if (!isRunning) {
            startGame();
        } else {
            jump();
        }
    });
});