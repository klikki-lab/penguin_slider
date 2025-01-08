export namespace Collision {

    export const intersect = (e1: g.E, v1: g.CommonOffset, e2: g.E, v2: g.CommonOffset = { x: 0, y: 0 }) => {
        const dx = Math.abs(e1.x + v1.x - e2.x + v2.x);
        const dy = Math.abs(e1.y + v1.y - e2.y + v2.y);
        return dx < (e1.width + e2.width) / 2 && dy < (e1.height + e2.height) / 2;
    }
}