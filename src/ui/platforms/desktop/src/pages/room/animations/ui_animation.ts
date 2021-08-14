export abstract class UiAnimation {
  protected readonly defaultAnimationTime = 150;

  public static async play(time: number, action?: () => void) {
    return new Promise<void>(r => {
      setTimeout(() => {
        action && action();
        r();
      }, time);
    });
  }
}
