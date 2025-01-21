import * as tl from "@akashic-extension/akashic-timeline";
import { Button } from "../common/button";
import { MouseButtonHoldRepeater } from "../common/mouseButtonHoldRepeater";
import { Blackout } from "../game_scene/effect/blackout";
import { SnowSmoke } from "../game_scene/effect/snowSmoke";
import { SpawnSmoke } from "../game_scene/effect/spawnSmoke";
import { SpeechBubble } from "../game_scene/effect/speechBubble";
import { IceCube } from "../game_scene/entity/ice_cube";
import { Penguin } from "../game_scene/entity/penguin";
import { StageLayer } from "../game_scene/stage/stageLayer";
import { Wall } from "../game_scene/stage/wall";

export class TitleScene extends g.Scene {

    private _onFinish: (isClicked: boolean, isEasyMode: boolean) => void;
    private timeline: tl.Timeline;
    private tween: tl.Tween;
    private smokeLayer: g.E;
    private backLayer: g.E;
    private penguin: Penguin;
    private iceCubes: g.E;
    private bubble: SpeechBubble;
    private startButton: Button;
    private startEasyModeButton: Button;
    private holdRepeater: MouseButtonHoldRepeater;
    private isClicked = false;
    private isClickedStartButton = false;
    private isClickedStartEasyModeButton = false;

