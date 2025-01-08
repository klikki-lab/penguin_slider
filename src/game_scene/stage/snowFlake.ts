export class SnowFlake extends g.Sprite {

    private _isObtained = false;

    constructor(scene: g.Scene, assetId: string, private _score: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById(assetId),
            anchorX: .5,
            anchorY: .5,
        });

        this.onUpdate.add(this.updateHandler);
    }

    obtain = (): void => {
        if (!this._isObtained) {
            this._isObtained = true;
        }
    };

    private updateHandler = (): void | boolean => {
        if (this._isObtained || this.x + this.width / 2 < (g.game.focusingCamera as g.Camera2D).x) {
            this.destroy();
            return true;
        }
    };

    get isObtained(): boolean { return this._isObtained; }

    get score(): number { return this._score; }
}