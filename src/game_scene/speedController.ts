import { Entity } from "./entity/entity";

interface Params {
    firstFrame?: number;
    secondFrame?: number;
    thirdFrame?: number;
    minAcc?: number;
    maxAcc?: number;
    limit?: number;
}

export class SpeedController {

    private static readonly VELOCITY = Entity.SIZE / g.game.fps;
    private static readonly MIN_ACCELERATION = 5.0;
    private static readonly MAX_ACCELERATION = 6.0;
    private static readonly FIRST_FRAME = g.game.fps * 3; // 3s
    private static readonly SECOND_FRAME = SpeedController.FIRST_FRAME * 2; // 3s + 6s 
    private static readonly THIRD_FRAME = SpeedController.SECOND_FRAME * 2; // 3s + 6s + 18s

    private firstFrame: number;
    private secondFrame: number;
    private thirdFrame: number;
    private minAcc: number;
    private maxAcc: number;
    private firstStep = 0;
    private secondStep = 0;
    private thirdStep = 0;
    private limit = 0;

    constructor(params: Params) {
        this.firstFrame = params.firstFrame || SpeedController.FIRST_FRAME;
        this.secondFrame = params.secondFrame || SpeedController.SECOND_FRAME;
        this.thirdFrame = params.thirdFrame || SpeedController.THIRD_FRAME;
        this.minAcc = params.minAcc || SpeedController.MIN_ACCELERATION;
        this.maxAcc = params.maxAcc || SpeedController.MAX_ACCELERATION;
        this.limit = params.limit || 1;
    }

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
        } else if (this.thirdStep < this.thirdFrame * this.limit) {
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