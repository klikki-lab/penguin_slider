import * as tl from "@akashic-extension/akashic-timeline";

export class ScoreLabel extends g.Label {

    private static readonly COUNTER_STOP = 99999;
    private static readonly SPACES = "    ";

    private timeline: tl.Timeline;

    constructor(scene: g.Scene, font: g.BitmapFont, fontSize: number, initialScore: number = 0) {
        super({
            scene: scene,
            font: font,
            text: `SCORE ${(ScoreLabel.SPACES + initialScore).slice(-(ScoreLabel.SPACES.length + 1))}`,
            fontSize: fontSize,
        });
        g.game.vars.gameState.score = initialScore;
        this.timeline = new tl.Timeline(scene);
    }

    private clamp = (score: number): number => {
        g.game.vars.gameState.score += score;
        return Math.min(g.game.vars.gameState.score, ScoreLabel.COUNTER_STOP);
    };

    private setText = (score: number): void => {
        this.text = `SCORE ${(ScoreLabel.SPACES + score).slice(-(ScoreLabel.SPACES.length + 1))}`;
        this.invalidate();
    };

    addScore = (score: number): void => { this.setText(this.clamp(score)); };

    addScoreWithAnim = (score: number, duration: number): tl.Tween => {
        const clamped = this.clamp(score);
        return this.timeline.create(this)
            .every((e: number, p: number) => {
                this.setText(clamped - Math.floor(score * (1 - p)));
            }, duration);
    };
}