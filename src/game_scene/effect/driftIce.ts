import { Collision } from "../../common/collision";

export class DriftIces extends g.E {

    private static readonly MAX_COUNT = 8;
    private driftIces: DriftIce[] = [];

    constructor(scene: g.Scene, parent: g.Scene | g.E, private maxCount = DriftIces.MAX_COUNT) {
        super({ scene: scene, parent: parent });

        for (let i = 0; i < maxCount; i++) {
            this.driftIces.push(new DriftIce(scene, this));
        }

        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void => {
        this.driftIces.forEach(driftIce => {
            driftIce.x += driftIce.vx;
            driftIce.modified();

            if (driftIce.x + driftIce.getWidth() / 2 < 0) {
                this.initPos(driftIce);
                this.children.sort((e1: g.E, e2: g.E) => e1.y - e2.y);
            }
        });

        for (let i = 0; i < this.maxCount - 1; i++) {
            const driftIce = this.driftIces[i];
            for (let j = i + 1; j < this.maxCount; j++) {
                const target = this.driftIces[j];
                if (Collision.within(driftIce, target)) {
                    const temp = target.vx;
                    target.vx = Math.min(driftIce.vx * 0.98, this.calcVelocityX(target, 0.5));
                    driftIce.vx = Math.min(temp * 0.98, this.calcVelocityX(driftIce, 0.5));
                }
            }
        }
    };

    private initPos = (driftIce: DriftIce): void => {
        const seaHeight = 256;
        const rate = g.game.random.generate();
        const scaleRate = rate * .5 + .5;
        driftIce.scaleX = scaleRate * (g.game.random.generate() < .5 ? -1 : 1);
        driftIce.scaleY = scaleRate;
        driftIce.vx = this.calcVelocityX(driftIce, scaleRate);

        driftIce.x = g.game.random.generate() * g.game.width + g.game.width + driftIce.getWidth() / 2;
        driftIce.y = g.game.height - seaHeight + driftIce.getHeight() * .4 + rate * (seaHeight - driftIce.height * 4);

        if (this.driftIces.filter(ice => ice !== driftIce && Collision.within(driftIce, ice)).length > 0) {
            this.initPos(driftIce);
        }
        driftIce.modified();

        const penguin = driftIce.children[0];
        if (penguin) {
            penguin.scaleX = driftIce.scaleX * .5;
            penguin.scaleY = driftIce.scaleY * .5;
            penguin.modified();
        }
    };

    init = (): void => {
        this.driftIces.forEach(driftIce => this.initPos(driftIce));
        this.children.sort((e1: g.E, e2: g.E) => e1.y - e2.y);
    };

    private calcVelocityX = (driftIce: DriftIce, speedRate: number): number => -driftIce.getWidth() / g.game.fps * speedRate;
}

class DriftIce extends g.Sprite {

    vx = 0;

    constructor(scene: g.Scene, parent: g.Scene | g.E) {
        super({
            scene: scene,
            parent: parent,
            src: scene.asset.getImageById("img_drift_ice"),
            anchorX: .5,
            anchorY: .5,
        });

        const penguin = new g.Sprite({
            scene: scene,
            parent: this,
            src: scene.asset.getImageById("img_penguin"),
            x: this.width / 2,
            y: this.height / 2,
            anchorX: .5,
            anchorY: 1,
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
    }

    getWidth = (): number => this.width * Math.abs(this.scaleX);

    getHeight = (): number => this.height * this.scaleY;
}