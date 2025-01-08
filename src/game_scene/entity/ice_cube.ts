import { Entity } from "./entity";

export class IceCube extends Entity {

    private _isFall = false;

    constructor(scene: g.Scene) {
        super(scene, scene.asset.getImageById("img_ice_cube"));
        this.scale(.25);
        this.onUpdate.add(this.updateHandler);
    }

    private updateHandler = (): void | boolean => {
        if (this.scaleX < Entity.DEFAULT_SCALE) {
            this.scale(this.scaleX * 1.8);
            if (this.scaleX > Entity.DEFAULT_SCALE) {
                this.scale(Entity.DEFAULT_SCALE);
            }
            this.modified();
        }

        const camera = g.game.focusingCamera as g.Camera2D;
        if ((camera.x > 0 && this.x + this.getWidth() / 2 < camera.x) || this.y - this.getHeight() / 2 > g.game.height) {
            this.destroy();
        }
    };

    get isFall() { return this._isFall; }

    fall = (): void => { this._isFall = true; }
}