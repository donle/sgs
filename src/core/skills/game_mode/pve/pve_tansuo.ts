import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { CardUseStage } from 'core/game/stage_processor';
import { AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { PveHuaShen } from './pve_huashen';

@PersistentSkill({ stubbornSkill: true })
@CompulsorySkill({ name: 'pve_tansuo', description: 'pve_tansuo_description' })
export class PveTanSuo extends TriggerSkill {
  private treasure = 0;
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage: CardUseStage) {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    const cardNumber = Sanguosha.getCardById(event.cardId).CardNumber;
    return event.fromId !== owner.Id && cardNumber > 0 && room.getMark(owner.Id, MarkEnum.PveHuaShen) < 3;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = undefined;
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const { fromId, cardId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const longshen = room.getPlayerById(event.fromId);
    const longshenlv = PveHuaShen.CHARACTERS.length - room.getMark(longshen.Id, MarkEnum.PveHuaShen);
    const cardup = longshen.getFlag<string[]>(this.GeneralName) || [];
    const feihua = room.getPlayerById(fromId).getFlag<number>('pve_feihua') || 0;
    const cardNumber = Sanguosha.getCardById(cardId).CardNumber;
    const encounter = !room.getFlag(event.fromId, PveHuaShen.pveHardMode) ? Math.floor(Math.random() * 350 + 1) : Math.floor(Math.random() * 200 + 1);
    const cardcounter = room.Analytics.getCardUseRecord(fromId, 'round').length;
    if (cardNumber-feihua > encounter / cardcounter) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} ouyujiguan',
          room.getPlayerById(fromId).Name,
        ).extract(),
      });
      const damage = Math.floor(Math.random() * (longshenlv - 2) + 1);
      await room.damage({
        fromId: undefined,
        toId: fromId,
        damage,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
      if (encounter / cardcounter-feihua >= 10 && encounter / cardcounter-feihua <= 16) {
        await room.changeMaxHp(fromId, -1);
      }
      if (cardNumber-feihua / (encounter / cardcounter) > 2) {
        room.broadcast(GameEventIdentifiers.CustomGameDialog, {
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} ouyujiguan',
            room.getPlayerById(fromId).Name,
          ).extract(),
        });
        await room.loseHp(fromId, damage);
      }
    }
    if ((encounter >= 30 && encounter < 40) || (encounter >= 1 && encounter < 5)) {
      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} qiyubaowu',
          room.getPlayerById(fromId).Name,
        ).extract(),
      });
      if ((encounter >= 22 && encounter < 25) || encounter === 2) {
        await room.drawCards(Math.floor(Math.random() * longshenlv + 1), fromId, 'top', fromId);
      }
      if (encounter === 21 || encounter === 18 || encounter === 3) {
        await room.recover({
          recoverBy: undefined,
          recoveredHp: Math.floor(Math.random() * longshenlv + 1),
          toId: fromId,
        });
      }
      if (encounter === 20 || encounter === 19) {
        this.treasure = 0;
        if (cardup.length < 9) {
          const trcard = Sanguosha.getCardNameByType(
            types => types.includes(CardType.Trick) || types.includes(CardType.Basic) ,
          );
          const upcard = Math.floor(Math.random() * 4 + 1);
          const options = [
            trcard[Math.floor(Math.random() * trcard.length)],
            trcard[Math.floor(Math.random() * trcard.length)],
            trcard[Math.floor(Math.random() * trcard.length)],
          ];
          const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
            options,
            toId: fromId,
            conversation: 'pve_huashen: please make a card' + upcard,
            triggeredBySkills: [this.Name],
          };
          room.notify(
            GameEventIdentifiers.AskForChoosingOptionsEvent,
            EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
              askForChoosingOptionsEvent,
            ),
            fromId,
          );

          const { selectedOption } = await room.onReceivingAsyncResponseFrom(
            GameEventIdentifiers.AskForChoosingOptionsEvent,
            fromId,
          );
          if (selectedOption) {
            cardup.push(selectedOption + upcard);
          }
        }
      }
      if (encounter === 4) {
        await room.changeMaxHp(fromId, 1);
      }
      if (encounter === 1 && this.treasure === 0) {
        this.treasure = 1;
        const pveHuashenCharacters = room.getRandomCharactersFromLoadedPackage(4);
        const askForChoosingCharacterEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent> = {
          amount: 1,
          characterIds: pveHuashenCharacters,
          toId: fromId,
          byHuaShen: true,
          triggeredBySkills: [this.Name],
        };

        room.notify(GameEventIdentifiers.AskForChoosingCharacterEvent, askForChoosingCharacterEvent, fromId);

        const { chosenCharacterIds } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingCharacterEvent,
          fromId,
        );

        const options = Sanguosha.getCharacterById(chosenCharacterIds[0])
          .Skills.filter(skill => !(skill.isShadowSkill() || skill.isLordSkill()))
          .map(skill => skill.GeneralName);

        const askForChoosingOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          options,
          toId: fromId,
          conversation: 'pve_huashen: please announce a skill to obtain',
          triggeredBySkills: [this.Name],
        };

        room.notify(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(
            askForChoosingOptionsEvent,
          ),
          fromId,
        );

        const { selectedOption } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          fromId,
        );

        await room.obtainSkill(fromId, selectedOption!, true);
      }
    }
    return true;
  }
}

@ShadowSkill
@PersistentSkill({ stubbornSkill: true })
@CompulsorySkill({ name: PveTanSuo.Name, description: PveTanSuo.Description })
export class PveTanSuoShow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage: CardUseStage) {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return event.fromId !== owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = undefined;
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const { fromId, cardId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const longshen = room.getPlayerById(event.fromId);
    const cardup = longshen.getFlag<string[]>(this.GeneralName) || [];

    const cardName = Sanguosha.getCardById(cardId).Name;
    for (const up of cardup) {
      if (up === cardName + '1') {
        await room.drawCards(1, fromId, 'top', fromId);
      }
      if (up === cardName + 2) {
        const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
          toId: fromId,
          players: room.getAlivePlayersFrom().map(p => p.Id),
          requiredAmount: 1,
          conversation: 'pve_huashen:choose a role losehp 1',
        };

        room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForPlayerChoose, fromId);

        const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          fromId,
        );
        if (selectedPlayers) {
          await room.loseHp(selectedPlayers[0], 1);
        }
      }
      if (up === cardName + 3) {
        const dam = Math.floor(Math.random() * 3 + 1);
        const askForPlayerChoose: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
          toId: fromId,
          players: room.getAlivePlayersFrom().map(p => p.Id),
          requiredAmount: 1,
          conversation: 'pve_huashen:choose a role damage',
        };

        room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, askForPlayerChoose, fromId);

        const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          fromId,
        );
        if (selectedPlayers) {
          await room.damage({
            fromId: undefined,
            toId: selectedPlayers[0],
            damage: dam,
            damageType: DamageType.Normal,
            triggeredBySkills: [this.Name],
          });
        }
      }
      if (up === cardName + 4) {
        await room.recover({ recoverBy: undefined, recoveredHp: Math.floor(Math.random() * 3 + 1), toId: fromId });
      }
    }
    return true;
  }
}
