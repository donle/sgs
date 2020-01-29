import {
  createGameEventIdentifiersStringList,
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { HostConfigProps } from 'core/shares/types/host_config';
import IOSocketClient from 'socket.io-client';

export class ClientSocket extends Socket<WorkPlace.Client> {
  protected roomPath: string;
  private socketIO: SocketIOClient.Socket;

  constructor(config: HostConfigProps, roomId: string) {
    super(WorkPlace.Client, config);

    this.roomPath = `/room-${roomId}`;
    this.socketIO = IOSocketClient(
      `${config.protocal}://${config.host}:${config.port}`,
      { path: this.roomPath },
    );

    const gameEvent: string[] = createGameEventIdentifiersStringList();
    gameEvent.forEach(event => {
      this.socketIO.on(event, (content: unknown) => {
        const type = parseInt(event, 10) as GameEventIdentifiers;
        this.on(type, content as EventPicker<typeof type, WorkPlace.Server>);
      });
    });
  }

  public sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
  ) {
    this.socketIO.emit(type.toString(), content);
  }

  //TODO: socket event handlers
  public userMessage(
    ev: EventPicker<GameEventIdentifiers.UserMessageEvent, WorkPlace.Server>,
  ): void {}

  public gameOver(
    ev: EventPicker<GameEventIdentifiers.GameOverEvent, WorkPlace.Server>,
  ): void {}
  public gameStart(
    ev: EventPicker<GameEventIdentifiers.GameStartEvent, WorkPlace.Server>,
  ): void {}
  public playerLeave(
    ev: EventPicker<GameEventIdentifiers.PlayerLeaveEvent, WorkPlace.Server>,
  ): void {}
  public playerEnter(
    ev: EventPicker<GameEventIdentifiers.PlayerEnterEvent, WorkPlace.Server>,
  ): void {}
  public playerDied(
    ev: EventPicker<GameEventIdentifiers.PlayerDiedEvent, WorkPlace.Server>,
  ): void {}

  public useCard(
    ev: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Server>,
  ): void {}
  public dropCard(
    ev: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Server>,
  ): void {}
  public responseCard(
    ev: EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace.Server>,
  ): void {}
  public drawCard(
    ev: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Server>,
  ): void {}
  public obtainCard(
    ev: EventPicker<GameEventIdentifiers.ObtainCardEvent, WorkPlace.Server>,
  ): void {}
  public moveCard(
    ev: EventPicker<GameEventIdentifiers.MoveCardEvent, WorkPlace.Server>,
  ): void {}

  public useSkill(
    ev: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Server>,
  ): void {}
  public pinDian(
    ev: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Server>,
  ): void {}
  public damage(
    ev: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Server>,
  ): void {}
  public judge(
    ev: EventPicker<GameEventIdentifiers.JudgeEvent, WorkPlace.Server>,
  ): void {}
  public invokeSkill(
    ev: EventPicker<GameEventIdentifiers.AskForInvokeEvent, WorkPlace.Server>,
  ): void {}
  public onCardEffect(
    ev: EventPicker<GameEventIdentifiers.CardEffectEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public displayCard(
    ev: EventPicker<GameEventIdentifiers.CardDisplayEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAim(
    ev: EventPicker<GameEventIdentifiers.AimEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAimmed(
    ev: EventPicker<GameEventIdentifiers.AimmedEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onRecover(
    ev: EventPicker<GameEventIdentifiers.RecoverEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onDying(
    ev: EventPicker<GameEventIdentifiers.PlayerDyingEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForPeach(
    ev: EventPicker<GameEventIdentifiers.AskForPeachEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForWuXieKeJi(
    ev: EventPicker<GameEventIdentifiers.AskForWuXieKeJiEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForCardResponse(
    ev: EventPicker<GameEventIdentifiers.AskForCardResponseEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForCardUse(
    ev: EventPicker<GameEventIdentifiers.AskForCardUseEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForCardDisplay(
    ev: EventPicker<GameEventIdentifiers.AskForCardDisplayEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForCardDrop(
    ev: EventPicker<GameEventIdentifiers.AskForCardDropEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForPinDianCard(
    ev: EventPicker<GameEventIdentifiers.AskForPinDianCardEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForChoosingCard(
    ev: EventPicker<GameEventIdentifiers.AskForChoosingCardEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForChoosingOptions(
    ev: EventPicker<GameEventIdentifiers.AskForChooseOptionsEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForChoosingCardFromPlayer(
    ev: EventPicker<
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      WorkPlace
    >,
    ...params
  ): void {}
  public onAskingForChooseCharacter(
    ev: EventPicker<GameEventIdentifiers.AskForChooseCharacterEvent, WorkPlace.Server>,
    ...params
  ): void {}
  public onAskingForPlaceCardsInDile(
    ev: EventPicker<GameEventIdentifiers.AskForPlaceCardsInDileEvent, WorkPlace.Server>,
    ...params
  ): void {}
}
