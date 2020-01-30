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

  public abstract async waitForResponse<T>(
    identifier: GameEventIdentifiers,
    playerId?: PlayerId,
  ): Promise<T>;

  public abstract sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, T extends T ? WorkPlace.Server : T>,
    to?: PlayerId,
  ): void;

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
    //TODO: add all functions here
    switch (type) {
      case GameEventIdentifiers.CardEffectEvent:
        this.onCardEffect(
          content as EventPicker<
            GameEventIdentifiers.CardEffectEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.CardDisplayEvent:
        this.displayCard(
          content as EventPicker<
            GameEventIdentifiers.CardDisplayEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AimEvent:
        this.onAim(
          content as EventPicker<GameEventIdentifiers.AimEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.AimmedEvent:
        this.onAimmed(
          content as EventPicker<GameEventIdentifiers.AimmedEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.RecoverEvent:
        this.onRecover(
          content as EventPicker<GameEventIdentifiers.RecoverEvent, WorkPlace>,
          ...params,
        );
        break;
      case GameEventIdentifiers.PlayerDyingEvent:
        this.onDying(
          content as EventPicker<
            GameEventIdentifiers.PlayerDyingEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForPeachEvent:
        this.onAskingForPeach(
          content as EventPicker<
            GameEventIdentifiers.AskForPeachEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForWuXieKeJiEvent:
        this.onAskingForWuXieKeJi(
          content as EventPicker<
            GameEventIdentifiers.AskForWuXieKeJiEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForCardResponseEvent:
        this.onAskingForCardResponse(
          content as EventPicker<
            GameEventIdentifiers.AskForCardResponseEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForCardUseEvent:
        this.onAskingForCardUse(
          content as EventPicker<
            GameEventIdentifiers.AskForCardUseEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForCardDisplayEvent:
        this.onAskingForCardDisplay(
          content as EventPicker<
            GameEventIdentifiers.AskForCardDisplayEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForCardDropEvent:
        this.onAskingForCardDrop(
          content as EventPicker<
            GameEventIdentifiers.AskForCardDropEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForPinDianCardEvent:
        this.onAskingForPinDianCard(
          content as EventPicker<
            GameEventIdentifiers.AskForPinDianCardEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForChoosingCardEvent:
        this.onAskingForChoosingCard(
          content as EventPicker<
            GameEventIdentifiers.AskForChoosingCardEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForChooseOptionsEvent:
        this.onAskingForChoosingOptions(
          content as EventPicker<
            GameEventIdentifiers.AskForChooseOptionsEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForChoosingCardFromPlayerEvent:
        this.onAskingForChoosingCardFromPlayer(
          content as EventPicker<
            GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForChooseCharacterEvent:
        this.onAskingForChooseCharacter(
          content as EventPicker<
            GameEventIdentifiers.AskForChooseCharacterEvent,
            WorkPlace
          >,
          ...params,
        );
        break;
      case GameEventIdentifiers.AskForPlaceCardsInDileEvent:
        this.onAskingForPlaceCardsInDile(
          content as EventPicker<
            GameEventIdentifiers.AskForPlaceCardsInDileEvent,
            WorkPlace
          >,
          ...params,
        );
        break;

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

  public abstract onCardEffect(
    ev: EventPicker<GameEventIdentifiers.CardEffectEvent, WorkPlace>,
    ...params
  ): void;
  public abstract displayCard(
    ev: EventPicker<GameEventIdentifiers.CardDisplayEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAim(
    ev: EventPicker<GameEventIdentifiers.AimEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAimmed(
    ev: EventPicker<GameEventIdentifiers.AimmedEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onRecover(
    ev: EventPicker<GameEventIdentifiers.RecoverEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onDying(
    ev: EventPicker<GameEventIdentifiers.PlayerDyingEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForPeach(
    ev: EventPicker<GameEventIdentifiers.AskForPeachEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForWuXieKeJi(
    ev: EventPicker<GameEventIdentifiers.AskForWuXieKeJiEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForCardResponse(
    ev: EventPicker<GameEventIdentifiers.AskForCardResponseEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForCardUse(
    ev: EventPicker<GameEventIdentifiers.AskForCardUseEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForCardDisplay(
    ev: EventPicker<GameEventIdentifiers.AskForCardDisplayEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForCardDrop(
    ev: EventPicker<GameEventIdentifiers.AskForCardDropEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForPinDianCard(
    ev: EventPicker<GameEventIdentifiers.AskForPinDianCardEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForChoosingCard(
    ev: EventPicker<GameEventIdentifiers.AskForChoosingCardEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForChoosingOptions(
    ev: EventPicker<GameEventIdentifiers.AskForChooseOptionsEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForChoosingCardFromPlayer(
    ev: EventPicker<
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      WorkPlace
    >,
    ...params
  ): void;
  public abstract onAskingForChooseCharacter(
    ev: EventPicker<GameEventIdentifiers.AskForChooseCharacterEvent, WorkPlace>,
    ...params
  ): void;
  public abstract onAskingForPlaceCardsInDile(
    ev: EventPicker<
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      WorkPlace
    >,
    ...params
  ): void;
}
