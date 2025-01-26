import { Entity } from "../entity/entity";
import { Snowflake } from "./snowflake";
import { Wall } from "./wall";

const SupriseBonusPattern = {
    CHECKBOARD: 0,
    LATTICE: 1,
    WAVE: 2,
    // VERTICAL: 3,
    // HORIZONTAL: 4,
} as const;

export class StageLayer extends g.E {

    /** 高さ 9 */
    static readonly ROW = Math.floor(g.game.height / Entity.SIZE);
    /** 幅 16 + 1 */
    static readonly COL = Math.floor(g.game.width / Entity.SIZE) + 1;

    private static readonly SNOWFLAKE_INDEX = [0, 0, 1];
    private static readonly SNOWFLAKE_ASSET_IDS = ["img_snowflake_01", "img_snowflake_02"];
    private static readonly BONUS_SNOWFLAKE_ASSET_IDS = ["img_snowflake_03", "img_snowflake_04", "img_snowflake_05"];

    private static readonly MIN_WALL_WIDTH = 2;
    private static readonly MIN_INTERVAL = 4;
    private static readonly EDGES_MASK = 0x101;
    private static readonly PITFALL_MASK = 0x1FC;
    private static readonly LEVEL_MIN_OFFSETS = [0, 0x2F, 0x3F, 0x4F, 0x5F, 0x6F, 0x7F];

    private _onFinishBonusTime: (isSurprise: boolean) => void;
    private _onSurprise: () => void;
    private _snowflakes: g.E;
    private _snowFlakeCount = 0;
    private _rareSnowFlakeCount = 0;
    private step = 0;
    private interval = 0;
    private wallDuration = 0;
    private wall = 0;
    private startWall = -1;
    private possibleMaxIceCube = 0;
    private bonusDuration = 0;
    private startBonusStep = 0;
    private endBonusStep = 0;
    private bonusTimes = 0;
    private endStep = 0;
    private isEnd = false;
    private isSurpriseBonus = false;
    private supriseBonusPattern = 0;

    constructor(scene: g.Scene, private random: g.RandomGenerator) {
        super({ scene: scene, });

        this.children = [];
        this._snowflakes = new g.E({ scene: scene, parent: this });
        this._snowflakes.children = [];
    }

    init = (): void => {
        for (let i = this.children.length - 1; i >= 0; i--) {
            const wall = this.children[i];
            if ((wall instanceof Wall) && !wall.destroyed()) wall.destroy();
        }
        for (let i = this._snowflakes.children.length - 1; i >= 0; i--) {
            const snowflake = this._snowflakes.children[i];
            if (!snowflake.destroyed()) snowflake.destroy();
        }

        this.interval = 0;
        this.wallDuration = 0;
        this.wall = 0;
        this.startWall == -1;
        this.possibleMaxIceCube = 0;
        this.bonusDuration = 0;
        this.startBonusStep = 0;
        this.endBonusStep = 0;
        this.isSurpriseBonus = false;

        for (this.step = -1; this.step < StageLayer.COL; this.step++) {
            this.appendWall(this.step, 0, 0);
            const bottom = this.appendWall(this.step, StageLayer.ROW - 1, 0);
            this.appendSnowCovered(bottom);
        }
    };

    finish = (): void => {
        this.isEnd = true;
        this.endStep = 0;
    };

    needNextWall = (cameraX: number): boolean =>
        Math.floor(cameraX / Entity.SIZE) + StageLayer.COL + 1 > this.step;

    private startBonusArea = (bonusDuration: number): void => {
        this.bonusDuration = bonusDuration;
        this.startBonusStep = this.step;
        this.endBonusStep = this.step + this.bonusDuration;
        this.bonusTimes++;
    };

