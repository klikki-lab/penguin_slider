import { GameMainParameterObject } from "./parameterObject";
import { CustomLoadingScene } from "./common/customLoadingScene";
import { GameScene } from "./game_scene/gameScene";
import { TitleScene, TitleSceneParams } from "./title_scene/titleScene";
import { GameSceneImple2024Winter } from "./impl_2024_winter/gameSceneImpl2024Winter";

const TimeLimit = {
    TitleScene: 7,
    GameScene: 60,
} as const;

export function main(param: GameMainParameterObject): void {
    g.game.vars.gameState = {
        score: 0,
        playThreshold: 100,
        clearThreshold: undefined,
    };
    // g.game.audio.music.volume = 0.1;
    // g.game.audio.sound.volume = 0.1;
    g.game.loadingScene = new CustomLoadingScene();

    const titleScene = new TitleScene(TimeLimit.TitleScene);
    titleScene.onFinish = (params: TitleSceneParams): void => {
        if (params.is2024WinterMode && !params.isNormalMode && !params.isEasyMode) {
            g.game.replaceScene(new GameSceneImple2024Winter(param, params.isClicked, TimeLimit.GameScene));
        } else {
            const isEasyMode = !params.isNormalMode && params.isEasyMode;
            g.game.replaceScene(new GameScene(param, params.isClicked, isEasyMode, TimeLimit.GameScene));
        }
    };
    g.game.pushScene(titleScene);
}