    constructor(private timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "img_blackout", "img_background",
                "img_title_logo", "img_how_to_play", "img_speech_bubble", "img_msg_here_we_go",
                "img_penguin", "img_penguin_beak", "img_penguin_tail", "img_ice_cube", "img_smoke",
                "img_wall", "img_snow_covered_01", "img_snow_covered_02", "img_start_button", "img_easy_mode_button",
            ],
        });

        this.onLoad.add(this.loadHandler);
    }

    private finishScene = (): void => {
        const blackout = new Blackout(this, this);
        blackout.x = g.game.width;

        this.timeline.create(blackout)
            .wait(Blackout.DURATION_TRANSITION)
            .moveX(0, Blackout.DURATION_TRANSITION)
            .call(() => this._onFinish(this.isClicked, this.isClickedStartEasyModeButton));
    };

    private loadHandler = (): void => {
        this.holdRepeater = new MouseButtonHoldRepeater();

        const camera = new g.Camera2D({});
        g.game.focusingCamera = camera;
        g.game.modified();

        this.timeline = new tl.Timeline(this);

        this.append(this.createSprite("img_background", this));
        this.append(this.smokeLayer = new g.E({ scene: this }));
        this.append(this.backLayer = this.createBackLayer());
        this.iceCubes = new g.E({ scene: this, parent: this.backLayer });
        this.iceCubes.children = [];
        this.backLayer.append(this.penguin = this.crteatePenguin());
        this.append(this.createFrontLayer());

        this.onPointDownCapture.add(this.pointDownHandler);
        this.onPointUpCapture.add(this.pointUpHandler)
        this.onUpdate.add(this.updateHandler);
    };

    private pointDownHandler = (event: g.PointDownEvent): void => {
        if (!this.isClicked) {
            this.isClicked = true;
        }
        if (event.target instanceof Button) {
            return;
        }
        if (this.penguin.x - this.penguin.width / 2 < g.game.width) {
            this.spawnIceCube();
        }
        this.holdRepeater.init(true);
    };

    private pointUpHandler = (_event: g.PointUpEvent): void => {
        this.holdRepeater.init(false);
    };

    private spawnIceCube = (): void => {
        if (this.iceCubes.children?.length < 7) {
            const iceCube = new IceCube(this);
            iceCube.moveTo(this.penguin);
            this.iceCubes.append(iceCube);

            new SpawnSmoke(this, iceCube);

            this.penguin.y -= this.penguin.height;
            this.penguin.modified();
            if (this.bubble) {
                if (this.penguin.y < Penguin.SIZE * 2) {
                    if (this.bubble.isUp()) {
                        this.bubble.down();
                    }
                    this.bubble.y = this.penguin.y + this.bubble.height;
                } else {
                    this.bubble.y = this.penguin.y - this.bubble.height;
                }
                this.bubble.modified();
            }
        } else {
            if (!this.tween || this.tween.isFinished()) {
                this.tween = this.timeline.create(this.penguin)
                    .scaleTo(Penguin.DEFAULT_SCALE * 1.2, Penguin.DEFAULT_SCALE * 0.9, 50)
                    .scaleTo(Penguin.DEFAULT_SCALE, Penguin.DEFAULT_SCALE, 50);
            }
        }
    };

    private updateHandler = (): void | boolean => {
        this.penguin.x += this.penguin.velocity.x;
        this.penguin.modified();

        if (this.penguin.x > g.game.width + this.penguin.getWidth() * 2) {
            this.finishScene();
        } else if (!this.isClickedStartButton && !this.isClickedStartEasyModeButton && !this.bubble &&
            this.penguin.x + this.penguin.width * 1.5 > g.game.width) {
            const isUp = this.penguin.y > Penguin.SIZE * 2;
            this.bubble = new SpeechBubble(this, isUp, "img_msg_here_we_go");
            this.bubble.x = this.penguin.x - this.penguin.width;
            this.bubble.y = isUp ? this.penguin.y - this.bubble.height : this.penguin.y + this.bubble.height;
            this.append(this.bubble);

            if (this.startButton.visible()) {
                this.startButton.hide();
            }

            if (this.startEasyModeButton.visible()) {
                this.startEasyModeButton.hide();
            }
        } else if (this.bubble) {
            this.bubble.x = Math.min(this.penguin.x - this.penguin.width, g.game.width - this.bubble.width * .6);
            this.bubble.modified();
        }

        this.iceCubes.children?.forEach(iceCube => {
            iceCube.x = this.penguin.x;
            iceCube.modified();
        });

        if (g.game.age % Math.floor(g.game.fps / Math.min(this.penguin.velocity.x, g.game.fps) * 2) === 0) {
            const y = (StageLayer.ROW - 2) * this.penguin.height + this.penguin.height;
            const pos = { x: this.penguin.x - this.penguin.width / 2, y: y };
            this.smokeLayer.append(new SnowSmoke(this, pos));
        }

        if (this.holdRepeater.canPerformAction()) {
            this.spawnIceCube();
        }

        if (this.isClickedStartButton || this.isClickedStartEasyModeButton) {
            this.penguin.velocity.x *= 1.1;
        }
    };

    private crteatePenguin = (): Penguin => {
        const penguin = new Penguin(this);
        penguin.init();
        penguin.velocity.x = (g.game.width + penguin.getWidth() * 4) / (this.timeLimit * g.game.fps);
        return penguin;
    };

    private createFrontLayer = (): g.E => {
        const layer = new g.E({ scene: this });

        const margin = 16;
        const howToPlay = this.createSprite("img_how_to_play", layer, 0.5, 0);
        const logo = this.createSprite("img_title_logo", layer, 0.5, 0);
        logo.moveTo(g.game.width / 2, 0);
        howToPlay.moveTo(g.game.width / 2, logo.y + logo.height - margin * 1.5);

        const button = new Button(this, "img_start_button");
        const buttonY = howToPlay.y + howToPlay.height - button.height / 2 + margin * 2;
        button.moveTo(g.game.width / 2 + button.width, buttonY);
        button.opacity = 0;
        button.onClick = btn => {
            this.isClickedStartButton = true;
            btn.hide();
            this.startEasyModeButton.hide();
        };

        button.onUpdate.add(() => {
            button.y = buttonY + Math.sin(g.game.age / (g.game.fps * 2) * Math.PI) * margin * .5;
            button.modified();
        });
        layer.append(this.startButton = button);

        this.startEasyModeButton = new Button(this, "img_easy_mode_button");
        this.startEasyModeButton.moveTo(g.game.width / 2 - this.startEasyModeButton.width * 2, buttonY);
        this.startEasyModeButton.opacity = 0;
        this.startEasyModeButton.onClick = btn => {
            this.isClickedStartEasyModeButton = true;
            btn.hide();
            this.startButton.hide();
        };
        this.startEasyModeButton.onUpdate.add(() => {
            this.startEasyModeButton.y = buttonY + Math.sin(g.game.age / (g.game.fps * 2) * Math.PI) * margin * .5;
            this.startEasyModeButton.modified();
        });
        layer.append(this.startEasyModeButton);


        const duration = 500;
        this.timeline.create(logo)
            .moveY(margin, duration, tl.Easing.easeInOutCubic)
            .con()
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        this.timeline.create(howToPlay)
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        this.timeline.create(button)
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        this.timeline.create(this.startEasyModeButton)
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        return layer;
    };

    private createBackLayer = (): g.E => {
        const layer = new g.E({ scene: this });
        for (let i = -1; i < StageLayer.COL; i++) {
            const wall = new Wall(this, 1, 0);
            wall.moveTo(i * wall.width + wall.width / 2, (StageLayer.ROW - 1) * wall.width + wall.height / 2);
            layer.append(wall);

            const assetId = g.game.random.generate() < .5 ? "img_snow_covered_01" : "img_snow_covered_02";
            const snowCovered = new g.Sprite({
                scene: this,
                src: this.asset.getImageById(assetId),
                anchorX: .5,
            });
            snowCovered.moveTo(wall.width / 2, -Penguin.SIZE * .05);
            wall.append(snowCovered);
        }
        return layer;
    };

    private createSprite = (assetId: string, parent: g.Scene | g.E, anchorX = 0, opacity = 1): g.Sprite => {
        return new g.Sprite({
            scene: this,
            src: this.asset.getImageById(assetId),
            parent: parent,
            anchorX: anchorX,
            opacity: opacity,
        });
    }

    set onFinish(callback: (isClicked: boolean, isEasyMode: boolean) => void) { this._onFinish = callback }
}