    /**
     * @param levelRate     0 から 1 までの値
     * @param speedRate     0 から 1 までの値
     * @param remainingTime 残り時間
     * @param perSec        秒速
     * @param storageRate   雪の結晶が貯まった比率
     */
    create = (levelRate: number, speedRate: number, remainingTime: number, perSec: number, storageRate: number): void => {
        if (!this.isEnd) {
            if (this.interval <= 0 && levelRate < 1) {
                this.createNextWallData(levelRate, speedRate, remainingTime, perSec);
            } else {
                if (this.wallDuration > 0) {
                    this.wallDuration--;

                    if (this.wallDuration === 0 && this.step - this.endBonusStep > StageLayer.COL) {
                        if (storageRate >= 1) {
                            this.startBonusArea(Math.floor(this.random.generate() * perSec + perSec * 2));
                        } else {
                            if (levelRate > 0.6 && levelRate < 0.9 && storageRate < .75 &&
                                this.random.generate() < (speedRate * speedRate * speedRate) / ((this.bonusTimes + 1) * 4)) {
                                this.startBonusArea(Math.floor(this.random.generate() * perSec + perSec * 2));
                                this.isSurpriseBonus = true;
                                this.supriseBonusPattern = Math.floor(this.random.generate() * Object.keys(SupriseBonusPattern).length);
                                this._onSurprise();
                            }
                        }
                    }
                } else {
                    if (levelRate < 1 && this.bonusDuration <= 0) {
                        this.interval--;
                    }
                }
            }
        } else {
            if (this.endStep === 0) {
                const wall = new Wall(this.scene, 0, 1);
                wall.moveTo(this.step * wall.width + wall.width / 2, wall.height / 2);
                wall.scaleX = -1;
                this.append(wall);
            }

            this.appendSnowCovered(this.appendWall(this.step, StageLayer.ROW - 1, 0));
            this.step++;
            this.endStep++;
            return;
        }

        if (this.wallDuration > 0) {
            let snowflakeCount = 0;
            let rareSnowflakeCount = 0;
            let snowflakeIndex = 0;
            let height = 0;
            while (height < StageLayer.ROW) {
                let index = 0;
                while (height + index < StageLayer.ROW && (this.wall >>> (StageLayer.ROW - 1 - (height + index))) & 1) {
                    index++;
                }
                if (index > 0) {
                    const wall = this.appendWall(this.step, height, index - 1);
                    if (height > 0) {
                        this.appendSnowCovered(wall);
                        if (height < StageLayer.ROW - 1) {
                            const min = Math.min(snowflakeIndex++, StageLayer.SNOWFLAKE_INDEX.length - 1);
                            const assetIndex = StageLayer.SNOWFLAKE_INDEX[min];
                            const assetId = StageLayer.SNOWFLAKE_ASSET_IDS[assetIndex];
                            const score = assetIndex * 200 + 100;
                            this.appendSnowFlake(wall.x, wall.y - wall.height / 2, assetId, score);

                            if (assetIndex === 1) {
                                rareSnowflakeCount++;
                            }
                            snowflakeCount++;
                        }
                    }
                    height += index;
                } else {
                    height++;
                }
            }
            if (rareSnowflakeCount > 0) {
                this._rareSnowFlakeCount++;
            }
            if (snowflakeCount > 0) {
                this._snowFlakeCount++;
            }
        } else if (this.bonusDuration > 0) {
            this.bonusDuration--;
            this.appendWall(this.step, 0, 0);

            if (this.isSurpriseBonus) {
                if (this.step - this.startBonusStep > 2 && this.bonusDuration > 2) {
                    const offsetY = 3;
                    const maxY = StageLayer.ROW - 1;
                    const stepIndex = this.step - this.startBonusStep;
                    let snowfrakeCount = 0;
                    switch (this.supriseBonusPattern) {
                        default:
                        case SupriseBonusPattern.CHECKBOARD:
                            for (let i = offsetY; i < maxY; i++) {
                                if ((stepIndex + i) % 2 === 1) {
                                    this.appendBonusSnowflake(i);
                                    snowfrakeCount++;
                                }
                            }
                            break;
                        case SupriseBonusPattern.LATTICE:
                            for (let i = offsetY; i < maxY; i++) {
                                if (i % 2 === 0 || stepIndex % 2 === 0) {
                                    this.appendBonusSnowflake(i);
                                    snowfrakeCount++;
                                }
                            }
                            break;
                        case SupriseBonusPattern.WAVE:
                            const height = maxY - offsetY;
                            for (let i = offsetY; i < maxY; i++) {
                                const waveY = ((Math.sin(stepIndex / 2) + 1) * (height / 2)) + offsetY;
                                if (Math.abs(waveY - i) < 2) {
                                    this.appendBonusSnowflake(i);
                                    snowfrakeCount++;
                                }
                            }
                            break;
                        // case SupriseBonusPattern.VERTICAL:
                        //     for (let i = offsetY; i < maxY; i++) {
                        //         if (stepIndex % 2 === 1) {
                        //             this.appendBonusSnowflake(i);
                        //             snowfrakeCount++;
                        //         }
                        //     }
                        //     break;
                        // case SupriseBonusPattern.HORIZONTAL:
                        //     for (let i = offsetY; i < maxY; i++) {
                        //         if (i % 2 === 1) {
                        //             this.appendBonusSnowflake(i);
                        //             snowfrakeCount++;
                        //         }
                        //     }
                        //     break;
                    }
                    if (snowfrakeCount > 0) {
                        this._snowFlakeCount++;
                    }
                }
            } else if (this.step - this.startBonusStep > 2 && this.bonusDuration > 2) {
                for (let i = 3; i < StageLayer.ROW - 1; i++) {
                    this.appendBonusSnowflake(i);
                }
                this._snowFlakeCount++;
            }
            if (this.bonusDuration === 0) {
                this.possibleMaxIceCube = 0;
            }
        } else {
            this.appendWall(this.step, 0, 0);
            const bottom = this.appendWall(this.step, StageLayer.ROW - 1, 0);
            this.appendSnowCovered(bottom);
        }

        const penguinOffsetX = 3;
        const start = this.startBonusStep + StageLayer.COL - penguinOffsetX;
        if (this.startBonusStep && this.endBonusStep && this.step >= start) {
            const end = this.endBonusStep + StageLayer.COL - penguinOffsetX;
            if (this.step >= end) {
                this.startBonusStep = 0;
                this.endBonusStep = 0;
                this._onFinishBonusTime(this.isSurpriseBonus);
                this.isSurpriseBonus = false;
            }
        }

        this.step++;
    };

