import { Entity } from "./entity";

export class Penguin extends Entity {

    private static readonly OFFSET_X = 3.5;
    private static readonly OFFSET_Y = 7.5;

    private beak: g.Sprite;
    private tail: g.Sprite;
    private _collectedSnowFlake = 0;
    private _missCount = 0;
    private _isCrushed = false;
    private _isFalled = false;

    constructor(scene: g.Scene) {
        super(scene, scene.asset.getImageById("img_penguin"));

        this.beak = new g.Sprite({
            scene: scene,
            src: scene.asset.getImageById("img_penguin_beak"),
            anchorY: .5,
        });
        this.beak.x = this.width - this.beak.width * .4;
        this.beak.y = this.height / 2 - this.beak.height * .5;
        this.append(this.beak);

        this.tail = new g.Sprite({
            scene: scene,
            src: scene.asset.getImageById("img_penguin_tail"),
            anchorX: .5,
            anchorY: .5,
        });
        this.tail.x = 0;
        this.tail.y = this.height * .9;
        this.append(this.tail);

        this.init();
    }

    init = (): void => {
        this._isCrushed = false;
        this._isFalled = false;

        if (this.tail.onUpdate.length === 0) {
            this.tail.onUpdate.add(() => {
                if (g.game.age % 2 === 0) {
                    this.tail.scaleY *= -1;
                    this.tail.modified();
                }
            });
        }

        this.initVelocityY();
        this.angle = 0;
        this.scale(Entity.DEFAULT_SCALE);
        this.x = -this.getWidth() / 2 - this.beak.width;
        this.y = this.getGroundY();
        this.modified();
    };

    offsetX = (): number => this.x - this.width * Penguin.OFFSET_X;

    private getGroundY = (): number => this.height * Penguin.OFFSET_Y;

    obtainSnowFlake = (): void => { this._collectedSnowFlake++; };

    get collectedSnowFlake(): number { return this._collectedSnowFlake; }

    isFalling = (): boolean => this.y > this.getGroundY();

    crushed = (speedRate: number): void => {
        this._isCrushed = true;
        this._missCount++;
        this.velocity.x = -this.width / g.game.fps * (2 * (1 + speedRate));
        this.velocity.y = (1 - this.y / g.game.height) * (this.height / g.game.fps) * 4;
        this.tail.onUpdate.removeAll();
    };

    falled = (): void => {
        this._isFalled = true;
        this._missCount++;
    };

    get isCrushed(): boolean { return this._isCrushed; }

    get isFalled(): boolean { return this._isFalled; }

    isMissed = (): boolean => this._isCrushed || this._isFalled;

    get missCount(): number { return this._missCount; }

    isNoMiss = (): boolean => this._missCount === 0;
}