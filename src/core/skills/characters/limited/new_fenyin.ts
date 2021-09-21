import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'new_fenyin', description: 'new_fenyin_description' })
export class NewFenYin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    const bannedSuits = owner.getFlag<CardSuit[]>(this.Name) || [];
    return (
      room.CurrentPlayer === owner &&
      content.infos.find(
        info =>
          info.toArea === CardMoveArea.DropStack &&
          info.movingCards.find(card => !bannedSuits.includes(Sanguosha.getCardById(card.card).Suit)),
      ) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const infos = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.filter(
      info => info.toArea === CardMoveArea.DropStack,
    );

    const bannedSuits = room.getFlag<CardSuit[]>(fromId, this.Name) || [];
    let drawNum = 0;
    for (const info of infos) {
      for (const cardInfo of info.movingCards) {
        const suit = Sanguosha.getCardById(cardInfo.card).Suit;
        if (!bannedSuits.includes(suit)) {
          drawNum++;
          bannedSuits.push(suit);
        }
      }
    }

    room.getPlayerById(fromId).setFlag<CardSuit[]>(this.Name, bannedSuits);

    await room.drawCards(drawNum, fromId, 'top', fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: NewFenYin.Name, description: NewFenYin.Description })
export class NewFenYinShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      owner.getFlag<number>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
