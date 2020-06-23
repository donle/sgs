export namespace Algorithm {
  export function shuffle<T>(a: T[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  export function randomInt(from: number, to: number) {
    return Math.round(Math.random() * (to - from)) + from;
  }
}
