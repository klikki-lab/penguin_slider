export class FeverLayer extends g.E {

    private static readonly SNOWFLAKE_COUNT = 8;

    private snowflakes: Snowflake[] = [];
    private halo: g.Sprite;
    private _isStart = false;
    private _isStop = true;

    constructor(scene: g.Scene, pos: g.CommonOffset) {
        super({
            scene: scene,
        });

        for (let i = 0; i < FeverLayer.SNOWFLAKE_COUNT; i++) {
            const snowflake = new Snowflake(scene, pos.x, pos.y);
            this.snowflakes.push(snowflake);
            this.append(snowflake);
        }

        this.halo = new g.Sprite({
            scene: scene,
            parent: this,
            src: scene.asset.getImageById("img_halo"),
            x: pos.x,
            y: pos.y,
            anchorX: .5,
            anchorY: .5,
            opacity: 0,
        });
    }

    get isStart() { return this._isStart; }

    get isStop() { return this._isStop; }

    init = (): void => {
        this._isStart = false;
        this._isStop = true;
        this.halo.opacity = 0;
        this.halo.modified();
        this.snowflakes.forEach(snowflake => snowflake.stop());
    };

    start = (): void => {
        if (this._isStart) return;

        this._isStart = true;
        this._isStop = false;

        this.snowflakes.forEach(snowflake => {
            snowflake.init();
            snowflake.start();
        });

        this.halo.opacity = 0.1;
        if (!this.onUpdate.contains(this.updateHaloUpdate)) {
            this.onUpdate.add(this.updateHaloUpdate);
        }
    };

    stop = (): void => {
        if (this._isStop) return;

        this._isStart = false;
        this._isStop = true;
        this.snowflakes.forEach(snowflake => snowflake.stop());
    };

    private updateHaloUpdate = (): void | boolean => {
        if (this._isStart && this.halo.opacity < 1) {
            this.halo.opacity *= 1.5;
            if (this.halo.opacity > 1) {
                this.halo.opacity = 1;
            }
        }
        if (this._isStop && this.halo.opacity > 0) {
            this.halo.opacity *= .8;
            if (this.halo.opacity < 0.1) {
                this.halo.opacity = 0;
                return true;
            }
        }
        this.halo.angle += 1;
        this.halo.modified();
    }
}


class Snowflake extends g.Sprite {

    velocity: g.CommonOffset = { x: 0, y: 0 };
    private isStop = false;

    constructor(scene: g.Scene, private initX: number, private initY: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_snowflake_05"),
            x: initX,
            y: initY,
            anchorX: .5,
            anchorY: .5,
            scaleX: .3,
            scaleY: .3,
            opacity: 0,
        });
    }

    start = (): void => {
        if (!this.onUpdate.contains(this.updateHandler)) {
            this.onUpdate.add(this.updateHandler);
        }
    };

    stop = (): void => {
        this.isStop = true;
    };

    init = (): void => {
        this.isStop = false;
        const vx = g.game.random.generate() * 2 - 1;
        const vy = g.game.random.generate() * 2 - 1;
        const speed = (g.game.random.generate() * 4 + 4) * ((this.width * this.scaleX) / g.game.fps) * 2;
        this.velocity = { x: vx * speed, y: vy * speed };
        this.opacity = 1;
        this.x = this.initX;
        this.y = this.initY;
        this.modified();
    };

    updateHandler = (): void | boolean => {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= .9;
        this.velocity.y *= .9;
        if (Math.abs(this.velocity.x) < 4 && Math.abs(this.velocity.y) < 4) {
            this.opacity *= .7;
            if (this.opacity < 0.1) {
                if (this.isStop) {
                    this.opacity = 0;
                    this.modified();
                    return true;
                }
                this.init();
            }
        }
        this.modified();
    };
}