export class MouseButtonHoldRepeater {

    private static readonly REPEAT_FRAME = Math.floor(g.game.fps / 30 * 8);
    private static readonly ACTION_FRAME = Math.floor(g.game.fps / 30 * 1);

    private isClicked = false;
    private repeatFrame = 0;
    private actionFrame = 0;

    constructor(
        private nextRepeatFrame = MouseButtonHoldRepeater.REPEAT_FRAME,
        private nextActionFrame = MouseButtonHoldRepeater.ACTION_FRAME
    ) { }

    init = (isClicked: boolean): void => {
        this.isClicked = isClicked;
        this.repeatFrame = 0;
        this.actionFrame = 0;
    };

    canPerformAction = (): boolean => {
        if (this.isClicked) {
            if (this.repeatFrame < this.nextRepeatFrame) {
                this.repeatFrame++;
            } else {
                if (this.actionFrame < this.nextActionFrame) {
                    this.actionFrame++;
                } else {
                    this.actionFrame = 0;
                    return true;
                }
            }
        }
        return false;
    };
}