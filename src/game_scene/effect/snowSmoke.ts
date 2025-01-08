export class SnowSmoke extends g.Sprite {

    private velocity: g.CommonOffset = { x: 0, y: 0 };

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

        this.velocity.x = -this.width / g.game.fps * (g.game.random.generate() * .5 + .5);
        this.velocity.y = -this.height / g.game.fps * (g.game.random.generate() + 2);
        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void | boolean => {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.scaleX *= 1.06;
        this.scaleY *= 1.06;
        this.opacity *= .7;
        this.modified();

        if (this.opacity < 0.01 || this.x + this.width / 2 < (g.game.focusingCamera as g.Camera2D).x) {
            if (!this.destroyed()) {
                this.destroy();
                return true;
            }
        }
    };
}