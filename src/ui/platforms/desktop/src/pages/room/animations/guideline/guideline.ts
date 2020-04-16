export type Point = {
  x: number;
  y: number;
};

export type Step = [Point, Point[]];

export class GuideLine {
  constructor(private steps: Step[], private animationTime: number, private remainTime: number) {}
  private readonly defaultAnimationTime = 150;
  private readonly rooElement = document.getElementById('root')!;

  calculateAngle(from: Point, to: Point) {
    const xrad = Math.atan2(to.x - from.x, to.y - from.y);
    const rotation = (xrad / Math.PI) * 180;
    let angle = 360 - rotation + 90;
    angle = angle < 0 ? 360 + angle : angle;
    angle %= 360;
    return angle - 360;
  }

  calulateLength(from: Point, to: Point) {
    return Math.sqrt(Math.pow(Math.abs(from.x - to.x), 2) + Math.pow(Math.abs(from.y - to.y), 2));
  }

  async animate() {
    for (const step of this.steps) {
      const lines = this.render(step);
      this.rooElement.append(...lines.map(line => line[0]));
      this.playAsyncAnimation(lines);
      await this.pause();
    }
  }

  private async pause() {
    return new Promise(resolve => {
      setTimeout(() => resolve(), this.animationTime + this.defaultAnimationTime);
    });
  }

  private async playAsyncAnimation(lines: [HTMLElement, number][]) {
    return new Promise(resolve => {
      for (const [element, length] of lines) {
        this.createAsyncAnimation(element, length).then(delayedElement => this.asyncAnimationOff(delayedElement));
      }

      setTimeout(async () => {
        for (const line of lines) {
          line[0].remove();
        }
        resolve();
      }, this.remainTime);
    });
  }

  private asyncAnimationOff(element: HTMLElement) {
    return new Promise<HTMLElement>(resolve => {
      setTimeout(() => {
        element.style.transition = `opacity ${this.defaultAnimationTime * 2}ms`;
        element.style.opacity = '0';
        resolve(element);
      }, this.remainTime - this.defaultAnimationTime * 2 - 10);
    });
  }

  private async createAsyncAnimation(element: HTMLElement, length: number) {
    return new Promise<HTMLElement>(resolve => {
      setTimeout(() => {
        element.style.transition = `width ${this.animationTime}ms, opacity ${this.defaultAnimationTime}ms`;
        element.style.width = `${length}px`;
        element.style.opacity = '1';
        resolve(element);
      }, 10);
    });
  }

  private render(step: Step) {
    const lines: [HTMLElement, number][] = [];
    for (const to of step[1]) {
      const element = document.createElement('div');
      element.style.height = '3px';
      element.style.borderRadius = '1.5px';
      element.style.width = '0';
      element.style.background = 'linear-gradient(86deg, rgba(255,68,62,1) 0%, rgba(251,248,0,1) 80%)';
      element.style.transform = `rotate(${this.calculateAngle(step[0], to)}deg)`;
      element.style.transformOrigin = 'top left';
      element.style.position = 'fixed';
      element.style.left = `${step[0].x}px`;
      element.style.top = `${step[0].y}px`;
      element.style.zIndex = '99';
      element.style.opacity = '0';
      lines.push([element, this.calulateLength(step[0], to)]);
    }

    return lines;
  }
}
