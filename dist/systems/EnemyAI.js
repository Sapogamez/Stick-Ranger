"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EnemyAI {
    static calculateDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
    }
    static moveTowardsNearestPlayer(enemy, players, speed) {
        if (players.length === 0)
            return;
        // Find the nearest player
        let nearestPlayer = players[0];
        let shortestDistance = this.calculateDistance(enemy.position, players[0].position);
        for (const player of players) {
            const distance = this.calculateDistance(enemy.position, player.position);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestPlayer = player;
            }
        }
        // Move enemy towards the nearest player
        const directionX = nearestPlayer.position.x - enemy.position.x;
        const directionY = nearestPlayer.position.y - enemy.position.y;
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
        enemy.position.x += (directionX / magnitude) * speed;
        enemy.position.y += (directionY / magnitude) * speed;
    }
    static attackIfInRange(enemy, players, attackRange) {
        for (const player of players) {
            const distance = this.calculateDistance(enemy.position, player.position);
            if (distance <= attackRange) {
                // Attack logic (placeholder)
                console.log(`Enemy ${enemy.id} attacks Player ${player.id}`);
            }
        }
    }
    static update(enemy, players, speed, attackRange) {
        switch (enemy.type) {
            case 'Aggressive':
                this.moveTowardsNearestPlayer(enemy, players, speed);
                this.attackIfInRange(enemy, players, attackRange);
                break;
            case 'Defensive':
                // Defensive enemies might move away from players or only attack when attacked
                console.log(`Enemy ${enemy.id} is defensive and avoids players.`);
                break;
            case 'Ranged':
                // Ranged enemies might maintain a certain distance while attacking
                console.log(`Enemy ${enemy.id} is ranged and keeps distance.`);
                break;
            default:
                console.log(`Enemy ${enemy.id} has no specific behavior.`);
        }
    }
}
exports.default = EnemyAI;
