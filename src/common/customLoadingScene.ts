export class CustomLoadingScene extends g.LoadingScene {

    constructor() {
        super({ game: g.game });

        this.onLoad.add(() => {
            const bg = new g.FilledRect({
                scene: this,
                width: g.game.width,
                height: g.game.height,
                cssColor: "black",
            });
            this.append(bg);
        });
    }
}