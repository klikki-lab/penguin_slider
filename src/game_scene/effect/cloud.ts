export class Clouds {

    private static readonly MAX_COUNT = 8;
    private clouds: Cloud[] = [];

    constructor(scene: g.Scene, parent: g.Scene | g.E, maxCount = Clouds.MAX_COUNT) {
        for (let i = 0; i < maxCount; i++) {
            this.clouds.push(new Cloud(scene, parent));
        }
    }

    init = (): void => { this.clouds.forEach(cloud => cloud.init()); };
}

class Cloud extends g.Sprite {

    private vx = 0;

    constructor(scene: g.Scene, parent: g.Scene | g.E) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_cloud"),
            anchorX: .5,
            anchorY: .5,
        });

        this.init();
        this.onUpdate.add(this.updateHandler);
    }

    init = (): void => {
        const scale = g.game.random.generate() * .75 + .25;
        this.scale(scale);
        this.opacity = scale * .5;
        this.setVelocityX(scale);

        this.x = g.game.random.generate() * g.game.width + this.getWidth() / 2;
        this.y = g.game.random.generate() * (g.game.height * .3) + this.getHeight();
    };

    private updateHandler = (): void => {
        this.x += this.vx;

        if (this.x + this.getWidth() * 0.5 < 0) {
            this.init();
            this.x = g.game.width + this.getWidth() / 2;
        }
        this.modified();
    };

    private getWidth = (): number => this.width * this.scaleX;

    private getHeight = (): number => this.height * this.scaleY;

    setVelocityX = (rate: number): void => {
        const acceleration = -this.getWidth() / g.game.fps;
        this.vx = acceleration * rate * rate * 2 + acceleration * .2;
    }
}