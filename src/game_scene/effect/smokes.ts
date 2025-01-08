import { Smoke } from "./smoke";

export class Smokes {

    private static readonly MAX_NUM = 5;

    constructor(scene: g.Scene, parent: g.Scene | g.E, pos: g.CommonOffset) {
        const offsetAngle = Math.PI / (g.game.random.generate() * Smokes.MAX_NUM);
        for (let i = 0; i < Smokes.MAX_NUM; i++) {
            const rad = 2 * Math.PI * (i / Smokes.MAX_NUM) - offsetAngle;
            const smoke = new Smoke(scene, pos);
            const radius = smoke.width / g.game.fps * 20;
            smoke.velocity.x = Math.cos(rad) * radius;
            smoke.velocity.y = Math.sin(rad) * radius;
            parent.append(smoke);
        }
    }
}