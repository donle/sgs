import { Precondition } from 'core/shares/libs/precondition/precondition';

export const quickMessageMaxIndex = 22;

export function createRawQuickMessage(index: number) {
  Precondition.assert(index <= quickMessageMaxIndex, 'unknown quick message index');
  return `quickChat:${index}`;
}
