export class Speedometer extends g.Sprite {

    private static readonly TICK = 15;
    private static readonly MIN_VALUE = -Speedometer.TICK * 9;
    private static readonly MAX_VALUE = Speedometer.TICK * 15;

    private needle: g.Sprite;
    private _value = 0;

    constructor(scene: g.Scene) {
        super({
            scene: scene,
            src: scene.asset.getImageById("img_speedometer"),
            anchorX: .5,
            anchorY: .5,
            opacity: 1,
        });

        this.needle = new g.Sprite({
            scene: scene,
            src: scene.asset.getImageById("img_speedometer_needle"),
            anchorX: .5,
            anchorY: 1,
        });
        this.needle.x = this.width / 2;
        this.needle.y = this.height / 2;
        this.append(this.needle);

        this.value = 0;
    }

    init = (): void => { this.value = 0; };

    decay = (): void => {
        if (this._value > 0.01) {
            this._value *= 0.7;
        } else {
            this._value = 0;
        }
        this.value = this._value;
    };

    set value(value: number) {
        this._value = g.Util.clamp(value, 0, 1);
        this.updateMeter(value);
    }

    private updateMeter(value: number) {
        const errorRange = (g.game.random.generate() * 2 - 1) * 1.5;
        this.needle.angle = Speedometer.MIN_VALUE + Speedometer.MAX_VALUE * value + errorRange;
        this.needle.modified();
    }
}