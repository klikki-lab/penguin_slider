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

export interface TitleSceneParams {
    isClicked: boolean;
    isNormalMode: boolean;
    isEasyMode: boolean;
    is2024WinterMode: boolean;
};

export class TitleScene extends g.Scene {

    private _onFinish: (params: TitleSceneParams) => void;
    private timeline: tl.Timeline;
    private tween: tl.Tween;
    private smokeLayer: g.E;
    private backLayer: g.E;
    private penguin: Penguin;
    private iceCubes: g.E;
    private bubble: SpeechBubble;
    private frontLayer: g.E;
    private holdRepeater: MouseButtonHoldRepeater;
    private prevX = 0;
    private isClicked = false;
    private isClickedStartButton = false;
    private isClickedEasyModeButton = false;
    private isClickedImpl2024WinterButton = false;

    constructor(private timeLimit: number) {
        super({
            game: g.game,
            assetIds: [
                "img_blackout", "img_background", "img_background_sea",
                "img_title_logo", "img_how_to_play", "img_speech_bubble", "img_msg_here_we_go",
                "img_penguin", "img_penguin_beak", "img_penguin_tail", "img_ice_cube", "img_smoke",
                "img_wall", "img_snow_covered_01", "img_snow_covered_02",
                "img_start_button", "img_easy_mode_button", "img_button_2024_winter_ver",
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
            .call(() => {
                this._onFinish({
                    isClicked: this.isClicked,
                    isNormalMode: this.isClickedStartButton,
                    isEasyMode: this.isClickedEasyModeButton,
                    is2024WinterMode: this.isClickedImpl2024WinterButton,
                })
            });
    };

    private loadHandler = (): void => {
        this.holdRepeater = new MouseButtonHoldRepeater();

        const camera = new g.Camera2D({});
        g.game.focusingCamera = camera;
        g.game.modified();

        this.timeline = new tl.Timeline(this);

        this.append(this.createSprite("img_background", this));
        const sea = this.createSprite("img_background_sea", this);
        sea.y = g.game.height - sea.height;
        this.append(sea);
        this.append(this.smokeLayer = new g.E({ scene: this }));
        this.append(this.backLayer = this.createBackLayer());
        this.iceCubes = new g.E({ scene: this, parent: this.backLayer });
        this.iceCubes.children = [];
        this.backLayer.append(this.penguin = this.crteatePenguin());
        this.append(this.frontLayer = this.createFrontLayer());

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
        } else if (!this.isClickedStartButton && !this.isClickedEasyModeButton && !this.isClickedImpl2024WinterButton &&
            !this.bubble && this.penguin.x + this.penguin.width * 1.5 > g.game.width) {
            const isUp = this.penguin.y > Penguin.SIZE * 2;
            this.bubble = new SpeechBubble(this, isUp);
            this.bubble.addMessage("img_msg_here_we_go");
            this.bubble.x = this.penguin.x - this.penguin.width;
            this.bubble.y = isUp ? this.penguin.y - this.bubble.height : this.penguin.y + this.bubble.height;
            this.append(this.bubble);

            this.hideButtonAll();
        } else if (this.bubble) {
            this.bubble.x = Math.min(this.penguin.x - this.penguin.width, g.game.width - this.bubble.width * .6);
            this.bubble.modified();
        }

        this.iceCubes.children?.forEach(iceCube => {
            iceCube.x = this.penguin.x;
            iceCube.modified();
        });

        if (this.penguin.x > this.prevX + this.penguin.width / 2) {
            const y = (StageLayer.ROW - 2) * this.penguin.height + this.penguin.height;
            const pos = { x: this.penguin.x - this.penguin.width / 2, y: y };
            this.smokeLayer.append(new SnowSmoke(this, pos));
            this.prevX = this.penguin.x;
        }

        if (this.holdRepeater.canPerformAction()) {
            this.spawnIceCube();
        }

        if (this.isClickedStartButton || this.isClickedEasyModeButton || this.isClickedImpl2024WinterButton) {
            this.penguin.velocity.x *= 1.1;
        }
    };

    private crteatePenguin = (): Penguin => {
        const penguin = new Penguin(this);
        penguin.init();
        penguin.velocity.x = (g.game.width + penguin.getWidth() * 4) / (this.timeLimit * g.game.fps);
        this.prevX = penguin.x;
        return penguin;
    };

    private createFrontLayer = (): g.E => {
        const layer = new g.E({ scene: this });

        const margin = 16;
        const howToPlay = this.createSprite("img_how_to_play", layer, 0.5, 0);
        const logo = this.createSprite("img_title_logo", layer, 0.5, 0);
        logo.moveTo(g.game.width / 2, 0);
        howToPlay.moveTo(g.game.width / 2, logo.y + logo.height - margin * 1.5);

        const startButton = new Button(this, "img_start_button");
        const buttonY = howToPlay.y + howToPlay.height - startButton.height / 2 + margin * 2;
        startButton.moveTo(g.game.width / 2 + startButton.width, buttonY);
        startButton.opacity = 0;
        startButton.onClick = _ => {
            this.isClickedStartButton = true;
            this.hideButtonAll();
        };

        startButton.onUpdate.add(() => {
            startButton.y = buttonY + Math.sin(g.game.age / (g.game.fps * 2) * Math.PI) * margin * .5;
            startButton.modified();
        });
        layer.append(startButton);

        const impl2024WinterButton = new Button(this, "img_button_2024_winter_ver");
        impl2024WinterButton.scale(.75);
        const impl2024WinterButtonY = startButton.y + startButton.height / 2 - impl2024WinterButton.height * impl2024WinterButton.scaleY / 2;
        impl2024WinterButton.moveTo(impl2024WinterButton.width * impl2024WinterButton.scaleX * .5, impl2024WinterButtonY);
        impl2024WinterButton.opacity = 0;
        impl2024WinterButton.onClick = _ => {
            this.isClickedImpl2024WinterButton = true;
            this.hideButtonAll();
        };
        impl2024WinterButton.onUpdate.add(() => {
            impl2024WinterButton.y = impl2024WinterButtonY + Math.sin(g.game.age / (g.game.fps * 4) * Math.PI) * margin * .5;
            impl2024WinterButton.modified();
        });
        layer.append(impl2024WinterButton);

        const easyModeButton = new Button(this, "img_easy_mode_button");
        // easyModeButton.scale(.75);
        const easyModeButtonX = startButton.x - easyModeButton.width * easyModeButton.scaleX * 1.25;
        const easyModeButtonY = startButton.y + startButton.height / 2 - easyModeButton.height * easyModeButton.scaleY / 2;
        easyModeButton.moveTo(easyModeButtonX, easyModeButtonY);
        easyModeButton.opacity = 0;
        easyModeButton.onClick = _ => {
            this.isClickedEasyModeButton = true;
            this.hideButtonAll();
        };
        easyModeButton.onUpdate.add(() => {
            easyModeButton.y = easyModeButtonY + Math.sin(g.game.age / (g.game.fps * 3) * Math.PI) * margin * .5;
            easyModeButton.modified();
        });
        layer.append(easyModeButton);

        const duration = 500;
        this.timeline.create(logo)
            .moveY(margin, duration, tl.Easing.easeInOutCubic)
            .con()
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        this.timeline.create(howToPlay)
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        this.timeline.create(startButton)
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        this.timeline.create(easyModeButton)
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        this.timeline.create(impl2024WinterButton)
            .fadeIn(duration, tl.Easing.easeInOutCubic);

        return layer;
    };

    private hideButtonAll = (): void => {
        this.frontLayer.children?.forEach(e => {
            if (e instanceof Button && e.visible()) e.hide();
        });
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

    set onFinish(callback: (params: TitleSceneParams) => void) { this._onFinish = callback }
}