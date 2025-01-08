export class Smoke extends g.Sprite {

    velocity: g.CommonOffset = { x: 0, y: 0 };

    constructor(scene: g.Scene, pos: g.CommonOffset) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_smoke"),
            x: pos.x,
            y: pos.y,
            anchorX: 0.5,
            anchorY: 0.5,
            angle: g.game.random.generate() * 360,
        });

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void | boolean => {
        if (Math.abs(this.velocity.x) > 0.1) {
            this.x += this.velocity.x;
            this.velocity.x *= 0.7;
        }
        if (Math.abs(this.velocity.y) > 0.1) {
            this.y += this.velocity.y;
            this.velocity.y *= 0.7;
        }
        this.scale(this.scaleX *= 1.02);
        this.opacity *= 0.8;
        this.modified();

        if (this.opacity < 0.01) {
            this.destroy();
        }
    };
}