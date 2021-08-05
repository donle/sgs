import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CircleSkill,
  CommonSkill,
  FilterSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

type TianSuanMapper = { [playerId: string]: string[] };

@CircleSkill
@CommonSkill({ name: 'tiansuan', description: 'tiansuan_description' })
export class TianSuan extends ActiveSkill implements OnDefineReleaseTiming {
  public static readonly TianSuanStricks = [
    'tiansuan:upup',
    'tiansuan:up',
    'tiansuan:mid',
    'tiansuan:down',
    'tiansuan:downdown',
  ];
  public static readonly TianSuanTargets = 'tiansuan_targets';

  public async whenDead(room: Room, player: Player) {
    const mappers = player.getFlag<TianSuanMapper>(TianSuan.TianSuanTargets);
    const targets = Object.keys(mappers);

    for (const target of targets) {
      const power = room.getFlag<string[]>(target, this.GeneralName);
      if (room.getPlayerById(target).Dead || !power) {
        continue;
      }
      for (const gift of mappers[target]) {
        const index = power.findIndex(p => p === gift);
        index !== -1 && power.splice(index, 1);
      }

      if (power.length === 0) {
        room.removeFlag(target, this.GeneralName);
        if (room.getPlayerById(target).hasSkill(TianSuanPower.Name)) {
          await room.loseSkill(target, TianSuanPower.Name);
        }
        if (room.getPlayerById(target).hasSkill(TianSuanDebuff.Name)) {
          await room.loseSkill(target, TianSuanDebuff.Name);
        }
        continue;
      }

      if (!power.includes(TianSuan.TianSuanStricks[4]) && room.getPlayerById(target).hasSkill(TianSuanDebuff.Name)) {
        await room.loseSkill(target, TianSuanDebuff.Name);
      }

      const texts = power.reduce<string[]>((stringList, power) => {
        if (!stringList.includes(power)) {
          stringList.push(power);
        }

        return stringList;
      }, []);
      let originalText = '{0}[';
      for (let i = 1; i <= texts.length; i++) {
        originalText = originalText + '{' + i + '}';
      }
      room.setFlag<string[]>(
        target,
        this.GeneralName,
        power,
        TranslationPack.translationJsonPatcher(originalText + ']', ...texts).toString(),
      );
    }

    player.removeFlag(TianSuan.TianSuanTargets);
  }

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }
  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;

    const options = TianSuan.TianSuanStricks;
    const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher('{0}: do you want to add a stick?', this.Name).extract(),
        toId: fromId,
      },
      fromId,
    );

    selectedOption && options.push(selectedOption);

    const result = options[Math.floor(Math.random() * options.length)];

    const players = room.getAlivePlayersFrom().map(player => player.Id);
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players,
        toId: fromId,
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: the result is {1}, please choose a target',
          this.Name,
          result,
        ).extract(),
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedPlayers = response.selectedPlayers || [players[0]];

    const originalPower = room.getFlag<string[]>(response.selectedPlayers[0], this.Name) || [];
    const originalTargets = room.getFlag<TianSuanMapper>(fromId, TianSuan.TianSuanTargets) || {};

    if (
      !originalTargets[response.selectedPlayers[0]] ||
      (originalTargets[response.selectedPlayers[0]] && !originalTargets[response.selectedPlayers[0]].includes(result))
    ) {
      originalPower.push(result);

      const texts = originalPower.reduce<string[]>((stringList, power) => {
        if (!stringList.includes(power)) {
          stringList.push(power);
        }

        return stringList;
      }, []);
      let originalText = '{0}[';
      for (let i = 1; i <= texts.length; i++) {
        originalText = originalText + '{' + i + '}';
      }
      room.setFlag<string[]>(
        response.selectedPlayers[0],
        this.Name,
        originalPower,
        TranslationPack.translationJsonPatcher(originalText + ']', this.Name, ...texts).toString(),
      );

      if (!room.getPlayerById(response.selectedPlayers[0]).hasSkill(TianSuanPower.Name)) {
        await room.obtainSkill(response.selectedPlayers[0], TianSuanPower.Name);
      }
      if (
        result === TianSuan.TianSuanStricks[4] &&
        !room.getPlayerById(response.selectedPlayers[0]).hasSkill(TianSuanDebuff.Name)
      ) {
        await room.obtainSkill(response.selectedPlayers[0], TianSuanDebuff.Name);
      }

      const target = room.getPlayerById(response.selectedPlayers[0]);
      if (
        (result === TianSuan.TianSuanStricks[0] || result === TianSuan.TianSuanStricks[1]) &&
        target.getCardIds().length > 0 &&
        !(
          fromId === response.selectedPlayers[0] &&
          target.getCardIds(PlayerCardsArea.EquipArea).length === 0 &&
          target.getCardIds(PlayerCardsArea.JudgeArea).length === 0
        )
      ) {
        const options: CardChoosingOptions = {
          [PlayerCardsArea.JudgeArea]: target.getCardIds(PlayerCardsArea.JudgeArea),
          [PlayerCardsArea.EquipArea]: target.getCardIds(PlayerCardsArea.EquipArea),
        };

        if (fromId !== response.selectedPlayers[0]) {
          options[PlayerCardsArea.HandArea] =
            result === TianSuan.TianSuanStricks[0]
              ? target.getCardIds(PlayerCardsArea.HandArea)
              : target.getCardIds(PlayerCardsArea.HandArea).length;
        }

        const chooseCardEvent = EventPacker.createUncancellableEvent<
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent
        >({
          fromId,
          toId: response.selectedPlayers[0],
          options,
          triggeredBySkills: [this.Name],
        });

        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
          chooseCardEvent,
          fromId,
        );

        if (resp.selectedCardIndex !== undefined) {
          const cardIds = target.getCardIds(PlayerCardsArea.HandArea);
          resp.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
        } else if (resp.selectedCard === undefined) {
          const cardIds = target.getCardIds();
          resp.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
        }

        await room.moveCards({
          movingCards: [{ card: resp.selectedCard, fromArea: target.cardFrom(resp.selectedCard) }],
          fromId: response.selectedPlayers[0],
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          triggeredBySkills: [this.Name],
        });
      }
    }

    if (
      originalTargets[response.selectedPlayers[0]] &&
      !originalTargets[response.selectedPlayers[0]].includes(result)
    ) {
      originalTargets[response.selectedPlayers[0]].push(result);
    } else if (!originalTargets[response.selectedPlayers[0]]) {
      originalTargets[response.selectedPlayers[0]] = [result];
    }
    room.getPlayerById(fromId).setFlag<TianSuanMapper>(TianSuan.TianSuanTargets, originalTargets);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 'shadow_tiansuan', description: 'shadow_tiansuan_description' })
