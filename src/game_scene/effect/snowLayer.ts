import { Snow } from "./snow";

export class SnowLayer extends g.E {

    constructor(scene: g.Scene, snowCount: number) {
        super({ scene: scene });

        for (let i = 0; i < snowCount; i++) {
            const snowFlake = new Snow(scene);
            this.append(snowFlake);
        }
    }
}