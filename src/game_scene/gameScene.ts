import * as tl from "@akashic-extension/akashic-timeline";
import { AudioController } from "../common/audioController";
import { Collision } from "../common/collision";
import { CountdownTimer } from "../common/countdownTimer";
import { MouseButtonHoldRepeater } from "../common/mouseButtonHoldRepeater";
import { GameMainParameterObject } from "../parameterObject";
import { Blackout } from "./effect/blackout";
import { Clouds } from "./effect/cloud";
import { Crush } from "./effect/crush";
import { DriftIce } from "./effect/driftIce";
import { PopupScore } from "./effect/popupScore";
import { SnowLayer } from "./effect/snowLayer";
import { SnowSmoke } from "./effect/snowSmoke";
import { SpawnSmoke } from "./effect/spawnSmoke";
import { SpeechBubble } from "./effect/speechBubble";
import { Splash } from "./effect/splash";
import { SplashFragments } from "./effect/splashFragments";
import { IceCube } from "./entity/ice_cube";
import { Penguin } from "./entity/penguin";
import { ScoreLabel } from "./hud/scoreLabel";
import { Speedometer } from "./hud/speedometer";
import { TimeLabel } from "./hud/timeLabel";
import { SpeedController } from "./speedController";
import { SnowFlake } from "./stage/snowFlake";
import { StageLayer } from "./stage/stageLayer";
import { Wall } from "./stage/wall";

const Music = {
    BGM: "bgm_nc366054",
} as const;

const Sounds = {
    SPAWN_ICE_CUBE: "se_spawn_ice_cube",
    OBTAIN: "se_obtain",
    SPLASH: "se_splash",
    CRUSH: "se_crush",
    HITTING_HEAD: "se_hitting_head",
} as const;

export class GameScene extends g.Scene {

    private static readonly SMOKE_INTERVAL = Math.floor(g.game.fps / 30 * 6);
    private static readonly FAILED_INTERVAL_TIME = 2000;

    private timeline: tl.Timeline;
    private hitTween: tl.Tween;
    private speechBubbleTween: tl.Tween;
    private camera: g.Camera2D;
    private penguin: Penguin;
    private iceCubes: g.E;
    private speedController: SpeedController;
    private backgroundLayer: g.E;
    private clouds: Clouds;
    private driftIces: g.E;
    private stageLayer: StageLayer;
    private effectBackLayer: g.E;
    private effectMiddleLayer: g.E;
    private effectFrontLayer: g.E;
    private curtainLayer: g.E;
    private countdownTimer: CountdownTimer;
    private hudLayer: g.E;
    private scoreLabel: ScoreLabel;
    private timeLabel: TimeLabel;
    private speedometer: Speedometer;
    private bitmapFont: g.BitmapFont;
    private audioController: AudioController;
    private holdRepeater: MouseButtonHoldRepeater;
    private pauseMessage: g.Sprite;
    private blackout: g.Sprite;
    private context: g.AudioPlayContext;
    private isPauseGame = false;

