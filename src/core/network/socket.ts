import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { HostConfigProps } from 'core/shares/types/host_config';

export type WebSocketWithId<T> = T & {
  id: string;
};

export interface WebSocketMessageEvent {
  data: string;
  type: string;
  target: any;
}

export abstract class Socket<T extends WorkPlace> {
  protected abstract roomPath: string;

  constructor(protected eventMode: T, protected hostConfig: HostConfigProps) {}

  public abstract sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, T extends T ? WorkPlace.Server : T>,
    to: PlayerId,
  ): void;

  public abstract broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<
      typeof type,
      T extends WorkPlace.Client ? WorkPlace.Server : T
    >,
  );

  public abstract getSocketById(id: PlayerId): any;
  public abstract notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
    to: PlayerId,
  ): void;

  public abstract get ClientIds(): string[];
  public abstract async waitForResponse<T extends object = {}>(
    eventName: string,
  ): Promise<T>;

  public get RoomPath() {
    return this.roomPath;
  }

  protected on<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<
      typeof type,
      T extends WorkPlace.Client ? WorkPlace.Server : T
    >,
    ...params: any[]
  ) {
    switch (type) {
      case GameEventIdentifiers.UserMessageEvent:
        this.userMessage(
          content as EventPicker<
            GameEventIdentifiers.UserMessageEvent,
            WorkPlace
          >,
          ...params,
        );
        break;

      case GameEventIdentifiers.CardUseEvent:
        this.useCard(
          content as EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.CardDropEvent:
        this.dropCard(
          content as EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.CardResponseEvent:
        this.responseCard(
          content as EventPicker<
            GameEventIdentifiers.CardResponseEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.DrawCardEvent:
        this.drawCard(
          content as EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.ObtainCardEvent:
        this.obtainCard(
          content as EventPicker<
            GameEventIdentifiers.ObtainCardEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.MoveCardEvent:
        this.moveCard(
          content as EventPicker<GameEventIdentifiers.MoveCardEvent, WorkPlace>,
          ...params,
        );
        break;

      case GameEventIdentifiers.SkillUseEvent:
        this.useSkill(
          content as EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.PinDianEvent:
        this.pinDian(
          content as EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.DamageEvent:
        this.damage(
          (content as unknown) as EventPicker<
            GameEventIdentifiers.DamageEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.JudgeEvent:
        this.judge(
          content as EventPicker<GameEventIdentifiers.JudgeEvent, WorkPlace>,
          ...params,
        );
        break;

      case GameEventIdentifiers.GameCreatedEvent:
        this.gameCreated(
          content as EventPicker<
            GameEventIdentifiers.GameCreatedEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.GameStartEvent:
        this.gameStart(
          content as EventPicker<
            GameEventIdentifiers.GameStartEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.GameOverEvent:
        this.gameOver(
          content as EventPicker<GameEventIdentifiers.GameOverEvent, WorkPlace>,
          ...params,
        );
        break;

      case GameEventIdentifiers.PlayerEnterEvent:
        this.playerEnter(
          (content as unknown) as EventPicker<
            GameEventIdentifiers.PlayerEnterEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        this.playerLeave(
          content as EventPicker<
            GameEventIdentifiers.PlayerLeaveEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        this.playerDied(
          content as EventPicker<
            GameEventIdentifiers.PlayerDiedEvent,
            WorkPlace
          >,
          ...params,
        );
      case GameEventIdentifiers.AskForInvokeEvent:
        this.invokeSkill(
          content as EventPicker<
            GameEventIdentifiers.AskForInvokeEvent,
            WorkPlace
          >,
          ...params,
        );
      default:
        break;
    }
  }

  public abstract userMessage(
    ev: EventPicker<GameEventIdentifiers.UserMessageEvent, WorkPlace>,
    ...params: any[]
  ): void;

  public abstract gameCreated(
    ev: EventPicker<GameEventIdentifiers.GameCreatedEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract gameOver(
    ev: EventPicker<GameEventIdentifiers.GameOverEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract gameStart(
    ev: EventPicker<GameEventIdentifiers.GameStartEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract playerEnter(
    ev: EventPicker<GameEventIdentifiers.PlayerEnterEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract playerLeave(
    ev: EventPicker<GameEventIdentifiers.PlayerLeaveEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract playerDied(
    ev: EventPicker<GameEventIdentifiers.PlayerDiedEvent, WorkPlace>,
    ...params: any[]
  ): void;

  public abstract useCard(
    ev: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract dropCard(
    ev: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract responseCard(
    ev: EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract drawCard(
    ev: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract obtainCard(
    ev: EventPicker<GameEventIdentifiers.ObtainCardEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract moveCard(
    ev: EventPicker<GameEventIdentifiers.MoveCardEvent, WorkPlace>,
    ...params: any[]
  ): void;

  public abstract useSkill(
    ev: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract pinDian(
    ev: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract damage(
    ev: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract judge(
    ev: EventPicker<GameEventIdentifiers.JudgeEvent, WorkPlace>,
    ...params: any[]
  ): void;
  public abstract invokeSkill(
    ev: EventPicker<GameEventIdentifiers.AskForInvokeEvent, WorkPlace>,
    ...params: any[]
  ): void;
}
