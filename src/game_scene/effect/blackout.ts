export class Blackout extends g.Sprite {

    static readonly DURATION_TRANSITION = 150;
    static readonly DURATION_WAIT = 500;

    constructor(scene: g.Scene, parent: g.Scene | g.E) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_blackout"),
            parent: parent,
        });
    }
}