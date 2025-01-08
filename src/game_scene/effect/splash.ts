import { Entity } from "../entity/entity";

export class Splash {

    constructor(scene: g.Scene, parent: g.Scene | g.E, x: number) {
        const w = Entity.SIZE / 2;
        for (let i = 0; i < 3; i++) {
            const splash = new g.Sprite({
                scene: scene,
                parent: parent,
                src: scene.asset.getImageById("img_splash"),
                x: (x - w) + i * w,
                y: g.game.height,
                anchorX: .5,
            });

            const isCenter = i === 1;
            const maxStep = isCenter ? 9 : 10;
            const top = splash.height * (isCenter ? 1 : g.game.random.generate() * .5 + .5);

            let step = 0;
            splash.onUpdate.add(() => {
                splash.y = g.game.height - Math.sin((++step / maxStep) * Math.PI) * top;
                splash.modified();
                if (step >= maxStep || splash.x + splash.width / 2 < (g.game.focusingCamera as g.Camera2D).x) {
                    splash.destroy();
                }
            });
        }
    }
}