export class SpawnSmoke extends g.Sprite {

    constructor(scene: g.Scene, parent: g.E, pos?: g.CommonOffset) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_smoke"),
            parent: parent,
            x: !pos ? parent.width / 2 : pos.x,
            y: !pos ? parent.height / 2 : pos.y,
            anchorX: .5,
            anchorY: .5,
            angle: g.game.random.generate() * 360,
        });

        this.onUpdate.add((): void | boolean => {
            if (this.scaleX < 4) {
                this.scale(Math.min(this.scaleX * 1.5, 4));
            }
            if (this.scaleX >= 3) {
                this.opacity *= .5;
                if (this.opacity < 0.01) {
                    this.destroy();
                }
            }
            this.modified();
        });
    }
}