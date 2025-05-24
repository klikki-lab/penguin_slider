/**
 * windowオブジェクト絡みのユーティリティモジュール。
 */
export namespace WindowUtil {

    /**
     * @returns ドメインが`nicovideo.jp`なら`true`、そうでなければ`false`
     */
    export function isNicovideoJpDomain(): boolean {
        try {
            return window?.location?.hostname.indexOf("nicovideo.jp") >= 0;
        } catch (e: unknown) {
            return false;
        }
    }

    export function addMouseMoveListener(listener: (ev: MouseEvent) => void): void {
        window?.addEventListener('mousemove', listener);
    }

    export function removeMouseMoveListener(listener: (ev: MouseEvent) => void): void {
        window?.removeEventListener('mousemove', listener);
    }
}
