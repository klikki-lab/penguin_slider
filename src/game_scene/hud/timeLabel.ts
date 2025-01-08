export class TimeLabel extends g.Label {

    constructor(scene: g.Scene, font: g.BitmapFont, fontSize: number, sec: number) {
        super({
            scene: scene,
            font: font,
            text: `TIME ${(" " + sec).slice(-2)}`,
            fontSize: fontSize,
        });
    }

    setTime = (sec: number): void => {
        this.text = `TIME ${(" " + sec).slice(-2)}`;
        this.invalidate();
    };
}