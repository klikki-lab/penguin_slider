import { GameMainParameterObject } from "./parameterObject";
import { CustomLoadingScene } from "./common/customLoadingScene";
import { GameScene } from "./game_scene/gameScene";
import { TitleScene } from "./title_scene/titleScene";

export function main(param: GameMainParameterObject): void {
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 100,
        clearThreshold: undefined,
    };
    // g.game.audio.music.volume = 0.1;
    // g.game.audio.sound.volume = 0.1;
    g.game.loadingScene = new CustomLoadingScene();

    const titleScene = new TitleScene(7);
    titleScene.onFinish = (isClicked: boolean, isEasyMode: boolean): void => {
        g.game.replaceScene(new GameScene(param, isClicked, isEasyMode, 60));
    };
    g.game.pushScene(titleScene);
}
