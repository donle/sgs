import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { System } from 'core/shares/libs/system';
import {
  CommonSkill,
  PersistentSkill,
  ShadowSkill,
  SideEffectSkill,
  TriggerSkill,
  ViewAsSkill,
} from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@PersistentSkill()
@CommonSkill({ name: 'zuoxing', description: 'zuoxing_description' })
export class ZuoXing extends ViewAsSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, player: Player) {
    if (player.getFlag<boolean>(this.Name)) {
      room.installSideEffectSkill(System.SideEffectSkillApplierEnum.ZuoXing, this.Name, player.Id);
    }
  }

  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[], cardMatcher?: CardMatcher): string[] {
    return cardMatcher
      ? []
      : Sanguosha.getCardNameByType(types => types.includes(CardType.Trick) && !types.includes(CardType.DelayedTrick));
  }

  isRefreshAt(room: Room, owner: Player, phase: PlayerPhase) {
    return phase === PlayerPhase.PlayCardStage;
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      owner.getFlag<boolean>(this.Name) &&
      !owner.hasUsedSkill(this.Name)
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return false;
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown zuoxing card');
    return VirtualCard.create({
      cardName: viewAs,
      bySkill: this.Name,
    });
  }
}

@ShadowSkill
@CommonSkill({ name: ZuoXing.Name, description: ZuoXing.Description })
export class ZuoXingShadow extends TriggerSkill {
  public whenRefresh(room: Room, owner: Player) {
    room.removeFlag(owner.Id, this.GeneralName);
    if (room.getSideEffectSkills(owner).includes(ZuoXingSide.Name)) {
      room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.ZuoXing);
    }
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseFinish;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id === content.playerId &&
      room.getAlivePlayersFrom().find(player => player.Character.Name === 'god_guojia' && player.MaxHp > 1) !==
        undefined
    );
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to let God Guo Jia loses 1 max hp? Then you can use virtual trick this turn',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const godGuoJias = room
      .getAlivePlayersFrom()
      .filter(player => player.Character.Name === 'god_guojia' && player.MaxHp > 1)
      .map(player => player.Id);
    let godGuoJia = godGuoJias[0];

    if (godGuoJias.length > 1) {
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: godGuoJias,
          toId: fromId,
          requiredAmount: 1,
          conversation: 'zuoxing: please choose a God Guo Jia to lose 1 max hp',
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      resp.selectedPlayers = resp.selectedPlayers || [godGuoJias[Math.floor(Math.random() * godGuoJias.length)]];

      godGuoJia = resp.selectedPlayers[0];
    }

    await room.changeMaxHp(godGuoJia, -1);
    room.setFlag<boolean>(fromId, this.GeneralName, true);

    return true;
  }
}

@SideEffectSkill
@PersistentSkill()
@CommonSkill({ name: 'side_zuoxing_s', description: 'side_zuoxing_s_description' })
export class ZuoXingSide extends ZuoXing {
  public canUse(room: Room, owner: Player): boolean {
    return (
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      owner.getFlag<boolean>(ZuoXing.Name) &&
      !(owner.hasUsedSkill(ZuoXing.Name) || owner.hasUsedSkill(this.Name))
    );
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown zuoxing card');
    return VirtualCard.create({
      cardName: viewAs,
      bySkill: ZuoXing.Name,
    });
  }
}
