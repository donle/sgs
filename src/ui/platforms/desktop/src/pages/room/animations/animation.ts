import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';

export abstract class UiAnimation {
  public abstract animate(event: ServerEventFinder<GameEventIdentifiers>): void | Promise<void>;
  protected readonly defaultAnimationTime = 150;

  protected async play(time: number, action?: () => void) {
    return new Promise(r => {
      setTimeout(() => {
        action && action();
        r();
      }, time);
    });
  }
}
