import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { RoomStore } from 'pages/room/room.presenter';
import { Point } from '../position';
import { UiAnimation } from '../ui_animation';

export type Step = [Point, Point[]];

export class GuideLine extends UiAnimation {
  constructor(private store: RoomStore, private animationTime: number, private remainTime: number) {
    super();
  }
  private readonly includedEvents: ReadonlyArray<GameEventIdentifiers> = [
    GameEventIdentifiers.CardUseEvent,
    GameEventIdentifiers.SkillUseEvent,
  ];

  private readonly rooElement = document.getElementById('root')!;

  private calculateAngle(from: Point, to: Point) {
    const xrad = Math.atan2(to.x - from.x, to.y - from.y);
    const rotation = (xrad / Math.PI) * 180;
    let angle = 360 - rotation + 90;
    angle = angle < 0 ? 360 + angle : angle;
    angle %= 360;
    return angle - 360;
  }

  private calulateLength(from: Point, to: Point) {
    return Math.sqrt(Math.pow(Math.abs(from.x - to.x), 2) + Math.pow(Math.abs(from.y - to.y), 2));
  }

  private createAnimationGuidelineSteps(event: ServerEventFinder<GameEventIdentifiers>) {
    const steps: Step[] = [];
    const { animation } = event;
    if (animation) {
      for (const { from, tos } of animation) {
        const fromPont = this.store.animationPosition.getPosition(from, from === this.store.clientPlayerId);
        const toPoints = tos.map(to => this.store.animationPosition.getPosition(to, to === this.store.clientPlayerId));
        steps.push([fromPont, toPoints]);
      }
    }

    return steps;
  }

  async animate(identifier: GameEventIdentifiers, event: ServerEventFinder<GameEventIdentifiers>) {
    if (!this.includedEvents.includes(identifier)) {
      return;
    }

    const steps = this.createAnimationGuidelineSteps(event);
    for (const step of steps) {
      const lines = this.render(step);
      this.rooElement.append(...lines.map(line => line[0]));
      for (const [element, length] of lines) {
        this.play(100, () => {
          element.style.transition = `width ${this.animationTime}ms, opacity ${this.defaultAnimationTime}ms`;
          element.style.width = `${length}px`;
          element.style.opacity = '1';
        });
        this.play(this.remainTime - this.defaultAnimationTime * 2 - 10, () => {
          element.style.transition = `opacity ${this.defaultAnimationTime * 2}ms`;
          element.style.opacity = '0';
        });
      }

      this.play(this.remainTime, () => {
        for (const line of lines) {
          line[0].remove();
        }
      });

      await this.play(this.animationTime + this.defaultAnimationTime);
    }
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
