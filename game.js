// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const reserveCanvas = document.getElementById('reserveShips');
const reserveCtx = reserveCanvas.getContext('2d');

// Detect if mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                 (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);

// Show mobile controls if on mobile
if (isMobile) {
    document.getElementById('mobileControls').style.display = 'block';
}

// Prevent scrolling and zooming
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());

// Set canvas to full screen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    reserveCanvas.width = 200;
    reserveCanvas.height = 40;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
const game = {
    score: 0,
    level: 1,
    lives: 5,
    state: 'menu',
    keys: {},
    maxLevel: 20,
    bossLevel: false,
    bossEnemy: null,
    capturedShip: null,
    capturingEnemy: null,
    playerDying: false,
    deathTimer: 0,
    respawnTimer: 0,
    paused: false,
    screenShake: 0,
    touchControls: {
        left: false,
        right: false,
        shoot: false
    }
};

// Player ship
const player = {
    x: 0,
    y: 0,
    width: 40,
    height: 30,
    speed: 6,
    color: '#0ff',
    dualFighter: false,
    shield: false,
    shieldTimer: 0,
    speedBoost: false,
    speedBoostTimer: 0
};

// Object pools for performance
const bulletPool = [];
const particlePool = [];
const POOL_SIZE = 200;

function initializePools() {
    for (let i = 0; i < POOL_SIZE; i++) {
        bulletPool.push({ active: false, x: 0, y: 0, width: 4, height: 15, speed: 10, color: '#fff', enemy: false });
        particlePool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 30, color: '#fff', size: 3 });
    }
}

initializePools();

function getBullet(x, y, enemy = false) {
    for (let bullet of bulletPool) {
        if (!bullet.active) {
            bullet.active = true;
            bullet.x = x;
            bullet.y = y;
            bullet.enemy = enemy;
            if (enemy) {
                bullet.color = '#f00';
                bullet.height = 10;
                bullet.vx = 0;
                bullet.vy = 5;
            } else {
                bullet.color = '#fff';
                bullet.height = 15;
                bullet.speed = 10;
            }
            return bullet;
        }
    }
    return null;
}

function getParticle(x, y, vx, vy, color, size = 3) {
    for (let particle of particlePool) {
        if (!particle.active) {
            particle.active = true;
            particle.x = x;
            particle.y = y;
            particle.vx = vx;
            particle.vy = vy;
            particle.life = 30;
            particle.maxLife = 30;
            particle.color = color;
            particle.size = size;
            return particle;
        }
    }
    return null;
}

// Arrays
let bullets = [];
let enemies = [];
let enemyBullets = [];
let particles = [];
let stars = [];
let tractorBeams = [];
let powerUps = [];
let lastShootTime = 0;

// High score system
function getHighScores() {
    const scores = localStorage.getItem('galaga_high_scores');
    return scores ? JSON.parse(scores) : [];
}

function saveHighScore(score, level) {
    let scores = getHighScores();
    scores.push({ score, level, date: new Date().toLocaleDateString() });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10);
    localStorage.setItem('galaga_high_scores', JSON.stringify(scores));
    return scores;
}

function updateHighScoreDisplay() {
    const highScores = getHighScores();
    if (highScores.length > 0) {
        document.getElementById('highScore').textContent = 'HIGH: ' + highScores[0].score;
    }
}

// Audio system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioEnabled = true;

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!audioEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;

    oscillator.start(audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.stop(audioContext.currentTime + duration);
}

function playShootSound() {
    playTone(800, 0.1, 'square', 0.2);
}

function playExplosionSound() {
    playTone(150, 0.3, 'sawtooth', 0.3);
    setTimeout(() => playTone(100, 0.2, 'sawtooth', 0.2), 50);
}

function playPowerUpSound() {
    playTone(523, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.2), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.2), 200);
}

function playHitSound() {
    playTone(200, 0.05, 'square', 0.15);
}

function vibrate(pattern) {
    if (isMobile && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// Mobile touch controls
function setupTouchControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');

    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        game.touchControls.left = true;
        vibrate(10);
    });
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        game.touchControls.left = false;
    });

    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        game.touchControls.right = true;
        vibrate(10);
    });
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        game.touchControls.right = false;
    });

    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        game.touchControls.shoot = true;
        vibrate(20);
    });
    shootBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        game.touchControls.shoot = false;
    });
}

setupTouchControls();

// Create starfield
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.2
    });
}

// Enemy patterns and types
const enemyTypes = {
    boss: { points: 150, color: '#f00', size: 1.5, health: 1 },
    butterfly: { points: 80, color: '#ff0', size: 1.2, health: 1 },
    bee: { points: 50, color: '#0f0', size: 1, health: 1 }
};

// Power-up types
const powerUpTypes = {
    shield: { color: '#0ff', duration: 300 },
    dualShot: { color: '#ff0', duration: 600 },
    speedBoost: { color: '#f0f', duration: 400 }
};

