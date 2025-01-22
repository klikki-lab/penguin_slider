export class SnowflakeStorage extends g.Pane {

    private static readonly DEFAULT_CAPACITY = 100;
    // private static readonly SNOWFLAKE_COUNT = 8;

    //private snowflakes: Snowflake[] = [];
    private rect: g.FilledRect;
    private count = 0;
    private _isRelease = false;

    constructor(scene: g.Scene, private capacity = SnowflakeStorage.DEFAULT_CAPACITY) {
        const asset = scene.asset.getImageById("img_snowflake_05");
        super({
            scene: scene,
            width: asset.width,
            height: asset.height,
            anchorX: 0.5,
            anchorY: 0.5,
        });

        new g.Sprite({
            scene: scene,
            parent: this,
            src: asset,
        });

        this.rect = new g.FilledRect({
            scene: scene,
            parent: this,
            width: asset.width,
            height: asset.height,
            cssColor: "black",
            compositeOperation: "source-atop",
            opacity: .9,
        });

        // for (let i = 0; i < SnowflakeStorage.SNOWFLAKE_COUNT; i++) {
        //     const snowflake = new Snowflake(scene, this.width / 2, this.height / 2);
        //     this.snowflakes.push(snowflake);
        //     this.append(snowflake);
        // }

        this.onUpdate.add(this.updateHanler);
    }

    private updateHanler = (): void => {
        if (this._isRelease) {
            this.count *= 0.7;
            const rate = 1 - this.ratio();
            this.rect.height = this.height * rate;
            this.rect.modified();
            if (this.count < 0.01) {
                this.init();
            }
            if (this.angle !== 0) {
                this.angle *= 0.9;
                if (Math.abs(this.angle) < 0.1) {
                    this.angle = 0;
                }
                this.modified();
            }
        }
        else {
            if (this.ratio() >= 1) {
                if (g.game.age % 3 === 0) {
                    this.angle = g.game.random.generate() * 10 - 5;
                    this.scaleX = 1.25;
                    this.scaleY = 1.25;
                }
            }
        }

        if (this.scaleX > 1) {
            this.scaleX *= 0.95;
            this.scaleY *= 0.95;
            if (this.scaleX < 1) {
                this.scale(1);
            }
            this.modified();
        }
    };

    isFull = (): boolean => this.count >= this.capacity;

    ratio = (): number => Math.min(this.count / this.capacity, 1);

    add = (count: number): void => {
        if (this.isFull()) return;
        if (this._isRelease) {
            this.init();
        };

        this.count += count;

        const rate = 1 - this.ratio();
        this.rect.height = this.height * rate;
        this.rect.modified();

        this.scaleX = 1.1;
        this.scaleY = 1.1;
        this.modified();
    };

    init = (): void => {
        this.count = 0;
        this._isRelease = false;

        this.angle = 0;
        this.modified();

        this.rect.height = this.height;
        this.rect.modified();
    };

    release = (): void => {
        if (!this._isRelease) {
            this._isRelease = true;
            //this.snowflakes.forEach(snowflake => snowflake.start());
        }
    };

    get isRelease(): boolean { return this._isRelease; }
}

class Snowflake extends g.Sprite {

    private velocity: g.CommonOffset = { x: 0, y: 0 };

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
        if (this.onUpdate.length !== 0) return;

        this.init();
        this.onUpdate.add(this.updateHandler);
    };

    stop = (): void => {
        this.onUpdate.removeAll();
        this.hide();
    };

    private init = (): void => {
        const vx = g.game.random.generate() * 2 - 1;
        const vy = g.game.random.generate() * 2 - 1;
        const speed = g.game.random.generate() * 5 + 1 * this.width / g.game.fps * 2;
        this.velocity = { x: vx * speed, y: vy * speed };
        this.opacity = 1;
        this.x = this.initX;
        this.y = this.initY;
        this.show();
        this.modified();
    };

    private updateHandler = (): void | boolean => {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= .9;
        this.velocity.y *= .9;
        this.opacity *= .9;
        if (this.opacity < 0.1) {
            // this.init();
            return true;
        }
        this.modified();
    };
}