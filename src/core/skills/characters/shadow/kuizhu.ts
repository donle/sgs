import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'kuizhu', description: 'kuizhu_description' })
export class KuiZhu extends TriggerSkill {
  public static readonly KuiZhuDroppedNum = 'kuizhu_dropped_num';

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    let canUse = content.playerId === owner.Id && content.toStage === PlayerPhaseStages.DropCardStageEnd;
    if (canUse) {
      const droppedCardsNum = room.Analytics.getCardLostRecord(owner.Id, 'phase').reduce<number>((sum, event) => {
        if (event.infos.length === 1) {
          const info = event.infos[0];
          return (
            sum +
            (info.moveReason === CardMoveReason.SelfDrop
              ? info.movingCards.filter(
                  card =>
                    (!Sanguosha.isVirtualCardId(card.card) && card.fromArea === CardMoveArea.HandArea) ||
                    card.fromArea === CardMoveArea.EquipArea,
                ).length
              : 0)
          );
        } else {
          const infos = event.infos.filter(info => info.moveReason === CardMoveReason.SelfDrop);

          for (const info of infos) {
            sum +=
              info.moveReason === CardMoveReason.SelfDrop
                ? info.movingCards.filter(
                    card =>
                      (!Sanguosha.isVirtualCardId(card.card) && card.fromArea === CardMoveArea.HandArea) ||
                      card.fromArea === CardMoveArea.EquipArea,
                  ).length
                : 0;
          }

          return sum;
        }
      }, 0);
      if (droppedCardsNum > 0) {
        owner.setFlag<number>(this.Name, droppedCardsNum);
      } else {
        canUse = false;
      }
    }

    return canUse;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;
    const droppedCardsNum = room.getFlag<number>(fromId, this.Name);

    const options = ['kuizhu:draw', 'kuizhu:damage'];
    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose kuizhu options: {1}',
          this.Name,
        ).extract(),
      },
      fromId,
    );
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      fromId,
    );

    if (selectedOption) {
      room.setFlag<number>(fromId, KuiZhu.KuiZhuDroppedNum, droppedCardsNum);

      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        {
          invokeSkillNames: selectedOption === options[0] ? [KuiZhuDraw.Name] : [KuiZhuDamage.Name],
          toId: fromId,
          conversation:
            selectedOption === options[0]
              ? TranslationPack.translationJsonPatcher(
                  '{0}: do you want to choose at most {1} targets to draw a card each?',
                  this.Name,
                  droppedCardsNum,
                ).extract()
              : TranslationPack.translationJsonPatcher(
                  '{0}: do you want to choose a targets with {1} hp to deal 1 damage to each target?',
                  this.Name,
                  droppedCardsNum,
                ).extract(),
        },
        fromId,
      );
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, fromId);

      if (response.toIds) {
        EventPacker.addMiddleware({ tag: this.Name, data: selectedOption }, event);
        event.toIds = response.toIds;
        return true;
      }
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }
    const selectedOption = EventPacker.getMiddleware<string>(this.Name, event);

    if (selectedOption === 'kuizhu:draw') {
      for (const to of toIds) {
        await room.drawCards(1, to, 'top', fromId, this.Name);
      }
    } else {
      for (const to of toIds) {
        await room.damage({
          fromId,
          toId: to,
          damage: 1,
          damageType: DamageType.Normal,
          triggeredBySkills: [this.Name],
        });
      }
      toIds.length > 1 && (await room.loseHp(fromId, 1));
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'draw_kuizhu', description: 'draw_kuizhu_description' })
export class KuiZhuDraw extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= owner.getFlag<number>(KuiZhu.KuiZhuDroppedNum);
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'damage_kuizhu', description: 'damage_kuizhu_description' })
export class KuiZhuDamage extends TriggerSkill {
  public isTriggerable(): boolean {
    return false;
  }

  public canUse(): boolean {
    return false;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return (
      targets.reduce<number>((sum, target) => sum + room.getPlayerById(target).Hp, 0) ===
      owner.getFlag<number>(KuiZhu.KuiZhuDroppedNum)
    );
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    return (
      selectedTargets.reduce<number>((sum, target) => sum + room.getPlayerById(target).Hp, 0) +
        room.getPlayerById(target).Hp <=
      room.getPlayerById(owner).getFlag<number>(KuiZhu.KuiZhuDroppedNum)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}
