export class SpeechBubble extends g.Sprite {

    constructor(scene: g.Scene, isUp: boolean = true) {
        const asset = scene.asset.getImageById("img_speech_bubble");
        const width = asset.width / 2;
        super({
            scene: scene,
            src: asset,
            width: width,
            height: asset.height,
            srcX: isUp ? 0 : width,
            srcY: 0,
            anchorX: .5,
            anchorY: .5,
        });
    }

    addMessage = (messageAssetId: string): void => {
        if (this.children && this.children.length > 0) return;

        new g.Sprite({
            scene: this.scene,
            src: this.scene.asset.getImageById(messageAssetId),
            parent: this,
            anchorX: .5,
            anchorY: .5,
            x: this.width / 2,
            y: this.height / 2,
        });
    };

    up = (): void => {
        this.srcX = 0;
        this.invalidate();
    };

    down = (): void => {
        this.srcX = this.width;
        this.invalidate();
    };

    isUp = (): boolean => this.srcX === 0;
}