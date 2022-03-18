import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CharacterEquipSections } from 'core/characters/character';
import { CardMoveArea, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { GlobalRulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'xianwei', description: 'xianwei_description' })
export class XianWei extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      owner.AvailableEquipSections.length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>({
        options: from.AvailableEquipSections,
        toId: fromId,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose and abort an equip section',
          this.Name,
        ).extract(),
        triggeredBySkills: [this.Name],
      }),
      fromId,
    );

    response.selectedOption = response.selectedOption || from.AvailableEquipSections[0];

    await room.abortPlayerEquipSections(fromId, response.selectedOption as CharacterEquipSections);
    await room.drawCards(from.AvailableEquipSections.length, fromId, 'top', fromId, this.Name);

    const others = room.getOtherPlayers(fromId).map(player => player.Id);
    const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: others,
        toId: fromId,
        requiredAmount: 1,
        conversation: 'xianwei: please choose a target to use equip from draw pile',
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    resp.selectedPlayers = resp.selectedPlayers || [others[Math.floor(Math.random() * others.length)]];
    const equips = room.findCardsByMatcherFrom(
      new CardMatcher({
        type: [
          Functional.convertEquipSectionAndCardType(response.selectedOption as CharacterEquipSections) as CardType,
        ],
      }),
    );

    if (equips.length > 0) {
      await room.useCard({
        fromId: resp.selectedPlayers[0],
        targetGroup: [[resp.selectedPlayers[0]]],
        cardId: equips[0],
        customFromArea: CardMoveArea.DrawStack,
        triggeredBySkills: [this.Name],
      });
    } else {
      await room.drawCards(1, resp.selectedPlayers[0], 'top', resp.selectedPlayers[0], this.Name);
    }

    if (from.AvailableEquipSections.length === 0) {
      await room.changeMaxHp(fromId, 2);
      await room.obtainSkill(fromId, XianWeiBuff.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill({ stubbornSkill: true })
@CommonSkill({ name: 'xianwei_buff', description: 'xianwei_buff_description' })
export class XianWeiBuff extends GlobalRulesBreakerSkill {
  public breakWithinAttackDistance(room: Room, owner: Player, from: Player, to: Player): boolean {
    return (from === owner && to !== owner) || (from !== owner && to === owner);
  }
}
