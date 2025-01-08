export class PopupScore extends g.Label {

    constructor(scene: g.Scene, font: g.BitmapFont, score: number) {
        super({
            scene: scene,
            font: font,
            fontSize: font.size * .5,
            text: `+${score.toString()}`,
        });

        const lifeTime = g.game.fps / 3;
        let time = lifeTime;
        this.onUpdate.add((): void | boolean => {
            const rate = time / lifeTime;
            this.y -= this.height * rate * .1;
            this.opacity = rate;
            this.modified();
            if (time-- <= 0) {
                this.destroy();
            }
        });
    }
}