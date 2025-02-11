import { Entity } from "../entity/entity";

export class Wall extends g.Sprite {

    constructor(scene: g.Scene, wallHeight: number, edgeIndex: number) {
        const asset = scene.asset.getImageById("img_wall");
        const height = (wallHeight + 1) * Entity.SIZE;
        super({
            scene: scene,
            src: asset,
            width: Entity.SIZE,
            height: height,
            srcX: edgeIndex * Entity.SIZE,
            srcY: asset.height - height,
            anchorX: .5,
            anchorY: .5,
        });

        this.onUpdate.add(() => {
            const camera = g.game.focusingCamera as g.Camera2D;
            if (this.x + this.width / 2 < camera.x) {
                this.destroy();
                return true;
            }
        });
    }
}