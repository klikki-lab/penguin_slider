export class Snowflake extends g.Sprite {

    private _isObtained = false;

    constructor(scene: g.Scene, assetId: string, private _score: number, private isSurprise = false) {
        super({
            scene: scene,
            src: scene.asset.getImageById(assetId),
            anchorX: .5,
            anchorY: .5,
        });
        this.scale(isSurprise ? 0.01 : 1);

        this.onUpdate.add(this.updateHandler);
    }

    obtain = (): void => {
        if (!this._isObtained) {
            this._isObtained = true;
        }
    };

    private updateHandler = (): void | boolean => {
        if (this.isSurprise) {
            this.scale(this.scaleX *= 1.5);
            if (this.scaleX > 1) {
                this.scale(1);
            }
            this.modified();
        }
        if (this._isObtained || this.x + this.width / 2 < (g.game.focusingCamera as g.Camera2D).x) {
            this.destroy();
            return true;
        }
    };

    get isObtained(): boolean { return this._isObtained; }

    get score(): number { return this._score; }
}