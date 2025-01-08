export class DriftIce extends g.Sprite {

    private vx = 0;

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_drift_ice"),
            anchorX: .5,
            anchorY: .5,
        });

        const seaHeight = 256;
        const rate = g.game.random.generate();
        const scaleRate = rate * .5 + .5;
        this.scaleX = scaleRate * (g.game.random.generate() < .5 ? -1 : 1);
        this.scaleY = scaleRate;
        this.x = g.game.width + this.getWidth() / 2;
        this.y = g.game.height - seaHeight + this.getHeight() * .4 + rate * (seaHeight - this.height * 4);

        this.setVelocityX(scaleRate);

        const penguin = new g.Sprite({
            scene: scene,
            parent: this,
            src: scene.asset.getImageById("img_penguin"),
            x: this.width / 2,
            y: this.height / 2,
            anchorX: .5,
            anchorY: 1,
            scaleX: scaleRate * .4,
            scaleY: scaleRate * .4,
        });

        const beak = new g.Sprite({
            scene: scene,
            parent: penguin,
            src: scene.asset.getImageById("img_penguin_beak"),
            anchorY: .5,
        });
        beak.x = penguin.width - beak.width * .4;
        beak.y = penguin.height / 2 - beak.height * .5;

        const tail = new g.Sprite({
            scene: scene,
            parent: penguin,
            src: scene.asset.getImageById("img_penguin_tail"),
            anchorX: .5,
            anchorY: .5,
        });
        tail.x = 0;
        tail.y = penguin.height * .9;

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void => {
        this.x -= this.vx;
        this.modified();

        if (this.x + this.getWidth() / 2 < 0) {
            this.destroy();
        }
    };

    private getWidth = (): number => this.width * Math.abs(this.scaleX);

    private getHeight = (): number => this.height * this.scaleY;

    setVelocityX = (speedRate: number): void => { this.vx = this.getWidth() / g.game.fps * speedRate; }
}