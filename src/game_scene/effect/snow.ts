export class Snow extends g.Sprite {

    velocity: g.CommonOffset = { x: 0, y: 0 };
    private period = 0;

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_snow"),
            anchorX: .5,
            anchorY: .5,
        });

        this.init();
        this.y = g.game.random.generate() * -(g.game.height + this.getHeight());

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void => {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.angle += this.period / (this.getWidth() / 4);
        this.angle %= 360;
        this.velocity.x = Math.cos(g.game.age / this.period) * this.getWidth() * .1;

        if (this.y - this.getHeight() / 2 > g.game.height ||
            this.x + this.getWidth() / 2 < 0 ||
            this.x - this.getWidth() / 2 > g.game.width) {
            this.init();
        }
        this.modified();
    };

    init = (): void => {
        const rate = g.game.random.generate() * (g.game.random.generate() > 0.8 ? .8 : .2) + .2;

        this.angle = g.game.random.generate() * 360;
        this.scale(rate * 2);
        this.opacity = (1 - rate) * .5 + .2;

        this.period = Math.floor(g.game.random.generate() * this.getWidth() / 2 + this.getWidth());
        this.velocity.x = Math.cos(g.game.age / this.period) * this.getWidth() * .1;
        this.velocity.y = this.getHeight() * .25;

        this.x = g.game.random.generate() * (g.game.width - this.getWidth() * 2) + this.getWidth();
        this.y = -this.getHeight() / 2;
    };

    getWidth = (): number => this.width * this.scaleX;

    getHeight = (): number => this.height * this.scaleY;
}