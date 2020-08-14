export namespace Algorithm {
  export function shuffle<T>(a: T[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  export function randomPick(pick: number, upperBound: number) {
    const resultRecord: boolean[] = [];
    let isInvert = false;

    if (pick * 2 > upperBound) {
      pick = upperBound - pick;
      isInvert = true;
    }

    while (pick--) {
      let randomIdx = Math.floor(Math.random() * upperBound);
      while (resultRecord[randomIdx]) {
        randomIdx = (randomIdx + 1) % upperBound;
      }
      resultRecord[randomIdx] = true;
    }

    const randomIdx: number[] = [];
    for (let i = 0; i < upperBound; i++) {
      isInvert !== !!resultRecord[i] && randomIdx.push(i);
    }

    return randomIdx;
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
}
