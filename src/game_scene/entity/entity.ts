export abstract class Entity extends g.Sprite {

    static readonly SIZE = 80;
    static readonly DEFAULT_SCALE = 1.05;
    private static readonly DEFAULT_VELOCITY_Y = .2;
    private static readonly DEFAULT_ACCELERATION_Y = 1.35;

    velocity: g.CommonOffset = { x: 1, y: Entity.DEFAULT_VELOCITY_Y };

    constructor(scene: g.Scene, src: g.Surface | g.ImageAsset) {
        super({
            scene: scene,
            src: src,
            anchorX: .5,
            anchorY: .5,
        });
    }

    falling = (): void => { this.velocity.y *= Entity.DEFAULT_ACCELERATION_Y; };

    onGround = (entity: g.E): void => {
        this.y = entity.y - entity.height / 2 - this.height / 2;
        this.initVelocityY();
    };

    initVelocityY = (): void => { this.velocity.y = Entity.DEFAULT_VELOCITY_Y; };

    getWidth = (): number => this.width * this.scaleX;

    getHeight = (): number => this.height * this.scaleY;
}