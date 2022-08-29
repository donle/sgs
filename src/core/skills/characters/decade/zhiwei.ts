import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  CardMoveStage,
  DamageEffectStage,
  GameBeginStage,
  PhaseChangeStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'zhiwei', description: 'zhiwei_description' })
export class ZhiWei extends TriggerSkill {
  public static readonly ZhiWeiPlayer = 'zhiwei_player';

  public isAutoTrigger(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return !!event && EventPacker.getIdentifier(event) === GameEventIdentifiers.GameBeginEvent;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === GameBeginStage.AfterGameBegan || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.GameBeginEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.to === PlayerPhase.PhaseBegin &&
        phaseChangeEvent.toPlayer === owner.Id &&
        (!owner.getFlag<PlayerId>(this.Name) || room.getPlayerById(owner.getFlag<PlayerId>(this.Name)).Dead)
      );
    }

    return identifier === GameEventIdentifiers.GameBeginEvent;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose another player to be the ‘Zhi Wei’ target?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    let toId: PlayerId;
    if (
      EventPacker.getIdentifier(
        event.triggeredOnEvent as ServerEventFinder<
          GameEventIdentifiers.GameBeginEvent | GameEventIdentifiers.PhaseChangeEvent
        >,
      ) === GameEventIdentifiers.GameBeginEvent
    ) {
      const others = room.getOtherPlayers(event.fromId).map(player => player.Id);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: others,
          toId: event.fromId,
          requiredAmount: 1,
          conversation: 'zhiwei: please choose another player to be your ‘Zhi Wei’ player',
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      toId = (response.selectedPlayers || [others[Math.floor(Math.random() * others.length)]])[0];
    } else {
      if (!event.toIds) {
        return false;
      }

      toId = event.toIds[0];
    }

    room.getPlayerById(event.fromId).setFlag<PlayerId>(this.Name, toId);
    room.setFlag<boolean>(toId, ZhiWei.ZhiWeiPlayer, false, this.Name, [event.fromId]);

    return true;
  }
}

@ShadowSkill
@PersistentSkill({ stubbornSkill: true })
@CommonSkill({ name: ZhiWei.Name, description: ZhiWei.Description })
export class ZhiWeiChained extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === DamageEffectStage.AfterDamageEffect ||
      stage === DamageEffectStage.AfterDamagedEffect ||
      stage === CardMoveStage.AfterCardMoved
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const canUse =
        (stage === DamageEffectStage.AfterDamageEffect &&
          (content as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId ===
            owner.getFlag<PlayerId>(this.GeneralName)) ||
        (stage === DamageEffectStage.AfterDamagedEffect &&
          (content as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId === owner.getFlag<PlayerId>(this.GeneralName));

      canUse && owner.setFlag<AllStage>(this.Name, stage!);

      return canUse;
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      return (
        room.CurrentPhasePlayer === owner &&
        room.CurrentPlayerPhase === PlayerPhase.DropCardStage &&
        !!owner.getFlag<PlayerId>(this.GeneralName) &&
        !room.getPlayerById(owner.getFlag<PlayerId>(this.GeneralName)).Dead &&
        (content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
          info =>
            info.moveReason === CardMoveReason.SelfDrop &&
            info.movingCards.find(cardInfo => room.isCardInDropStack(cardInfo.card)),
        ) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (!room.getFlag<boolean>(room.getFlag<PlayerId>(event.fromId, this.GeneralName), ZhiWei.ZhiWeiPlayer)) {
      room.setFlag<boolean>(
        room.getFlag<PlayerId>(event.fromId, this.GeneralName),
        ZhiWei.ZhiWeiPlayer,
        true,
        this.GeneralName,
      );
    }

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const stage = room.getFlag<AllStage>(event.fromId, this.Name);
      if (stage === DamageEffectStage.AfterDamageEffect) {
        await room.drawCards(1, event.fromId, 'top', event.fromId, this.GeneralName);
      } else if (stage === DamageEffectStage.AfterDamagedEffect) {
        const availableIds = room
          .getPlayerById(event.fromId)
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(cardId => room.canDropCard(event.fromId, cardId));
        if (availableIds.length === 0) {
          return false;
        }

        await room.dropCards(
          CardMoveReason.SelfDrop,
          [availableIds[Math.floor(Math.random() * availableIds.length)]],
          event.fromId,
          event.fromId,
          this.GeneralName,
        );
      }
    } else {
      const availableIds = (event.triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.MoveCardEvent
      >).infos.reduce<CardId[]>((cardIds, info) => {
        return info.moveReason === CardMoveReason.SelfDrop
          ? cardIds.concat(
              ...info.movingCards
                .filter(cardInfo => room.isCardInDropStack(cardInfo.card))
                .map(cardInfo => cardInfo.card),
            )
          : cardIds;
      }, []);

      await room.moveCards({
        movingCards: availableIds.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
        toId: room.getFlag<PlayerId>(event.fromId, this.GeneralName),
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: room.getFlag<PlayerId>(event.fromId, this.GeneralName),
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}
