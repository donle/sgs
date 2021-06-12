export namespace Algorithm {
  export function shuffle<T>(a: T[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  export function randomPick<T>(pick: number, arr: T[]): T[] {
    const copy = arr.slice();
    const picked: T[] = [];
    const reverse = pick > arr.length / 2;
    pick = reverse ? arr.length - pick : pick;
    while (pick > 0) {
      const index = Math.floor(Math.random() * copy.length);
      picked.push(...copy.splice(index, 1));
      pick--;
    }
    return reverse ? copy : picked;
  }

  export function randomInt(from: number, to: number) {
    return Math.round(Math.random() * (to - from)) + from;
  }
  export function intersection<T>(source: T[], scope: T[]) {
    return source.filter(element => scope.includes(element));
  }
  export function isSubsetOf<T>(source: T[], target: T[]) {
    return target.filter(element => !source.includes(element)).length === 0;
  }
  export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
