export class SnowflakeStorage extends g.Pane {

    private static readonly DEFAULT_CAPACITY = 100;

    private _onFull: () => void;
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

        this.onUpdate.add(this.updateHanler);
    }

    private updateHanler = (): void => {
        if (this._isRelease) {
            this.count *= 0.7;
            const rate = 1 - this.rate();
            this.rect.height = this.height * rate;
            this.rect.modified();
            if (this.count < 0.01) {
                this.init();
            }
            if (this.angle !== 0) {
                this.angle *= 0.7;
                if (Math.abs(this.angle) < 0.01) {
                    this.angle = 0;
                }
                this.modified();
            }
        }
        else {
            if (this.rate() >= 1) {
                if (g.game.age % 3 === 0) {
                    this.angle = g.game.random.generate() * 12 - 6;
                    this.scale(1.4);
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

    rate = (): number => Math.min(this.count / this.capacity, 1);

    add = (count: number): void => {
        if (this.isFull()) return;
        if (this._isRelease) {
            this.init();
        };

        this.count += count;
        if (this.isFull()) {
            this._onFull();
        }

        const rate = this.rate();
        this.rect.height = this.height * (1 - rate);
        this.rect.modified();

        this.scale(1.1 + rate * .3);
        this.modified();
    };

    init = (): void => {
        this.count = 0;
        this._isRelease = false;

        this.scale(1);
        this.angle = 0;
        this.modified();

        this.rect.height = this.height;
        this.rect.modified();
    };

    release = (): void => {
        if (!this._isRelease) {
            this._isRelease = true;
        }
    };

    get isRelease(): boolean { return this._isRelease; }

    set onFull(callback: () => void) { this._onFull = callback; }
} 