export class SplashFragments {

    private static readonly MAX_NUM = 3;

    constructor(scene: g.Scene, parent: g.Scene | g.E, assetId: string, pos: g.CommonOffset, scale = .3, count = SplashFragments.MAX_NUM) {
        const offsetAngle = Math.PI / (g.game.random.generate() * count);
        for (let i = 0; i < count; i++) {
            const fragment = new Fragments(scene, assetId, pos, scale);
            const rad = 2 * Math.PI * (i / count) - offsetAngle;
            const v = fragment.width * fragment.scaleX * .5;
            const r = v + v * g.game.random.generate() * .5;
            fragment.velocity.x = Math.cos(rad) * r;
            fragment.velocity.y = Math.sin(rad) * r;

            parent.append(fragment);
        }
    }
}

class Fragments extends g.Sprite {

    velocity: g.CommonOffset = { x: 0, y: 0 };

    constructor(scene: g.Scene, assetId: string, pos: g.CommonOffset, scale: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById(assetId),
            x: pos.x,
            y: pos.y,
            anchorX: .5,
            anchorY: .5,
            scaleX: scale,
            scaleY: scale,
        });

        this.onUpdate.add(() => {
            this.opacity *= 0.95;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.modified();

            const vx = Math.abs(this.velocity.x);
            const vy = Math.abs(this.velocity.y);
            if (vx > 0.01) {
                this.velocity.x *= 0.9;
            }
            if (vy > 0.01) {
                this.velocity.y *= 0.9;
            }

            if (this.opacity < 0.05 || this.x + this.width * this.scaleX * .5 < (g.game.focusingCamera as g.Camera2D).x) {
                this.destroy();
            }
        });
    }
}