    private appendBonusSnowflake = (y: number): void => {
        const wall = this.appendWall(this.step, 0, 0);
        const index = Math.floor(this.random.generate() * StageLayer.BONUS_SNOWFLAKE_ASSET_IDS.length);
        const assetId = StageLayer.BONUS_SNOWFLAKE_ASSET_IDS[index];
        const score = 200;
        this.appendSnowFlake(wall.x, Entity.SIZE * y, assetId, score);
    };

    private createNextWallData = (levelRate: number, speedRate: number, remainingTime: number, perSec: number): void => {
        const penguinOffsetX = 3;
        const arrivalTime = (StageLayer.COL - penguinOffsetX) / perSec; // ペンギンが壁（右端）に到達するおよその時間
        if (remainingTime <= arrivalTime) { // 今から壁を作ってもペンギンまで到達しないと判断した場合は壁を作らない
            this.wallDuration = 0;
        } else {
            if (remainingTime <= arrivalTime * 1.8) {// 残り時間が少ない場合は残りは壁にする
                const addWidth = (remainingTime - arrivalTime) * perSec;
                this.wallDuration = Math.max(StageLayer.MIN_WALL_WIDTH, Math.floor(addWidth * (2 - speedRate)));
            } else {
                const col = StageLayer.COL / 2;
                this.wallDuration = Math.floor(this.random.generate() * col) + StageLayer.MIN_WALL_WIDTH;
            }
        }
        this.startWall = this.wallDuration;

        const level = Math.floor((StageLayer.LEVEL_MIN_OFFSETS.length - 1) * levelRate);
        const min = StageLayer.LEVEL_MIN_OFFSETS[level];
        const prevPssibleMaxIceCube = this.possibleMaxIceCube;
        const wallData = this.fixWallData(min, prevPssibleMaxIceCube);
        this.wall = wallData.data;
        this.possibleMaxIceCube = this.countSpace(wallData.data, wallData.topFloor);

        if (wallData.topFloor >= 3 && (this.wall & 0x3) === 0x1 && this.random.generate() < .3) {
            this.wall &= StageLayer.PITFALL_MASK;
        }

        const interval = Math.floor(wallData.topFloor + perSec / 2 + this.random.generate() * (perSec / 2));
        this.interval = Math.max(StageLayer.MIN_INTERVAL, interval);

        const floors = this.findFloor(wallData.data);
        const passableFloors = floors.filter((floor => floor >= prevPssibleMaxIceCube));
        //console.log(`存在するかもしれない氷最大数:${prevPssibleMaxIceCube}, フロア: ${floors}, 必ず通行可能な床: ${passableFloors}`);
        for (let i = 0; i < StageLayer.SNOWFLAKE_INDEX.length; i++) {
            StageLayer.SNOWFLAKE_INDEX[i] = i === 0 ? 1 : 0;
        }
        if (passableFloors.length <= 1) {
            if (floors.length === 2) {
                if (this.random.generate() < .5) {
                    StageLayer.SNOWFLAKE_INDEX[0] = 0;
                }
            } else if (floors.length === 1) {
                this.shuffleSnowflakes();
            }
        } else if (passableFloors.length === 3) {
            this.shuffleSnowflakes();
        } else {
            if (this.random.generate() < .5) {
                StageLayer.SNOWFLAKE_INDEX[0] = 0;
                StageLayer.SNOWFLAKE_INDEX[1] = 1;
            }
        }
    };

    private shuffleSnowflakes = (): void => {
        for (let i = StageLayer.SNOWFLAKE_INDEX.length - 1; i >= 0; i--) {
            const j = Math.floor(this.random.generate() * (i + 1));
            const temp = StageLayer.SNOWFLAKE_INDEX[i];
            StageLayer.SNOWFLAKE_INDEX[i] = StageLayer.SNOWFLAKE_INDEX[j];
            StageLayer.SNOWFLAKE_INDEX[j] = temp;
        }
    };