function createEnemyFormation() {
    enemies = [];
    game.bossLevel = (game.level % 5 === 0);

    if (game.bossLevel) {
        game.bossEnemy = {
            x: canvas.width / 2,
            y: 100,
            width: 80,
            height: 80,
            type: 'megaboss',
            points: 1000,
            color: '#ff0080',
            size: 2.5,
            health: 20 + (game.level * 2),
            currentHealth: 20 + (game.level * 2),
            vx: 2.5 + game.level * 0.3,
            vy: 0,
            shootTimer: 50,
            diving: false
        };
        enemies.push(game.bossEnemy);

        const numSupport = 4 + Math.floor(game.level / 5);
        for (let i = 0; i < numSupport; i++) {
            const angle = (Math.PI * 2 / numSupport) * i;
            const supportShip = {
                x: canvas.width / 2 + Math.cos(angle) * 150,
                y: 100 + Math.sin(angle) * 100,
                width: 30,
                height: 30,
                type: 'boss',
                ...enemyTypes['boss'],
                vx: 0,
                vy: 0,
                shootTimer: Math.random() * 100,
                currentHealth: 1,
                diving: false,
                spiraling: false,
                orbitAngle: angle,
                orbitSpeed: 0.04 + game.level * 0.005,
                orbitRadius: 150,
                orbitRadiusVariation: 0,
                bobAngle: Math.random() * Math.PI * 2,
                orbiting: true,
                orbitCenterX: canvas.width / 2,
                orbitCenterY: 100
            };
            enemies.push(supportShip);
        }
    } else {
        const rows = Math.min(2 + Math.floor(game.level / 6), 4);
        const cols = 7;
        const spacing = 38;
        const startX = (canvas.width - (cols * spacing)) / 2;
        const startY = 60;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let type = 'bee';
                if (row < 1) type = 'boss';
                else if (row < 2) type = 'butterfly';

                const enemy = {
                    x: startX + col * spacing,
                    y: startY + row * 35,
                    width: 30,
                    height: 30,
                    type: type,
                    ...enemyTypes[type],
                    vx: 1 + game.level * 0.12,
                    vy: 0,
                    shootTimer: Math.random() * 100,
                    currentHealth: enemyTypes[type].health,
                    diving: false,
                    spiraling: false,
                    spiralAngle: 0,
                    spiralRadius: 0,
                    spiralCenter: { x: 0, y: 0 },
                    diveAngle: 0,
                    diveSpeed: 0
                };
                enemies.push(enemy);
            }
        }
    }
}

// Pause functionality
function togglePause() {
    if (game.state !== 'playing') return;

    game.paused = !game.paused;
    const pauseMenu = document.getElementById('pauseMenu');
    if (game.paused) {
        pauseMenu.style.display = 'block';
    } else {
        pauseMenu.style.display = 'none';
    }
}

document.getElementById('pauseBtn').addEventListener('click', togglePause);

document.getElementById('resumeBtn').addEventListener('click', () => {
    togglePause();
});

document.getElementById('mainMenuBtn').addEventListener('click', () => {
    location.reload();
});

// Input handling
document.addEventListener('keydown', (e) => {
    game.keys[e.key] = true;
    if (e.key === ' ' && game.state === 'playing' && !game.paused) {
        shootBullet();
        e.preventDefault();
    }
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        togglePause();
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key] = false;
});

function shootBullet() {
    if (game.playerDying || game.respawnTimer > 0) return;

    const now = Date.now();
    if (now - lastShootTime < 200) return;
    lastShootTime = now;

    playShootSound();

    if (player.dualFighter) {
        bullets.push({
            x: player.x - 15,
            y: player.y,
            width: 4,
            height: 15,
            speed: 10,
            color: '#fff'
        });
        bullets.push({
            x: player.x + 15,
            y: player.y,
            width: 4,
            height: 15,
            speed: 10,
            color: '#fff'
        });
    } else {
        bullets.push({
            x: player.x,
            y: player.y,
            width: 4,
            height: 15,
            speed: 10,
            color: '#fff'
        });
    }
}

function enemyShoot(enemy) {
    enemyBullets.push({
        x: enemy.x,
        y: enemy.y,
        width: 4,
        height: 10,
        vx: 0,
        vy: 5,
        color: '#f00'
    });
}

function startTractorBeam(enemy) {
    if (game.capturingEnemy || player.dualFighter || game.capturedShip) return;
    if (game.playerDying || game.respawnTimer > 0) return;
    if (enemy.type === 'megaboss' || enemy.orbiting || enemy.diving || enemy.spiraling) return;
    if (Math.random() < 0.0002 * game.level) {
        game.capturingEnemy = enemy;
        enemy.capturing = true;
        enemy.capturePhase = 'descending';
        enemy.captureOriginalX = enemy.x;
        enemy.captureOriginalY = enemy.y;
        enemy.captureTargetY = canvas.height / 2 - 100;
    }
}

function startEnemyDive(enemy) {
    if (enemy.type === 'megaboss') return;
    if (!enemy.diving && !enemy.spiraling && Math.random() < 0.0008 * game.level) {
        enemy.diving = true;
        enemy.diveAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.diveSpeed = 2.5 + game.level * 0.12;
        enemy.originalX = enemy.x;
        enemy.originalY = enemy.y;
    }
}

function startEnemySpiral(enemy) {
    if (enemy.type === 'megaboss') return;
    if (!enemy.spiraling && !enemy.diving && Math.random() < 0.0006 * game.level) {
        enemy.spiraling = true;
        enemy.spiralAngle = 0;
        enemy.spiralRadius = 80 + Math.random() * 40;
        enemy.spiralCenter = { x: enemy.x, y: enemy.y };
        enemy.spiralSpeed = 0.08 + game.level * 0.01;
        enemy.originalX = enemy.x;
        enemy.originalY = enemy.y;
    }
}

function spawnPowerUp(x, y) {
    if (Math.random() < 0.15) {
        const types = Object.keys(powerUpTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        powerUps.push({
            x: x,
            y: y,
            type: type,
            color: powerUpTypes[type].color,
            width: 20,
            height: 20,
            vy: 1.5
        });
    }
}

function createExplosion(x, y, color, size = 15) {
    for (let i = 0; i < size; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            maxLife: 30,
            color: color,
            size: Math.random() * 5 + 3,
            isExplosion: size > 20
        });
    }
}

function screenShake(intensity = 10) {
    game.screenShake = intensity;
    document.getElementById('gameContainer').classList.add('screen-shake');
    setTimeout(() => {
        document.getElementById('gameContainer').classList.remove('screen-shake');
    }, 300);
}
