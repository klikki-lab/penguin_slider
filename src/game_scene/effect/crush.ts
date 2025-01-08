export class Crush extends g.Sprite {

    constructor(scene: g.Scene, x: number, y: number) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_crush"),
            anchorX: .5,
            anchorY: .5,
            angle: g.game.random.generate() * 360,
            x: x,
            y: y,
            scaleX: 1,
            scaleY: 1,
        });

        this.onUpdate.add(() => {
            this.scale(this.scaleX * 1.25);
            if (this.scaleX > 1.9) {
                this.destroy();
            }
            this.modified();
        });
    }
}