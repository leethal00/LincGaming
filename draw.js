function drawPlayerShipGraphic() {
    const gradient = ctx.createLinearGradient(0, -20, 0, 20);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#0099ff');
    gradient.addColorStop(1, '#0066cc');
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-15, 10);
    ctx.lineTo(-8, 15);
    ctx.lineTo(8, 15);
    ctx.lineTo(15, 10);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#006699';
    ctx.strokeStyle = '#00ddff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(-15, 10);
    ctx.lineTo(-25, 5);
    ctx.lineTo(-22, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(15, 10);
    ctx.lineTo(25, 5);
    ctx.lineTo(22, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(0, -5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.arc(0, -5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.fillRect(-6, 13, 3, 4);
    ctx.fillRect(3, 13, 3, 4);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.stroke();
}

function drawShield(x, y) {
    const time = Date.now() / 100;
    ctx.save();
    ctx.translate(x, y);

    const gradient = ctx.createRadialGradient(0, 0, 20, 0, 0, 35);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(0.7, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0.6)');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 + Math.sin(time) * 0.2;

    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // Scale down enemies on mobile devices
    // iPad keeps normal size, iPhone gets smaller
    if (isMobile && !isTablet) {
        ctx.scale(0.65, 0.65);
    } else if (isTablet) {
        ctx.scale(0.85, 0.85);
    }

    if (enemy.type === 'megaboss') {
        // Health bar
        ctx.fillStyle = '#1a1a1a';
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.fillRect(-60, -70, 120, 10);
        ctx.strokeRect(-60, -70, 120, 10);

        const healthPercent = enemy.currentHealth / (20 + (game.level * 2));
        const healthGrad = ctx.createLinearGradient(-60, 0, 60, 0);
        if (healthPercent > 0.5) {
            healthGrad.addColorStop(0, '#00ff00');
            healthGrad.addColorStop(1, '#00ff88');
        } else if (healthPercent > 0.25) {
            healthGrad.addColorStop(0, '#ffff00');
            healthGrad.addColorStop(1, '#ff8800');
        } else {
            healthGrad.addColorStop(0, '#ff0000');
            healthGrad.addColorStop(1, '#ff0066');
        }
        ctx.fillStyle = healthGrad;
        ctx.fillRect(-60, -70, 120 * healthPercent, 10);

        // Megaboss body
        const bodyGrad = ctx.createRadialGradient(0, -10, 0, 0, 0, 50);
        bodyGrad.addColorStop(0, '#ff0099');
        bodyGrad.addColorStop(0.5, '#cc0066');
        bodyGrad.addColorStop(1, '#660033');
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.ellipse(0, 0, 70, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 3;
        ctx.stroke();

        const deckGrad = ctx.createLinearGradient(0, -35, 0, -5);
        deckGrad.addColorStop(0, '#ff33cc');
        deckGrad.addColorStop(1, '#990066');
        ctx.fillStyle = deckGrad;
        ctx.beginPath();
        ctx.ellipse(0, -18, 35, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#660033';
        ctx.strokeStyle = '#ff0066';
        ctx.lineWidth = 2;
        ctx.fillRect(-80, -15, 25, 25);
        ctx.strokeRect(-80, -15, 25, 25);
        ctx.fillRect(55, -15, 25, 25);
        ctx.strokeRect(55, -15, 25, 25);

        ctx.fillStyle = '#cc0066';
        ctx.fillRect(-75, -5, 15, 8);
        ctx.fillRect(60, -5, 15, 8);

        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        for (let i = -50; i <= 50; i += 25) {
            ctx.beginPath();
            ctx.arc(i, 8, 6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(-60, 35, 15, 10);
        ctx.fillRect(-20, 40, 12, 8);
        ctx.fillRect(8, 40, 12, 8);
        ctx.fillRect(45, 35, 15, 10);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, 75, 50, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

    } else if (enemy.type === 'boss') {
        const bossGrad = ctx.createRadialGradient(0, -5, 5, 0, 0, 20);
        bossGrad.addColorStop(0, '#ff3333');
        bossGrad.addColorStop(0.6, '#cc0000');
        bossGrad.addColorStop(1, '#660000');
        ctx.fillStyle = bossGrad;

        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(-12, -8);
        ctx.lineTo(-18, 5);
        ctx.lineTo(-10, 12);
        ctx.lineTo(10, 12);
        ctx.lineTo(18, 5);
        ctx.lineTo(12, -8);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#990000';
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(-28, -5);
        ctx.lineTo(-25, 5);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(28, -5);
        ctx.lineTo(25, 5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ff6666';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(-7, -8, 3, 0, Math.PI * 2);
        ctx.arc(7, -8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ff8800';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff4400';
        ctx.fillRect(-8, 10, 4, 4);
        ctx.fillRect(4, 10, 4, 4);
        ctx.shadowBlur = 0;

    } else if (enemy.type === 'butterfly') {
        const butterflyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
        butterflyGrad.addColorStop(0, '#ffff66');
        butterflyGrad.addColorStop(0.5, '#ffcc00');
        butterflyGrad.addColorStop(1, '#ff8800');

        ctx.fillStyle = butterflyGrad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';

        ctx.beginPath();
        ctx.moveTo(-8, -12);
        ctx.quadraticCurveTo(-30, -10, -28, 8);
        ctx.quadraticCurveTo(-18, 2, -8, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(8, -12);
        ctx.quadraticCurveTo(30, -10, 28, 8);
        ctx.quadraticCurveTo(18, 2, 8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-20, -3, 8, 0, Math.PI * 2);
        ctx.arc(20, -3, 8, 0, Math.PI * 2);
        ctx.stroke();

        const bodyGrad = ctx.createLinearGradient(0, -15, 0, 10);
        bodyGrad.addColorStop(0, '#ffaa00');
        bodyGrad.addColorStop(1, '#cc6600');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, -3, 10, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(0, -12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-3, -12, 2, 0, Math.PI * 2);
        ctx.arc(3, -12, 2, 0, Math.PI * 2);
        ctx.fill();

    } else {
        // Bee
        const beeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        beeGrad.addColorStop(0, '#00ff88');
        beeGrad.addColorStop(0.6, '#00cc44');
        beeGrad.addColorStop(1, '#006622');
        ctx.fillStyle = beeGrad;

        ctx.beginPath();
        ctx.ellipse(0, -10, 11, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, 10, 11, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#004400';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -10, 11, 0, Math.PI * 2);
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.arc(0, 10, 11, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#88ffaa';
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';

        ctx.beginPath();
        ctx.ellipse(-15, -8, 12, 18, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(15, -8, 12, 18, 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffff00';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.arc(-6, -12, 4, 0, Math.PI * 2);
        ctx.arc(6, -12, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(-6, -12, 2, 0, Math.PI * 2);
        ctx.arc(6, -12, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        ctx.beginPath();
        ctx.moveTo(0, 18);
        ctx.lineTo(0, 24);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    ctx.restore();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Draw tractor beams
    tractorBeams.forEach(beam => {
        ctx.save();

        const beamHeight = canvas.height - beam.y - 100;
        const beamWidth = beam.width + (beam.captureProgress * 0.5);

        const beamGradient = ctx.createLinearGradient(beam.x, beam.y, beam.x, beam.y + beamHeight);
        beamGradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
        beamGradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.4)');
        beamGradient.addColorStop(1, 'rgba(255, 255, 0, 0.1)');

        ctx.fillStyle = beamGradient;
        ctx.beginPath();
        ctx.moveTo(beam.x - 10, beam.y);
        ctx.lineTo(beam.x - beamWidth / 2, beam.y + beamHeight);
        ctx.lineTo(beam.x + beamWidth / 2, beam.y + beamHeight);
        ctx.lineTo(beam.x + 10, beam.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        ctx.stroke();
        ctx.shadowBlur = 0;

        for (let i = 0; i < 8; i++) {
            const offset = (beam.captureProgress * 5 + i * 30) % beamHeight;
            ctx.globalAlpha = 0.6;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(beam.x - (beamWidth / 2) * (offset / beamHeight), beam.y + offset);
            ctx.lineTo(beam.x + (beamWidth / 2) * (offset / beamHeight), beam.y + offset);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        ctx.restore();
    });

    // Draw player
    if (!game.playerDying && game.respawnTimer === 0 && !game.capturingEnemy) {
        if (player.shield) {
            drawShield(player.x, player.y);
        }

        ctx.save();
        ctx.translate(player.x, player.y);
        drawPlayerShipGraphic();
        ctx.restore();

        if (player.dualFighter) {
            ctx.save();
            ctx.translate(player.x - 30, player.y);
            drawPlayerShipGraphic();
            ctx.restore();
        }
    }

    // Draw captured ship
    if (game.capturedShip) {
        enemies.forEach(enemy => {
            if (enemy.hasCapturedShip) {
                ctx.save();
                ctx.translate(enemy.x, enemy.y - 30);
                ctx.globalAlpha = 0.7;
                drawPlayerShipGraphic();
                ctx.globalAlpha = 1;
                ctx.restore();
            }
        });
    }

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);

        const bulletGradient = ctx.createLinearGradient(0, -10, 0, 10);
        bulletGradient.addColorStop(0, '#ffffff');
        bulletGradient.addColorStop(0.5, '#00ffff');
        bulletGradient.addColorStop(1, '#0066ff');
        ctx.fillStyle = bulletGradient;

        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(-3, -8, 6, 16);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-1, -6, 2, 12);

        ctx.restore();
    });

    // Draw enemy bullets
    enemyBullets.forEach(bullet => {
        ctx.save();
        ctx.translate(bullet.x, bullet.y);

        const enemyBulletGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 6);
        enemyBulletGradient.addColorStop(0, '#ffff00');
        enemyBulletGradient.addColorStop(0.5, '#ff0000');
        enemyBulletGradient.addColorStop(1, '#990000');
        ctx.fillStyle = enemyBulletGradient;

        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });

    // Draw enemies
    enemies.forEach(enemy => {
        drawEnemy(enemy);
    });

    // Draw powerups
    powerUps.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);

        const time = Date.now() / 100;
        ctx.rotate(time);

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
        gradient.addColorStop(0, p.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;

        ctx.fillRect(-10, -10, 20, 20);

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-10, -10, 20, 20);

        ctx.shadowBlur = 0;
        ctx.restore();
    });

    // Draw particles
    particles.forEach(p => {
        if (p.isExplosion) {
            const lifePercent = p.life / p.maxLife;

            if (lifePercent > 0.7) {
                ctx.fillStyle = '#ffffff';
            } else if (lifePercent > 0.5) {
                ctx.fillStyle = '#ffff00';
            } else if (lifePercent > 0.3) {
                ctx.fillStyle = '#ff8800';
            } else {
                ctx.fillStyle = '#ff0000';
            }

            ctx.globalAlpha = lifePercent;
            ctx.shadowBlur = 20;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * lifePercent, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        } else {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 30;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.globalAlpha = 1;
        }
    });

    // Draw reserve ships
    reserveCtx.fillStyle = '#000';
    reserveCtx.fillRect(0, 0, reserveCanvas.width, reserveCanvas.height);

    for (let i = 0; i < game.lives; i++) {
        reserveCtx.save();
        reserveCtx.translate(10 + i * 35, 20);
        reserveCtx.scale(0.35, 0.35);

        const gradient = reserveCtx.createLinearGradient(0, -20, 0, 20);
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(0.5, '#0099ff');
        gradient.addColorStop(1, '#0066cc');
        reserveCtx.fillStyle = gradient;

        reserveCtx.beginPath();
        reserveCtx.moveTo(0, -20);
        reserveCtx.lineTo(-15, 10);
        reserveCtx.lineTo(-8, 15);
        reserveCtx.lineTo(8, 15);
        reserveCtx.lineTo(15, 10);
        reserveCtx.closePath();
        reserveCtx.fill();

        reserveCtx.restore();
    }
}
