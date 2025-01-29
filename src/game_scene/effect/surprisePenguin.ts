import { E } from "@akashic/akashic-engine";

export class SurprisePenguin extends g.Sprite {

    private beak: g.Sprite;
    private tail: g.Sprite;
    private vx = 0;
    private prevX = 0;

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_yellow_penguin"),
            anchorX: .5,
            anchorY: .5,
            scaleX: .5,
            scaleY: .5,
        });

        this.beak = new g.Sprite({
            scene: scene,
            parent: this,
            src: scene.asset.getImageById("img_penguin_beak"),
            anchorY: .5,
        });
        this.beak.x = this.width - this.beak.width * .4;
        this.beak.y = this.height * .5 - this.beak.height * .5;

        this.tail = new g.Sprite({
            scene: scene,
            parent: this,
            src: scene.asset.getImageById("img_yellow_penguin_tail"),
            anchorX: .5,
            anchorY: .5,
        });
        this.tail.x = 0;
        this.tail.y = this.height * .9;

        this.vx = g.game.width / (g.game.fps * 3);
        this.init();
    }

    init = (): void => {
        if (this.onUpdate.contains(this.updateHandler)) {
            this.onUpdate.remove(this.updateHandler);
        }

        this.x = -this.getWidth() * .5 - this.beak.width;
        this.y = g.game.height - 256 - this.getHeight() * .5 * .8;
        this.prevX = this.x;
        this.modified();
    };

    private updateHandler = (): void | boolean => {
        this.x += this.vx;
        this.modified();
        if (this.x > this.prevX + this.getWidth() * .5) {
            this.prevX = this.x;
            new Splash(this.scene, this.parent, this);
        }
        if (this.x - this.tail.width > g.game.width) {
            return true;
        }
    };

    start = (): void => {
        if (!this.onUpdate.contains(this.updateHandler)) {
            this.init();
            this.onUpdate.add(this.updateHandler);
        }
    };

    private getWidth = (): number => this.width * this.scaleX;

    private getHeight = (): number => this.height * this.scaleY;
}

class Splash extends g.Sprite {

    constructor(scene: g.Scene, parent: g.Scene | g.E, penguin: SurprisePenguin) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_splash"),
            scaleX: .5,
            scaleY: .5,
            anchorX: .5,
            anchorY: .5,
            opacity: .5,
            angle: 320 + g.game.random.generate() * 10 - 5,
        });
        this.x = penguin.x - penguin.width * penguin.scaleX * .5;
        let height = this.height * this.scaleY;
        const bottom = penguin.y + penguin.height * penguin.scaleY * .5;
        this.y = bottom - g.game.random.generate() * height * .2;
        let vy = height * .1 + g.game.random.generate() * height * .1;

        this.onUpdate.add(() => {
            this.y += vy;
            vy *= .9;
            this.modified();
            if (this.y - height * .5 > bottom) {
                this.destroy();
                return true;
            }
        });
    }
}