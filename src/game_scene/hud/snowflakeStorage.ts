export class SnowflakeStorage extends g.Pane {

    private static readonly DEFAULT_CAPACITY = 100;

    private rect: g.FilledRect;
    private _count = 0;

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
        });

        this.onUpdate.add(this.updateHanler);
    }

    private updateHanler = (): void => {
        if (this.ratio() >= 1) {
            if (g.game.age % 3 === 0) {
                this.angle = g.game.random.generate() * 10 - 5;
                this.scaleX = 1.2;
                this.scaleY = 1.2;
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

    ratio = (): number => Math.min(this._count / this.capacity, 1);

    add = (count: number): void => {
        this._count += count;

        const rate = 1 - this.ratio();
        this.rect.height = this.height * rate;
        this.rect.modified();

        this.scaleX = 1.1;
        this.scaleY = 1.1;
        this.modified();
    };

    clear = (): void => {
        this._count = 0;

        this.angle = 0;
        this.modified();

        this.rect.height = this.height;
        this.rect.modified();
    };

    get count(): number { return this._count; }
}