export class TianSuanPower extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    if (!player.getFlag<string[]>(TianSuan.Name)) {
      return;
    }

    room.removeFlag(player.Id, TianSuan.Name);
    for (const p of room.getAlivePlayersFrom()) {
      const targets = p.getFlag<TianSuanMapper>(TianSuan.TianSuanTargets);
      if (targets && targets[player.Id]) {
        if (Object.keys(targets).length === 1) {
          p.removeFlag(TianSuan.TianSuanTargets);
        } else {
          delete targets[player.Id];
          p.setFlag<TianSuanMapper>(TianSuan.TianSuanTargets, targets);
        }
      }
    }
    await room.loseSkill(player.Id, this.Name);
    player.hasSkill(TianSuanDebuff.Name) && (await room.loseSkill(player.Id, TianSuanDebuff.Name));
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    const power = owner.getFlag<string[]>(TianSuan.Name);
    if (!power || !stage) {
      return false;
    }

    const canUse =
      content.toId === owner.Id &&
      !(stage === DamageEffectStage.DamagedEffect && power.includes(TianSuan.TianSuanStricks[1]) && content.damage < 2);
    if (canUse) {
      owner.setFlag<AllStage>(this.Name, stage);
    }

    return canUse;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, triggeredOnEvent } = event;
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    const power = room.getFlag<string[]>(fromId, TianSuan.Name);
    const stage = room.getFlag<AllStage>(fromId, this.Name);
    if (stage === DamageEffectStage.DamagedEffect) {
      if (power.includes(TianSuan.TianSuanStricks[0])) {
        damageEvent.damage = 0;
        EventPacker.terminate(damageEvent);
        return true;
      }
      if (power.includes(TianSuan.TianSuanStricks[2])) {
        damageEvent.damageType = DamageType.Fire;
        damageEvent.damage = 1;
      }
      power.includes(TianSuan.TianSuanStricks[3]) && damageEvent.damage++;
      if (power.includes(TianSuan.TianSuanStricks[1])) {
        damageEvent.damage = 1;
      }
      power.includes(TianSuan.TianSuanStricks[4]) && damageEvent.damage++;
    } else if (power.includes(TianSuan.TianSuanStricks[1])) {
      await room.drawCards(damageEvent.damage, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TianSuanPower.Name, description: TianSuanPower.Description })
export class TianSuanDebuff extends FilterSkill {
  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    if (room.getFlag<string[]>(owner, TianSuan.Name)?.includes(TianSuan.TianSuanStricks[4])) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ generalName: ['peach', 'alcohol'] }))
      : Sanguosha.getCardById(cardId).GeneralName !== 'peach' ||
          Sanguosha.getCardById(cardId).GeneralName !== 'alcohol';
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TianSuan.Name, description: TianSuan.Description })
export class TianSuanRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
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
      owner.Id === event.toPlayer &&
      event.to === PlayerPhase.PhaseBegin &&
      owner.getFlag<TianSuanMapper>(TianSuan.TianSuanTargets) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const mappers = room.getFlag<TianSuanMapper>(fromId, TianSuan.TianSuanTargets);
    const targets = Object.keys(mappers);

    for (const target of targets) {
      const power = room.getFlag<string[]>(target, this.GeneralName);
      if (room.getPlayerById(target).Dead || !power) {
        continue;
      }
      for (const gift of mappers[target]) {
        const index = power.findIndex(p => p === gift);
        index !== -1 && power.splice(index, 1);
      }

      if (power.length === 0) {
        room.removeFlag(target, this.GeneralName);
        if (room.getPlayerById(target).hasSkill(TianSuanPower.Name)) {
          await room.loseSkill(target, TianSuanPower.Name);
        }
        if (room.getPlayerById(target).hasSkill(TianSuanDebuff.Name)) {
          await room.loseSkill(target, TianSuanDebuff.Name);
        }
        continue;
      }

      if (!power.includes(TianSuan.TianSuanStricks[4]) && room.getPlayerById(target).hasSkill(TianSuanDebuff.Name)) {
        await room.loseSkill(target, TianSuanDebuff.Name);
      }

      const texts = power.reduce<string[]>((stringList, power) => {
        if (!stringList.includes(power)) {
          stringList.push(power);
        }

        return stringList;
      }, []);
      let originalText = '{0}[';
      for (let i = 1; i <= texts.length; i++) {
        originalText = originalText + '{' + i + '}';
      }
      room.setFlag<string[]>(
        target,
        this.GeneralName,
        power,
        TranslationPack.translationJsonPatcher(originalText + ']', this.GeneralName, ...texts).toString(),
      );
    }

    room.getPlayerById(fromId).removeFlag(TianSuan.TianSuanTargets);

    return true;
  }
}