    constructor(private param: GameMainParameterObject, private isClicked: boolean, private timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "img_background", "img_distant_star", "img_moon",
                "img_penguin", "img_penguin_beak", "img_penguin_tail",
                "img_ice_cube", "img_smoke",
                "img_snowflake_01", "img_snowflake_02", "img_snowflake_03", "img_snowflake_04", "img_snowflake_05",
                "img_wall", "img_snow_covered_01", "img_snow_covered_02",
                "img_crush", "img_splash", "img_speedometer", "img_speedometer_needle", "img_cloud", "img_drift_ice",
                "img_blackout", "img_start", "img_finish", "img_snow", "img_pause_message",
                "img_speech_bubble", "img_msg_superb", "img_msg_excellent", "img_msg_nice", "img_msg_good", "img_msg_thanks",
                "img_font", "font_glyphs",
                "se_splash", "se_spawn_ice_cube", "se_obtain", "se_crush", "se_hitting_head", Music.BGM,
            ],
        });

        this.onLoad.add(this.loadHandler);
    }

    private loadHandler = (): void => {
        this.holdRepeater = new MouseButtonHoldRepeater();
        this.speedController = new SpeedController();

        this.audioController = new AudioController(0.2, 0.1);
        const sounds = [
            { assetId: Sounds.SPLASH },
            { assetId: Sounds.SPAWN_ICE_CUBE },
            { assetId: Sounds.OBTAIN },
            { assetId: Sounds.CRUSH },
            { assetId: Sounds.HITTING_HEAD },
        ];
        this.audioController.addSE(this.asset, sounds);
        this.audioController.addMusic(this.asset, [{ assetId: Music.BGM }]);

        // const musicAudioSystem = new g.MusicAudioSystem({
        //     id: Music.BGM,
        //     // volume: 0.2,
        //     resourceFactory: g.game.resourceFactory,
        // });
        // this.context = new g.AudioPlayContext({
        //     id: Music.BGM,
        //     resourceFactory: g.game.resourceFactory,
        //     system: musicAudioSystem,
        //     systemId: Music.BGM,
        //     asset: this.asset.getAudioById(Music.BGM),
        //     volume: 0.2,
        // })
        // this.context.play();
        //g.AudioUtil.fadeOut(g.game, context, 5);

        this.camera = new g.Camera2D({});
        g.game.focusingCamera = this.camera;
        g.game.modified();

        this.timeline = new tl.Timeline(this);

        this.bitmapFont = new g.BitmapFont({
            src: this.asset.getImageById("img_font"),
            glyphInfo: this.asset.getJSONContentById("font_glyphs"),
        });

        this.backgroundLayer = this.createBackgroungLayer();

        this.effectBackLayer = new g.E({ scene: this, parent: this });
        this.effectBackLayer.children = [];

        this.stageLayer = new StageLayer(this, this.param.random);
        this.append(this.stageLayer);

        this.iceCubes = new g.E({ scene: this, parent: this });
        this.iceCubes.children = [];

        this.effectMiddleLayer = new g.E({ scene: this, parent: this });
        this.effectMiddleLayer.children = [];

        this.penguin = new Penguin(this)
        this.append(this.penguin);

        this.effectFrontLayer = new g.E({ scene: this, parent: this });
        this.effectFrontLayer.children = [];

        this.hudLayer = this.createHudLayer();

        this.startGame();
    };

    private pointDownHandler = (_event: g.PointDownEvent): void => {
        if (!this.isClicked) {
            this.isClicked = true;
            if (this.destroyPauseMessageIfExists()) return;
        }
        if (this.penguin.isMissed()) return;

        this.spawnIceCubeIfNoObstacles();
        this.holdRepeater.init(true);
    };

    private spawnIceCubeIfNoObstacles = (): void => {
        if (!this.collideWall(this.penguin, { x: 0, y: -this.penguin.height }) && !(this.penguin.y - this.penguin.height < 0)) {
            this.audioController.playSE(Sounds.SPAWN_ICE_CUBE);

            const bottom = this.collideBottom(this.penguin, this.penguin.height);
            const y = bottom ? bottom.y - bottom.height / 2 - 1 : this.penguin.y + this.penguin.height / 2 - 1;

            const iceCube = new IceCube(this);
            iceCube.moveTo({ x: this.penguin.x, y: y });
            this.iceCubes.append(iceCube);
            new SpawnSmoke(this, iceCube);

            this.penguin.onGround(iceCube);
            this.penguin.modified();
        } else {
            if (!this.hitTween || this.hitTween.isFinished()) {
                this.audioController.playSE(Sounds.HITTING_HEAD);
                this.hitTween = this.timeline.create(this.penguin)
                    .scaleTo(Penguin.DEFAULT_SCALE * 1.2, Penguin.DEFAULT_SCALE * 0.9, 50)
                    .scaleTo(Penguin.DEFAULT_SCALE, Penguin.DEFAULT_SCALE, 50);
            }
        }
    };

    private pointUpHandler = (_event: g.PointUpEvent): void => {
        if (this.penguin.isMissed()) return;
        this.holdRepeater.init(false);
    };

    private startGame = (): void => {
        const blackout = new Blackout(this, this);
        blackout.x = (g.game.width - blackout.width) / 2;

        this.timeline.create(blackout)
            .call(() => this.initGame())
            .wait(Blackout.DURATION_TRANSITION)
            .moveX(-blackout.width, Blackout.DURATION_TRANSITION)
            .call(() => {
                blackout.destroy();
                this.showStart();
            });
    };

    private showStart = (): void => {
        const start = new g.Sprite({
            scene: this,
            parent: this,
            src: this.asset.getImageById("img_start"),
            anchorX: .5,
            anchorY: .5,
            opacity: 0,
        });
        start.x = g.game.width + start.width / 2;
        start.y = g.game.height / 2;

        const wait = 700;
        const duration = 1000 - wait;
        this.timeline.create(start)
            .moveX(g.game.width / 2, duration, tl.Easing.easeOutQuint)
            .con()
            .fadeIn(duration, tl.Easing.easeOutQuint)
            .wait(wait)
            .con()
            .call(() => this.audioController.playMusic(Music.BGM))
            .moveX(-start.width / 2, duration, tl.Easing.easeInQuint)
            .con()
            .fadeOut(duration, tl.Easing.easeInQuint)
            .con()
            .call(() => {
                this.onUpdate.add(this.updateHandler);
                this.onPointDownCapture.add(this.pointDownHandler);
                this.onPointUpCapture.add(this.pointUpHandler);
            });
    };

    private initGame = (): void => {
        this.moveCamera(0);
        this.speedController.init();
        this.speedometer.init();
        this.penguin.init();
        this.stageLayer.init();
        this.clouds.init();
        this.holdRepeater.init(false);

        const clearChildren = (e: g.E): void => {
            const children = e.children;
            for (let i = children.length - 1; i >= 0; i--) {
                const entity = children[i];
                if (entity instanceof g.Sprite) {
                    entity.destroy(true);
                } else {
                    entity.destroy();
                }
            }
        };
        clearChildren(this.iceCubes);
        clearChildren(this.effectFrontLayer);
        clearChildren(this.effectMiddleLayer);
        clearChildren(this.effectBackLayer);
        clearChildren(this.driftIces);
    };

    private finishGame = (): void => {
        if (this.blackout) return;

        this.stageLayer.finish();
        const duration = 500;
        if (!this.speechBubbleTween) {
            this.destroyPauseMessageIfExists();

            const collectedSnowFlakeCount = Math.floor(g.Util.clamp(this.penguin.collectedSnowFlake / 2, 8, 64));
            const snowLayer = new SnowLayer(this, collectedSnowFlakeCount);
            this.hudLayer.append(snowLayer);

            const bubble = this.createSpeechBubble();
            this.speechBubbleTween = this.createSpeechBubbleTimeline(bubble, duration);
            this.penguin.append(bubble);

            const finish = new g.Sprite({
                scene: this,
                parent: this.hudLayer,
                src: this.asset.getImageById("img_finish"),
                anchorX: .5,
                anchorY: .5,
                opacity: 0,
            });
            finish.x = g.game.width / 2;
            finish.y = g.game.height / 2 - finish.height * .2;

            this.timeline.create(finish)
                .moveY(g.game.height / 2, duration, tl.Easing.easeOutQuint)
                .con()
                .fadeIn(duration, tl.Easing.easeOutQuint)
                .call(() => {
                    let step = 0;
                    finish.onUpdate.add(() => {
                        finish.y = g.game.height / 2 + Math.sin(step++ / g.game.fps * Math.PI) * finish.height * .05;
                        finish.modified();
                    });
                });
        } else {
            const bubbles = this.penguin.children.filter(e => e instanceof SpeechBubble);
            if (bubbles && bubbles.length > 0) {
                this.speechBubbleTween = this.createSpeechBubbleTimeline(bubbles[0], duration);
            }
        }
    };

    private createSpeechBubble = (): SpeechBubble => {
        const assetId = this.calcResultMessage();
        this.penguin.modified();
        const isUp = this.penguin.y > Penguin.SIZE * 2;
        const bubble = new SpeechBubble(this, isUp, assetId);
        bubble.opacity = 0;
        bubble.x = -this.penguin.width / 2;
        bubble.y = this.penguin.height * (isUp ? -0.5 : 1.25);
        if (isUp) {
            bubble.onUpdate.add(() => {
                if (this.penguin.y <= Penguin.SIZE * 2) {
                    bubble.down();
                    bubble.y = this.penguin.height * 1.25;
                    bubble.modified();
                    return true;
                }
            })
        }
        return bubble;
    };

    private createSpeechBubbleTimeline = (bubble: g.E, duration: number): tl.Tween =>
        this.timeline.create(bubble)
            .wait(duration * 3)
            .fadeIn(duration, tl.Easing.easeOutQuint)
            .wait(duration * 8)
            .call(() => {
                bubble.destroy();

                const totalTimeLimit = this.param.sessionParameter?.totalTimeLimit ?? 80;
                const elapsedSec = Math.ceil(g.game.age / g.game.fps) + 1;
                const duration = (totalTimeLimit - elapsedSec) * 1000;
                this.audioController.fadeOut(Music.BGM, duration);
                this.runAwayPenguin();
            });

    private calcResultMessage = () => {
        const collectRate = this.penguin.collectedSnowFlake / (this.stageLayer.snowFlakeCount + 1);
        // console.log(`no miss: ${this.penguin.isNoMiss()}` +
        //     ` ,collectRate: ${collectRate}` +
        //     ` ,collected: ${this.penguin.collectedSnowFlake}` +
        //     ` ,count: ${this.stageLayer.snowFlakeCount}`);

        if (this.penguin.isNoMiss()) {
            if (collectRate >= 1.0) return "img_msg_superb";
            else if (collectRate >= 0.9) return "img_msg_excellent";
            else if (collectRate >= 0.8) return "img_msg_nice";
            else if (collectRate >= 0.7) return "img_msg_good";
        }
        if (collectRate >= 1.0) return "img_msg_excellent";
        else if (collectRate >= 0.9) return "img_msg_nice";
        else if (collectRate >= 0.8) return "img_msg_good";
        return "img_msg_thanks";
    };

    private runAwayPenguin = (): void => {
        this.onUpdate.remove(this.updateHandler);
        this.onPointDownCapture.remove(this.pointDownHandler);
        this.onPointUpCapture.remove(this.pointUpHandler);
        this.holdRepeater.init(false);

        this.onUpdate.add(() => {
            this.speedController.update();
            const speedRate = this.speedController.getSpeedRate();
            const velocity = this.speedController.getVelocity();
            this.speedometer.value = this.speedController.getSpeedRate();
            let needSnowSmoke = false;

            for (let i = 0; i < velocity.x; i++) {
                if (this.penguin.x - this.penguin.getWidth() < this.camera.x + g.game.width) {
                    this.penguin.x += 1;
                    this.penguin.modified();

                    if (!needSnowSmoke && (this.collideBottom(this.penguin, 1) instanceof Wall)) {
                        needSnowSmoke = true;
                        this.createSnowSmoke(this.penguin, speedRate);
                    }
                }

                for (const iceCube of this.iceCubes.children) {
                    if (!(iceCube instanceof IceCube) || !iceCube) continue;
                    if (iceCube.x - iceCube.getWidth() / 2 < this.camera.x + g.game.width) {
                        iceCube.x += 1;
                        iceCube.modified();

                        if (!needSnowSmoke && (this.collideBottom(iceCube, 1) instanceof Wall)) {
                            needSnowSmoke = true;
                            this.createSnowSmoke(iceCube, speedRate);
                        }
                    }
                }
            }
            this.updateBackgroung();
        });
    };

    private updateHandler = (): void | boolean => {
        this.countdownTimer.update();
        if (this.isPauseGame) return;

        this.speedController.update();
        const speedRate = this.speedController.getSpeedRate();
        const velocity = this.speedController.getVelocity();

        if (this.penguin.isMissed()) {
            this.speedometer.decay();
        } else {
            this.speedometer.value = speedRate;
        }

        this.updateStage(speedRate);

        if (this.holdRepeater.canPerformAction()) {
            this.spawnIceCubeIfNoObstacles();
        }

        this.updatePenguin(velocity, speedRate);
        this.updateIceCubes(velocity, speedRate);

        if (this.camera.x < this.penguin.offsetX()) {
            this.moveCamera(this.penguin.offsetX());
        }

        this.updateBackgroung();
    };

    private updateStage = (speedRate: number): void => {
        if (this.stageLayer.needNextWall(this.camera.x)) {
            const remainingTime = this.countdownTimer.remainingTime;
            const levelRate = 1 - remainingTime / this.timeLimit;
            const perSec = this.speedController.getPerSec();
            this.stageLayer.create(levelRate, speedRate, remainingTime, perSec);
        }
    };

    private moveCamera = (cameraX: number): void => {
        this.camera.x = cameraX;

        this.backgroundLayer.x = cameraX;
        this.backgroundLayer.modified();

        this.hudLayer.x = cameraX;
        this.hudLayer.modified();
    };

    private updatePenguin = (velocity: g.CommonOffset, speedRate: number): void => {
        if (!this.penguin.isMissed()) {
            const vy = velocity.y * (this.speedController.getInitVx() / velocity.x) * this.penguin.velocity.y;
            let needSnowSmoke = false;
            let bottom = undefined;
            for (let i = 0; i < velocity.x; i++) {
                bottom = this.collideBottom(this.penguin, vy);
                if (bottom) {
                    this.penguin.onGround(bottom);
                } else {
                    this.penguin.y += vy;
                }

                const front = this.collideFront(this.penguin);
                if (front instanceof Wall) {
                    if (!this.penguin.isMissed()) {
                        this.crushWall(front, speedRate);
                        break;
                    }
                } else if (front instanceof IceCube) {
                    this.penguin.x = front.x - front.width / 2 - this.penguin.width / 2;
                    break;
                } else {
                    this.penguin.x += 1;
                    if (!needSnowSmoke && (bottom instanceof Wall)) {
                        needSnowSmoke = true;
                        this.createSnowSmoke(this.penguin, speedRate);
                    }

                    for (const snowflake of this.stageLayer.snowflakes) {
                        if (Math.abs(this.penguin.x - snowflake.x) > this.penguin.width) continue;

                        if (Collision.intersect(this.penguin, { x: 0, y: 0 }, snowflake)) {
                            if (snowflake instanceof SnowFlake && !snowflake.isObtained) {
                                this.audioController.playSE(Sounds.OBTAIN);
                                snowflake.obtain();
                                this.penguin.obtainSnowFlake();
                                this.scoreLabel.addScore(snowflake.score);
                                new SplashFragments(this, this.effectMiddleLayer, snowflake);

                                const pos = { x: this.scoreLabel.x + this.scoreLabel.width, y: this.scoreLabel.y + this.scoreLabel.height * .4 };
                                // const pos = { x: snowflake.x  , y: snowflake.y };
                                const popupScore = new PopupScore(this, this.bitmapFont, snowflake.score);
                                popupScore.x = this.scoreLabel.x + this.scoreLabel.width - popupScore.width;
                                popupScore.y = this.scoreLabel.y + this.scoreLabel.height;
                                this.hudLayer.append(popupScore);
                                break;
                            }
                        }
                    }
                }
            }
            if (!bottom) {
                this.penguin.falling();
            }
        } else {
            if (this.penguin.isCrushed && this.penguin.x + this.penguin.width > this.camera.x) {
                if (!this.penguin.isFalling()) {
                    this.penguin.x += this.penguin.velocity.x;
                    const angle = speedRate * 20;
                    this.penguin.angle -= angle;
                }
                this.penguin.y += this.penguin.velocity.y;
                this.penguin.velocity.y += 1;

                const bottom = this.collideBottom(this.penguin, this.penguin.velocity.y);
                if (bottom && bottom.y - bottom.height / 2 > 0) {
                    this.penguin.y = bottom.y - bottom.height / 2 - this.penguin.height / 2;
                    if (Math.abs(this.penguin.velocity.y) < this.penguin.height * .1) {
                        this.penguin.velocity.y = 0;
                    } else {
                        this.audioController.playSE(Sounds.CRUSH);
                        this.penguin.velocity.x *= 0.9;
                        this.penguin.velocity.y *= -0.75;
                        this.penguin.angle *= 0.9;
                    }
                }
            }
        }

        if (this.penguin.y - this.penguin.height / 2 > g.game.height) {
            if (!this.penguin.isFalled) {
                this.fallSea();
            }
        }
        this.penguin.modified();
    };

    private updateIceCubes = (velocity: g.CommonOffset, speedRate: number): void => {
        for (const iceCube of this.iceCubes.children) {
            if (!(iceCube instanceof IceCube)) return;
            this.updateIceCube(iceCube, velocity, speedRate);
        }
    };

    private updateIceCube = (iceCube: IceCube, velocity: g.CommonOffset, speedRate: number): void => {
        const vy = velocity.y * (this.speedController.getInitVx() / velocity.x) * iceCube.velocity.y;
        let needSnowSmoke = false;
        let bottom = undefined;
        for (let i = 0; i < velocity.x; i++) {

            bottom = this.collideBottom(iceCube, vy);
            if (bottom) {
                iceCube.onGround(bottom);
            } else {
                iceCube.y += vy;
                if (!iceCube.isFall && iceCube.y > g.game.height) {
                    iceCube.fall();
                    this.appendSplash(iceCube.x);
                }
            }

            const front = this.collideFront(iceCube);
            if (front) {
                iceCube.x = front.x - front.width / 2 - iceCube.width / 2;
            } else {
                iceCube.x += 1;
                if (!needSnowSmoke && (bottom instanceof Wall)) {
                    needSnowSmoke = true;
                    this.createSnowSmoke(iceCube, speedRate);
                }
            }
        }
        if (!bottom) {
            iceCube.falling();
        }
        iceCube.modified();
    };

    private collideBottom = (src: g.E, vy: number): g.E | undefined => {
        for (const iceCube of this.iceCubes.children) {
            if (iceCube === src || Math.abs(iceCube.x - src.x) > src.width) continue;

            if (src.y < iceCube.y && Collision.intersect(src, { x: 0, y: vy }, iceCube)) {
                return iceCube;
            }
        }
        for (const wall of this.stageLayer.children) {
            if (Math.abs(wall.x - src.x) > src.width) continue;

            if (src.y - src.height / 2 < wall.y - wall.height / 2 &&
                Collision.intersect(src, { x: 0, y: vy }, wall)) {
                return wall;
            }
        }
        return undefined;
    };

    private collideFront = (src: g.E): g.E | undefined => {
        const vx = 1;
        for (const iceCube of this.iceCubes.children) {
            if (iceCube === src || Math.abs(iceCube.x - src.x) > src.width) continue;

            if (src.x < iceCube.x &&
                Math.abs(iceCube.y - src.y) < src.height &&
                Collision.intersect(src, { x: vx, y: 0 }, iceCube)) {
                return iceCube;
            }
        }
        for (const wall of this.stageLayer.children) {
            if (Math.abs(wall.x - src.x) > src.width) continue;

            if (src.x < wall.x &&
                src.y - src.height / 2 < wall.y + wall.height / 2 &&
                src.y + src.height / 2 > wall.y - wall.height / 2 &&
                Collision.intersect(src, { x: vx, y: 0 }, wall)) {
                return wall;
            }
        }
        return undefined;
    };

    /** 
    * @param src 衝突判定オブジェクト
    * @param velocity 移動量
    * @returns 衝突していれば Wall オブジェクト、そうでなければ undefined
    */
    private collideWall = (src: g.E, velocity: g.CommonOffset): g.E | undefined => {
        for (const wall of this.stageLayer.children) {
            if (Math.abs(wall.x - src.x) > src.width) continue;

            if (Collision.intersect(src, { x: velocity.x, y: velocity.y }, wall)) {
                return wall;
            }
        }
        return undefined;
    };

    private createSnowSmoke = (target: g.E, speedRate: number) => {
        const interval = GameScene.SMOKE_INTERVAL - Math.floor(speedRate * 3);
        if (g.game.age % interval === 0) {
            const pos = { x: target.x - target.width / 2, y: target.y + target.height / 2 };
            this.effectBackLayer.append(new SnowSmoke(this, pos));
        }
    };

    private crushWall = (wall: g.E, speedRate: number): void => {
        this.holdRepeater.init(false);

        if (this.isClicked) {
            this.audioController.playSE(Sounds.CRUSH);
        }
        this.penguin.crushed(speedRate);
        this.penguin.x = wall.x - wall.width / 2 - this.penguin.width / 2;

        const crush = new Crush(this, this.penguin.x + this.penguin.width / 2, this.penguin.y);
        this.effectFrontLayer.append(crush);
        this.retryGame();
    };

    private fallSea = (): void => {
        this.holdRepeater.init(false);

        this.appendSplash(this.penguin.x);
        this.penguin.falled();
        if (!this.penguin.isCrushed) {
            this.retryGame()
        }
    };

    private appendSplash = (x: number): void => {
        if (this.isClicked && x > this.camera.x && x < this.camera.x + g.game.width) {
            this.audioController.playSE(Sounds.SPLASH);
        }
        new Splash(this, this.effectBackLayer, x);
    };

    private updateBackgroung = (): void => {
        if (g.game.age % (g.game.fps * 3) === 0 && g.game.random.generate() < .2) {
            this.driftIces.append(new DriftIce(this));
        }
    };

    private retryGame = (): void => {
        if (this.speechBubbleTween && !this.speechBubbleTween.isFinished()) {
            this.speechBubbleTween.cancel(true);
        }

        this.blackout = new Blackout(this, this.curtainLayer);
        this.blackout.x = g.game.width;

        this.timeline.create(this.blackout)
            .wait(GameScene.FAILED_INTERVAL_TIME)
            .moveX((g.game.width - this.blackout.width) / 2, Blackout.DURATION_TRANSITION)
            .call(() => {
                this.isPauseGame = true;
                this.initGame();
            })
            .wait(Blackout.DURATION_WAIT * (this.speechBubbleTween ? .1 : 1))
            .moveX(-this.blackout.width, Blackout.DURATION_TRANSITION)
            .call(() => {
                this.blackout.destroy();
                this.blackout = undefined;

                if (this.countdownTimer.isFinish()) {
                    this.finishGame();
                } else {
                    if (!this.isClicked) {
                        this.showPuaseGameMessage();
                        return;
                    }
                }
                this.isPauseGame = false;
            });
    };

    private showPuaseGameMessage = (): void => {
        this.pauseMessage = new g.Sprite({
            scene: this,
            parent: this.hudLayer,
            src: this.asset.getImageById("img_pause_message"),
            x: g.game.width / 2,
            y: g.game.height / 2,
            anchorX: .5,
            anchorY: .5,
        });
    };

    private destroyPauseMessageIfExists = (): boolean => {
        if (this.pauseMessage && !this.pauseMessage.destroyed()) {
            this.pauseMessage.destroy();
            this.pauseMessage = undefined;
            this.isPauseGame = false;
            return true;
        }
        return false;
    };

    private createHudLayer = (): g.E => {
        this.countdownTimer = new CountdownTimer(this.timeLimit);
        this.countdownTimer.onTick = remainingSec => this.timeLabel.setTime(remainingSec);
        this.countdownTimer.onFinish = () => this.finishGame();

        const layer = new g.E({ scene: this, parent: this });
        this.curtainLayer = new g.E({ scene: this, parent: layer });

        const fontSize = 40;
        this.scoreLabel = new ScoreLabel(this, this.bitmapFont, fontSize);
        this.scoreLabel.x = fontSize / 2;
        this.scoreLabel.y = fontSize / 2;

        this.timeLabel = new TimeLabel(this, this.bitmapFont, fontSize, this.timeLimit);
        this.timeLabel.x = g.game.width - this.timeLabel.width - fontSize / 2;
        this.timeLabel.y = fontSize / 2;

        this.speedometer = new Speedometer(this);
        this.speedometer.x = g.game.width / 2;
        this.speedometer.y = this.speedometer.height / 2;

        layer.append(this.scoreLabel);
        layer.append(this.timeLabel);
        layer.append(this.speedometer);
        return layer;
    };

    private createBackgroungLayer = (): g.E => {
        const layer = new g.E({ scene: this, parent: this });

        const backgroung = new g.Sprite({
            scene: this,
            parent: layer,
            src: this.asset.getImageById("img_background"),
        });

        const starCount = 8;
        const starAsset = this.asset.getImageById("img_distant_star");
        const w = (backgroung.width - starAsset.width * 2) / starCount;
        const h = (backgroung.height * .4 - starAsset.height * 2) / 2;
        for (let i = 0; i < 8; i++) {
            const star = new g.Sprite({
                scene: this,
                src: starAsset,
            });
            star.x = this.param.random.generate() * w + (w * i) + star.width;
            star.y = this.param.random.generate() * h + (h * Math.floor(i % 2)) + Penguin.SIZE;
            backgroung.append(star);
        }

        const moon = new g.Sprite({
            scene: this,
            parent: layer,
            src: this.asset.getImageById("img_moon"),
            anchorX: .5,
            anchorY: .5,
        });
        moon.x = backgroung.width / 2 + moon.width * 2;
        moon.y = moon.height * .5;
        backgroung.append(moon);

        this.clouds = new Clouds(this, layer);

        this.driftIces = new g.E({ scene: this, parent: layer });
        this.driftIces.children = [];
        // const sea = new g.FilledRect({
        //     scene: this,
        //     parent: layer,
        //     width: g.game.width,
        //     height: 200,
        //     cssColor: "#4f8fe9ff",
        // });
        // sea.y = g.game.height - sea.height;

        return layer;
    };
}