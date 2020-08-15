import { CardId } from 'core/cards/libs/card_props';

export namespace Algorithm {
  export function shuffle<T>(a: T[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  export function randomPick(pick: number, cardIds: CardId[]) {
    const originResultRecord: boolean[] = [];
    const randomResultRecord: number[] = [];
    let isInvert = false;

    if (pick * 2 > cardIds.length) {
      pick = cardIds.length - pick;
      isInvert = true;
    }

    let currentLength = cardIds.length;
    while (pick--) {
      const randomId = Math.floor(Math.random() * currentLength);
      let originIdx = randomId;
      let originLength = currentLength;
      while (originLength < cardIds.length) {
        originLength++;
        originIdx = (originIdx + randomResultRecord[cardIds.length - originLength]) % originLength;
      }

      originResultRecord[originIdx] = true;
      randomResultRecord.push(randomId);
      currentLength--;
    }

    const randomCardIds: CardId[] = [];
    for (let i = 0; i < cardIds.length; i++) {
      isInvert !== !!originResultRecord[i] && randomCardIds.push(cardIds[i]);
    }

    return randomCardIds;
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
