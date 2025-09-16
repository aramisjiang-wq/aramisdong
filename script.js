document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('start-btn');
    const pauseButton = document.getElementById('pause-btn');
    const difficultySelect = document.getElementById('difficulty');

    // 游戏配置
    const gridSize = 20; // 网格大小
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    // 游戏状态
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let gameInterval;
    let gameSpeed = 150; // 默认速度（中等难度）
    let isPaused = false;
    let gameRunning = false;

    // 难度设置
    const speeds = {
        easy: 200,
        medium: 150,
        hard: 100
    };

    // 初始化游戏
    function initGame() {
        // 初始化蛇
        snake = [
            {x: 5, y: 10},
            {x: 4, y: 10},
            {x: 3, y: 10}
        ];
        
        // 生成食物
        generateFood();
        
        // 重置分数
        score = 0;
        scoreElement.textContent = score;
        
        // 重置方向
        direction = 'right';
        nextDirection = 'right';
        
        // 设置游戏速度
        gameSpeed = speeds[difficultySelect.value];
        
        // 绘制初始状态
        draw();
    }

    // 生成食物
    function generateFood() {
        // 随机生成食物位置，确保不在蛇身上
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        food = newFood;
    }

    // 绘制游戏
    function draw() {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制蛇
        snake.forEach((segment, index) => {
            // 蛇头和蛇身使用不同颜色
            if (index === 0) {
                ctx.fillStyle = '#2ecc71'; // 蛇头颜色
            } else {
                ctx.fillStyle = '#27ae60'; // 蛇身颜色
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // 添加边框
            ctx.strokeStyle = '#219653';
            ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });
        
        // 绘制食物
        ctx.fillStyle = '#e74c3c'; // 食物颜色
        ctx.beginPath();
        ctx.arc(
            food.x * gridSize + gridSize / 2,
            food.y * gridSize + gridSize / 2,
            gridSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // 移动蛇
    function moveSnake() {
        // 更新方向
        direction = nextDirection;
        
        // 根据方向计算新的蛇头位置
        const head = {...snake[0]};
        
        switch(direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // 检查是否吃到食物
        const ateFood = head.x === food.x && head.y === food.y;
        
        // 将新头部添加到蛇数组
        snake.unshift(head);
        
        // 如果吃到食物，生成新食物并增加分数
        if (ateFood) {
            score += 10;
            scoreElement.textContent = score;
            generateFood();
        } else {
            // 如果没吃到食物，移除尾部
            snake.pop();
        }
    }

    // 检查游戏是否结束
    function checkGameOver() {
        const head = snake[0];
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            return true;
        }
        
        // 检查是否撞到自己（从第二个身体部分开始检查）
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }

    // 游戏循环
    function gameLoop() {
        if (isPaused) return;
        
        moveSnake();
        
        // 检查游戏是否结束
        if (checkGameOver()) {
            clearInterval(gameInterval);
            gameRunning = false;
            startButton.disabled = false;
            pauseButton.disabled = true;
            alert(`游戏结束！你的得分是: ${score}`);
            return;
        }
        
        draw();
    }

    // 开始游戏
    function startGame() {
        if (gameRunning) return;
        
        initGame();
        gameRunning = true;
        isPaused = false;
        startButton.disabled = true;
        pauseButton.disabled = false;
        pauseButton.textContent = '暂停';
        
        // 设置游戏循环
        gameInterval = setInterval(gameLoop, gameSpeed);
    }

    // 暂停/继续游戏
    function togglePause() {
        if (!gameRunning) return;
        
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? '继续' : '暂停';
    }

    // 事件监听
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    pauseButton.disabled = true;
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        // 防止方向键滚动页面
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
        
        // 根据按键设置下一个方向
        // 不允许直接反向移动
        switch(e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
            case ' ': // 空格键暂停/继续
                if (gameRunning) togglePause();
                break;
        }
    });
    
    // 难度改变时更新游戏速度
    difficultySelect.addEventListener('change', () => {
        gameSpeed = speeds[difficultySelect.value];
        
        // 如果游戏正在运行，重新设置间隔
        if (gameRunning) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    });

    // 初始绘制
    initGame();
});