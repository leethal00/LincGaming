function update() {
    if (game.state !== 'playing' || game.paused) return;

    if (game.playerDying) {
        game.deathTimer--;
        if (game.deathTimer <= 0) {
            game.playerDying = false;
            game.respawnTimer = 30;
        }
    }

    if (game.respawnTimer > 0) {
        game.respawnTimer--;
        if (game.respawnTimer === 0) {
            player.x = canvas.width / 2;
            player.y = isMobile ? canvas.height - 120 : canvas.height - 60;
            enemyBullets = [];
            enemies.forEach(enemy => {
                if (enemy.originalX !== undefined) {
                    enemy.x = enemy.originalX;
                    enemy.y = enemy.originalY;
                    enemy.diving = false;
                    enemy.spiraling = false;
                }
            });
        }
    }

    if (game.playerDying || game.respawnTimer > 0) return;

    // Update powerup timers
    if (player.shieldTimer > 0) {
        player.shieldTimer--;
        if (player.shieldTimer === 0) player.shield = false;
    }
    if (player.speedBoostTimer > 0) {
        player.speedBoostTimer--;
        if (player.speedBoostTimer === 0) {
            player.speedBoost = false;
            player.speed = 6;
        }
    }

    // Update stars
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });

    // Handle touch shooting
    if (game.touchControls.shoot) {
        shootBullet();
    }

    // Move player
    if (!game.playerDying && game.respawnTimer === 0 && !game.capturingEnemy) {
        const currentSpeed = player.speedBoost ? player.speed * 1.5 : player.speed;
        if ((game.keys['ArrowLeft'] || game.touchControls.left) && player.x > player.width / 2) {
            player.x -= currentSpeed;
        }
        if ((game.keys['ArrowRight'] || game.touchControls.right) && player.x < canvas.width - player.width / 2) {
            player.x += currentSpeed;
        }
    }

    // Update bullets
    bullets = bullets.filter(b => {
        b.y -= b.speed;
        return b.y > 0;
    });

    // Update powerups
    powerUps = powerUps.filter(p => {
        p.y += p.vy;

        if (!game.playerDying && Math.abs(p.x - player.x) < 25 && Math.abs(p.y - player.y) < 25) {
            playPowerUpSound();
            vibrate([50, 30, 50]);

            if (p.type === 'shield') {
                player.shield = true;
                player.shieldTimer = powerUpTypes.shield.duration;
            } else if (p.type === 'dualShot') {
                player.dualFighter = true;
            } else if (p.type === 'speedBoost') {
                player.speedBoost = true;
                player.speedBoostTimer = powerUpTypes.speedBoost.duration;
                player.speed = 9;
            }
            return false;
        }

        return p.y < canvas.height;
    });

    // Tractor beam logic
    if (game.capturingEnemy) {
        const enemy = game.capturingEnemy;

        if (enemy.capturePhase === 'descending') {
            if (enemy.y < enemy.captureTargetY) {
                enemy.y += 2;
            } else {
                enemy.capturePhase = 'beaming';
                enemy.captureProgress = 0;
                tractorBeams = [{
                    x: enemy.x,
                    y: enemy.y,
                    width: 60,
                    captureProgress: 0
                }];
            }
        } else if (enemy.capturePhase === 'beaming') {
            enemy.captureProgress++;
            tractorBeams[0].captureProgress = enemy.captureProgress;

            if (enemy.captureProgress > 30 && enemy.captureProgress < 120) {
                player.y -= 2;
            }

            if (enemy.captureProgress > 120) {
                game.capturedShip = {
                    x: enemy.x,
                    y: enemy.y - 30
                };
                enemy.hasCapturedShip = true;
                enemy.capturePhase = 'ascending';
                tractorBeams = [];
            }
        } else if (enemy.capturePhase === 'ascending') {
            if (enemy.y > enemy.captureOriginalY) {
                enemy.y -= 2;
            } else {
                enemy.y = enemy.captureOriginalY;
                enemy.x = enemy.captureOriginalX;
                enemy.capturing = false;
                game.capturingEnemy = null;
                player.x = canvas.width / 2;
                player.y = isMobile ? canvas.height - 120 : canvas.height - 60;
            }
        }
    }

    // Update enemy bullets
    enemyBullets = enemyBullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;

        if (!game.playerDying && game.respawnTimer === 0 && !game.capturingEnemy && tractorBeams.length === 0) {
            if (Math.abs(b.x - player.x) < player.width / 2 &&
                Math.abs(b.y - player.y) < player.height / 2) {

                if (player.shield) {
                    createExplosion(b.x, b.y, '#0ff', 10);
                    playHitSound();
                    return false;
                }

                game.lives--;
                createExplosion(player.x, player.y, '#ff6600', 60);
                createExplosion(player.x, player.y, '#ffff00', 40);
                createExplosion(player.x, player.y, '#ff0000', 30);
                playExplosionSound();
                vibrate([100, 50, 100, 50, 100]);
                screenShake(15);
                game.playerDying = true;
                game.deathTimer = 20;

                if (game.lives <= 0) {
                    gameOver();
                }
                return false;
            }
        }

        return b.y < canvas.height && b.x > 0 && b.x < canvas.width;
    });

    // Update particles
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
    });

    // Update enemies
    let changeDirection = false;
    enemies.forEach(enemy => {
        if (enemy.orbiting) {
            enemy.orbitAngle += enemy.orbitSpeed;
            enemy.bobAngle += 0.05;
            enemy.orbitRadiusVariation = Math.sin(enemy.bobAngle) * 40;

            const currentRadius = enemy.orbitRadius + enemy.orbitRadiusVariation;
            enemy.x = enemy.orbitCenterX + Math.cos(enemy.orbitAngle) * currentRadius;
            enemy.y = enemy.orbitCenterY + Math.sin(enemy.orbitAngle) * (currentRadius * 0.6);
            enemy.y += Math.sin(enemy.bobAngle * 1.5) * 20;

            enemy.shootTimer--;
            if (enemy.shootTimer <= 0) {
                if (Math.random() < 0.4) {
                    enemyShoot(enemy);
                }
                enemy.shootTimer = 100 - game.level * 2;
            }

            if (Math.random() < 0.003 * game.level) {
                enemy.orbiting = false;
                enemy.diving = true;
                enemy.diveAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                enemy.diveSpeed = 5 + game.level * 0.25;
            }
        } else if (enemy.type === 'megaboss') {
            enemy.x += enemy.vx;

            if (enemy.x > canvas.width - 100 || enemy.x < 100) {
                enemy.vx *= -1;
            }

            enemy.shootTimer--;
            if (enemy.shootTimer <= 0) {
                enemyShoot(enemy);
                enemyBullets.push({
                    x: enemy.x - 30,
                    y: enemy.y,
                    width: 4,
                    height: 10,
                    vx: -1.5,
                    vy: 5,
                    color: '#ff0080'
                });
                enemyBullets.push({
                    x: enemy.x + 30,
                    y: enemy.y,
                    width: 4,
                    height: 10,
                    vx: 1.5,
                    vy: 5,
                    color: '#ff0080'
                });
                if (game.level >= 10) {
                    enemyBullets.push({
                        x: enemy.x - 50,
                        y: enemy.y,
                        width: 4,
                        height: 10,
                        vx: -2,
                        vy: 6,
                        color: '#ff0080'
                    });
                    enemyBullets.push({
                        x: enemy.x + 50,
                        y: enemy.y,
                        width: 4,
                        height: 10,
                        vx: 2,
                        vy: 6,
                        color: '#ff0080'
                    });
                }
                enemy.shootTimer = 60 - game.level * 2;
            }
        } else if (enemy.diving) {
            enemy.x += Math.cos(enemy.diveAngle) * enemy.diveSpeed;
            enemy.y += Math.sin(enemy.diveAngle) * enemy.diveSpeed;

            if (enemy.y > canvas.height - 100) {
                enemy.diving = false;
                if (game.bossLevel && enemy.type === 'boss') {
                    enemy.orbiting = true;
                } else {
                    enemy.x = enemy.originalX;
                    enemy.y = enemy.originalY;
                }
            }

            if (Math.random() < 0.015 + game.level * 0.005) {
                enemyShoot(enemy);
            }
        } else if (enemy.spiraling) {
            enemy.spiralAngle += enemy.spiralSpeed;

            const spiralX = enemy.spiralCenter.x + Math.cos(enemy.spiralAngle) * enemy.spiralRadius;
            const spiralY = enemy.spiralCenter.y + Math.sin(enemy.spiralAngle) * enemy.spiralRadius;

            enemy.x = spiralX;
            enemy.y = spiralY;
            enemy.spiralCenter.y += 1.5 + game.level * 0.1;

            if (enemy.spiralAngle > Math.PI * 2 || enemy.spiralCenter.y > canvas.height - 100) {
                enemy.spiraling = false;
                enemy.x = enemy.originalX;
                enemy.y = enemy.originalY;
            }

            if (Math.random() < 0.02 + game.level * 0.005) {
                enemyShoot(enemy);
            }
        } else {
            if (!enemy.capturing) {
                enemy.x += enemy.vx;

                if (enemy.x > canvas.width - 50 || enemy.x < 50) {
                    changeDirection = true;
                }
            }

            if (!enemy.capturing) {
                enemy.shootTimer--;
                if (enemy.shootTimer <= 0) {
                    if (Math.random() < 0.06 + game.level * 0.008) {
                        enemyShoot(enemy);
                    }
                    enemy.shootTimer = 220 - game.level * 3;
                }

                startEnemyDive(enemy);
                startEnemySpiral(enemy);
                startTractorBeam(enemy);
            }
        }
    });

    if (changeDirection) {
        enemies.forEach(enemy => {
            if (!enemy.diving && !enemy.spiraling) {
                enemy.vx *= -1;
                enemy.y += 8 + game.level * 0.5;
            }
        });
    }

    // Bullet collision with enemies
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (Math.abs(bullet.x - enemy.x) < enemy.width / 2 &&
                Math.abs(bullet.y - enemy.y) < enemy.height / 2) {

                enemy.currentHealth--;
                bullets.splice(bIndex, 1);
                playHitSound();

                if (enemy.currentHealth <= 0) {
                    createExplosion(enemy.x, enemy.y, enemy.color);
                    playExplosionSound();
                    vibrate(50);

                    if (enemy.type === 'megaboss') {
                        screenShake(20);
                        createExplosion(enemy.x, enemy.y, '#fff', 80);
                    }

                    if (enemy.hasCapturedShip && game.capturedShip) {
                        player.dualFighter = true;
                        game.capturedShip = null;
                        createExplosion(enemy.x, enemy.y - 30, '#0ff', 20);
                    }

                    spawnPowerUp(enemy.x, enemy.y);

                    game.score += enemy.points * game.level;
                    document.getElementById('score').textContent = game.score;
                    enemies.splice(eIndex, 1);
                }
            }
        });
    });

    // Level completion
    if (enemies.length === 0) {
        if (game.level < game.maxLevel) {
            game.level++;
            document.getElementById('level').textContent = game.level;
            createEnemyFormation();
        } else {
            game.state = 'won';
            showGameOver(true);
        }
    }

    // Check if enemies reached bottom
    enemies.forEach(enemy => {
        if (enemy.y > canvas.height - 50) {
            gameOver();
        }
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function startGame(level) {
    game.level = level;
    game.state = 'playing';
    game.lives = 5;
    game.score = 0;
    game.playerDying = false;
    game.deathTimer = 0;
    game.respawnTimer = 0;
    game.capturedShip = null;
    game.capturingEnemy = null;
    game.paused = false;
    player.dualFighter = false;
    player.shield = false;
    player.shieldTimer = 0;
    player.speedBoost = false;
    player.speedBoostTimer = 0;
    player.speed = 6;

    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('pauseMenu').style.display = 'none';
    document.getElementById('level').textContent = level;
    document.getElementById('score').textContent = game.score;
    updateHighScoreDisplay();

    player.x = canvas.width / 2;
    // Position player higher on mobile to be visible above controls
    player.y = isMobile ? canvas.height - 120 : canvas.height - 60;

    bullets = [];
    enemyBullets = [];
    enemies = [];
    particles = [];
    tractorBeams = [];
    powerUps = [];

    createEnemyFormation();
}

function gameOver() {
    game.state = 'gameover';
    showGameOver(false);
}

function showGameOver(won) {
    const gameOverDiv = document.getElementById('gameOver');
    gameOverDiv.style.display = 'block';
    if (won) {
        gameOverDiv.querySelector('h1').textContent = 'YOU WIN!';
    } else {
        gameOverDiv.querySelector('h1').textContent = 'GAME OVER';
    }
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('finalLevel').textContent = game.level;

    const highScores = saveHighScore(game.score, game.level);
    const highScoresList = document.getElementById('highScoresList');

    if (highScores.length > 0) {
        let html = '<p>High Scores:</p><ol>';
        highScores.slice(0, 5).forEach(score => {
            html += `<li>${score.score} pts (Level ${score.level}) - ${score.date}</li>`;
        });
        html += '</ol>';
        highScoresList.innerHTML = html;
    }
}

// Start the game loop
updateHighScoreDisplay();
gameLoop();
