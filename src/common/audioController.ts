interface Musics {
    [key: string]: {
        readonly audio: g.AudioAsset;
        readonly volume: number;
    }
}

export interface MusicParams {
    assetId: string;
    volumeRate?: number;
}

interface Sounds {
    [key: string]: {
        readonly audio: g.AudioAsset;
        readonly volume: number;
        interval: number;
        age: number;
    }
}

export interface SoundParams extends MusicParams {
    interval?: number;
}

export class AudioController {
    private static readonly DEFAULT_SE_INTERVAL = 1;

    private musics: Musics = {};
    private sounds: Sounds = {};
    private musicVolume: number;
    private soundVolume: number;

    constructor(musicVolume: number, soundVolume: number) {
        this.musicVolume = g.Util.clamp(musicVolume, 0, 1);
        this.soundVolume = g.Util.clamp(soundVolume, 0, 1);
    }

    addMusic = (asset: g.AssetAccessor, params: MusicParams[]): void => {
        params.forEach(param => {
            const volumeRate = param.volumeRate ?? 1;
            this.musics[param.assetId] = {
                audio: asset.getAudioById(param.assetId),
                volume: this.musicVolume * g.Util.clamp(volumeRate, 0, 1),
            };
        });
    };

    playMusic = (assetId: string): g.AudioPlayer => {
        const music = this.musics[assetId];
        const player = music.audio.play();
        player.changeVolume(music.volume);
        return player;
    }

    stopMusic = (assetId: string): void => this.musics[assetId].audio.stop();

    addSE = (asset: g.AssetAccessor, params: SoundParams[]): void => {
        params.forEach(param => {
            const volumeRate = param.volumeRate ?? 1;
            const interval = param.interval ?? AudioController.DEFAULT_SE_INTERVAL;
            this.sounds[param.assetId] = {
                audio: asset.getAudioById(param.assetId),
                volume: this.soundVolume * g.Util.clamp(volumeRate, 0, 1),
                interval: Math.max(AudioController.DEFAULT_SE_INTERVAL, interval),
                age: g.game.age,
            };
        });
    };

    playSE = (assetId: string, volumeRate: number = 1): g.AudioPlayer | undefined => {
        const sound = this.sounds[assetId];
        if (sound.interval) {
            if (g.game.age - sound.age < sound.interval) {
                return undefined;
            }
            sound.age = g.game.age;
        }
        const player = sound.audio.play();
        player.changeVolume(sound.volume * volumeRate);
        return player;
    }
}