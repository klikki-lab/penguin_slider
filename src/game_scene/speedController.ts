import { Entity } from "./entity/entity";

export class SpeedController {

    private static readonly VELOCITY = Entity.SIZE / g.game.fps;
    private static readonly MIN_ACCELERATION = 5.0;
    private static readonly MAX_ACCELERATION = 6.0;
    private static readonly FIRST_FRAME = g.game.fps * 3; // 3s
    private static readonly SECOND_FRAME = SpeedController.FIRST_FRAME * 2; // 3s + 6s 
    private static readonly THIRD_FRAME = SpeedController.SECOND_FRAME * 2; // 3s + 6s + 18s

    private firstStep = 0;
    private secondStep = 0;
    private thirdStep = 0;

    constructor(
        private firstFrame = SpeedController.FIRST_FRAME,
        private secondFrame = SpeedController.SECOND_FRAME,
        private thirdFrame = SpeedController.THIRD_FRAME,
        private minAcc = SpeedController.MIN_ACCELERATION,
        private maxAcc = SpeedController.MAX_ACCELERATION) { }

    init = (): void => {
        this.firstStep = 0;
        this.secondStep = 0;
        this.thirdStep = 0;
    };

    update = (): void => {
        if (this.firstStep < this.firstFrame) {
            this.firstStep++;
        } else if (this.secondStep < this.secondFrame) {
            this.secondStep++;
        } else if (this.thirdStep < this.thirdFrame) {
            this.thirdStep++;
        }
    }

    getSpeedRate = (): number =>
        (this.firstStep / this.firstFrame + this.secondStep / this.secondFrame + this.thirdStep / this.thirdFrame) / 3;

    /**
     * @returns 秒速
     */
    getPerSec = (): number => this.minAcc + this.getSpeedRate() * this.maxAcc;

    getVelocity = (): g.CommonOffset => {
        const vx = Math.floor(SpeedController.VELOCITY * this.getPerSec());
        const vy = Math.floor(SpeedController.VELOCITY);
        return { x: vx, y: vy };
    };

    getInitVx = (): number => Math.floor(SpeedController.VELOCITY * this.minAcc);
}