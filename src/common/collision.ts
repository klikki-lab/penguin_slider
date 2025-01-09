export namespace Collision {

    export const intersect = (e1: g.E, v1: g.CommonOffset, e2: g.E, v2: g.CommonOffset = { x: 0, y: 0 }) => {
        const dx = Math.abs(e1.x + v1.x - e2.x + v2.x);
        const dy = Math.abs(e1.y + v1.y - e2.y + v2.y);
        return dx < (e1.width + e2.width) / 2 && dy < (e1.height + e2.height) / 2;
    };

    export const within = (e1: g.E, e2: g.E) => {
        const dx = Math.abs(e1.x - e2.x);
        const dy = Math.abs(e1.y - e2.y);
        const w1 = Math.abs(e1.width * e1.scaleX);
        const w2 = Math.abs(e2.width * e2.scaleX);
        const h1 = Math.abs(e1.height * e1.scaleY);
        const h2 = Math.abs(e2.height * e2.scaleY);
        return dx < (w1 + w2) / 2 && dy < (h1 + h2) / 2;
    };

    export const withinArea = (e1: g.E, r1: number, e2: g.E, r2: number) => {
        const dx = e1.x - e2.x;
        const dy = e1.y - e2.y;
        const r = r1 + r2;
        return dx * dx + dy * dy <= r * r;
    };
}