    /**
     * @param src 壁データのソース
     * @param spaceCount 前回の最上階以下の通路数（通過したかもしれないアイスキューブ数）
     * @returns 壁データと最上階の床の位置
     */
    private fixWallData = (src: number, spaceCount: number): { data: number, topFloor: number } => {
        const newData = Math.floor(this.random.generate() * (0xFF - src)) + src;
        const masked = Math.floor(this.random.generate() * newData) | StageLayer.EDGES_MASK;
        const topFloor = this.findTopFloor(masked);
        // 生成した壁データの最上階が1未満、または前回の壁の通路（スペース）数未満の場合** は壁データを再生成する
        // ** 前回、最上階の通路を通過している可能性が常にあるので、以下を想定し、最善の行動（最低限のアイスキューブしかない状態）
        // ** であっても物理的に通過できないという理不尽な事態を取り除く
        // - 通路を通過したアイスキューブが残っている可能性がある（海落下分は考えない）
        // - ペンギンの位置はアイスキューブ分の高さの可能性がある
        // - 新しく生成した壁データの最上階の通路の高さがペンギンの位置未満だと通過できない
        if (topFloor < 1 || topFloor < spaceCount) {
            return this.fixWallData(src, spaceCount);
        }
        return { data: masked, topFloor: topFloor };
    };

    /**
     * @param src 壁データ
     * @returns 床の最上位ビットを返す。6から0までの範囲。
     * 6 なら0b101... で天井から1つ空けて床があり、0 なら0b...01 で一番下の床のみ。
     */
    private findTopFloor = (src: number): number => {
        // 9bit目は天井なので省略し、床は0b01になっていればいいので6bit右シフトした7bit以下を順次チェック
        const offset = StageLayer.ROW - 3;// 6
        let i = 0;
        while (i < offset) {
            const index = offset - i;
            if (((src >>> index) & 0x3) === 0x1) {
                return index;
            }
            i++;
        }
        return 0;
    };

    /**
     * @param src 壁データ 
     * @returns フロアの位置の配列
     */
    private findFloor = (src: number): number[] => {
        const offset = StageLayer.ROW - 1;
        const floor = [];
        for (let i = 1; i < offset; i++) {
            if (((src >>> i) & 0x3) === 1) floor.push(i);
        }
        return floor;
    };

    /**
     * @param src 壁データ
     * @param topFloor 最上階の床の位置
     * @returns 指定した最上階以下に存在するスペース（存在するかもしれないアイスキューブ）の数
     */
    private countSpace = (src: number, topFloor: number): number => {
        let space = 0;
        for (let i = 1; i < topFloor; i++) {
            if (((src >>> i) & 0x1) === 0) space++;
        }
        return space;
    };

    private appendWall = (x: number, y: number, index: number): Wall => {
        const edgeEnd = this.wallDuration === 1;
        const edgeStart = this.wallDuration === this.startWall;
        const edgeIndex = ((y === 0 && index >= 1) ||
            (y > 0 && y + index < StageLayer.ROW - 1)) && (edgeEnd || edgeStart) ? 1 : 0;
        const wall = new Wall(this.scene, index, edgeIndex);
        wall.moveTo(x * wall.width + wall.width / 2, y * wall.width + wall.height / 2);
        if (edgeEnd) {
            wall.scaleX = -1;
        }
        this.append(wall);
        return wall;
    };

    private appendSnowCovered = (wall: Wall): void => {
        const assetId = this.random.generate() < .5 ? "img_snow_covered_01" : "img_snow_covered_02";
        const snowCovered = new g.Sprite({
            scene: this.scene,
            src: this.scene.asset.getImageById(assetId),
            anchorX: .5,
        });
        snowCovered.moveTo(wall.width / 2, -Entity.SIZE * .05);
        wall.append(snowCovered);
    };

    private appendSnowFlake = (x: number, y: number, assetId: string, score: number): void => {
        const snowFlake = new Snowflake(this.scene, assetId, score);
        snowFlake.moveTo(x, y - Entity.SIZE / 2);
        this._snowflakes.append(snowFlake);
    };

    get snowflakes(): g.E[] { return this._snowflakes.children; }

    get snowflakeCount(): number { return this._snowFlakeCount; }

    get rareSnowflakeCount(): number { return this._rareSnowFlakeCount; }

    set onFinishBonusTime(callback: (isSurprise: boolean) => void) { this._onFinishBonusTime = callback; }

    set onSurprise(callback: () => void) { this._onSurprise = callback; }
}