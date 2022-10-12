import { Card, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterNationality } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { BaiYi, JingLve, QuanJi, TunTian, WuKu, ZhengRong } from 'core/skills';
import { ZuoXing } from 'core/skills/characters/god/zuoxing';
import { ZhanYuan } from 'core/skills/characters/limited/zhanyuan';
import { JiBing } from 'core/skills/characters/mobile/jibing';
import { ZhanYi } from 'core/skills/characters/mobile/zhanyi';
import { MouLi } from 'core/skills/characters/sincerity/mouli';
import { GuJu } from 'core/skills/characters/sp/guju';
import { LiangZhu } from 'core/skills/characters/sp/liangzhu';
import { Precondition } from './precondition/precondition';
import { MarkEnum } from '../types/mark_list';

export namespace System {
  export const MainThread = {
    sleep: async (milliseconds: number) => new Promise<void>(r => setTimeout(r, milliseconds)),
  };

  export const enum AskForChoosingCardEventFilter {
    SheLie,
    PoXi,
    JieYue,
    ChengXiang,
    JiuFa,
  }

  const differentCardSuitFilterFunction = (allCards: CardId[], selected: CardId[], currentCard: CardId) => {
    const card = Sanguosha.getCardById(currentCard);
    return (
      selected.includes(currentCard) ||
      selected.find(cardId => Sanguosha.getCardById(cardId).Suit === card.Suit) === undefined
    );
  };

  const differentCardNumberFilterFunction = (allCards: CardId[], selected: CardId[], currentCard: CardId) => {
    const card = Sanguosha.getCardById(currentCard);
    return (
      selected.includes(currentCard) ||
      selected.find(cardId => Sanguosha.getCardById(cardId).CardNumber === card.CardNumber) === undefined
    );
  };

  const differentCardAreaFilterFunction = (
    allCards: CardId[],
    selected: CardId[],
    currentCard: CardId,
    involvedTargets?: Player[],
  ) => {
    const from = Precondition.exists(involvedTargets, 'unknown involvedTargets')[0];
    const currentArea = from.cardFrom(currentCard);

    return (
      selected.includes(currentCard) || selected.find(cardId => from.cardFrom(cardId) === currentArea) === undefined
    );
  };

  const thirteenPointFilterFunction = (allCards: CardId[], selected: CardId[], currentCard: CardId) => {
    if (selected.includes(currentCard)) {
      return true;
    }
    const totalPoint: number = selected.reduce<number>(
      (total, card) => total + Sanguosha.getCardById(card).CardNumber,
      0,
    );
    const card = Sanguosha.getCardById(currentCard);
    return totalPoint + card.CardNumber <= 13;
  };

  export type AskForChoosingCardEventFilterFunc = (
    allCards: CardId[],
    selected: CardId[],
    currentCard: CardId,
    involvedTargets?: Player[],
  ) => boolean;

  export const AskForChoosingCardEventFilters: {
    [K in AskForChoosingCardEventFilter]: AskForChoosingCardEventFilterFunc;
  } = {
    [AskForChoosingCardEventFilter.PoXi]: differentCardSuitFilterFunction,
    [AskForChoosingCardEventFilter.SheLie]: differentCardSuitFilterFunction,
    [AskForChoosingCardEventFilter.JieYue]: differentCardAreaFilterFunction,
    [AskForChoosingCardEventFilter.ChengXiang]: thirteenPointFilterFunction,
    [AskForChoosingCardEventFilter.JiuFa]: differentCardNumberFilterFunction,
  };

  export type SideEffectSkillApplierFunc = (player: Player, room: Room, sourceId: PlayerId) => boolean;

  export const enum SideEffectSkillApplierEnum {
    ZhiBa,
    HuangTian,
    XianSi,
    MouLi,
    ZuoXing,
    WenGua,
    ZhanYi,
    PveLongShenQiFu,
  }

  export const SideEffectSkillAppliers: { [K in SideEffectSkillApplierEnum]: SideEffectSkillApplierFunc } = {
    [SideEffectSkillApplierEnum.ZhiBa]: (player: Player, room: Room, sourceId: PlayerId) =>
      player.Nationality === CharacterNationality.Wu && player.Id !== sourceId,
    [SideEffectSkillApplierEnum.HuangTian]: (player: Player, room: Room, sourceId: PlayerId) =>
      player.Nationality === CharacterNationality.Qun && player.Id !== sourceId,
    [SideEffectSkillApplierEnum.XianSi]: (player: Player, room: Room, sourceId: PlayerId) => player.Id !== sourceId,
    [SideEffectSkillApplierEnum.MouLi]: (player: Player, room: Room) => player.getFlag(MouLi.MouLiLi),
    [SideEffectSkillApplierEnum.ZuoXing]: (player: Player, room: Room) => player.getFlag(ZuoXing.Name),
    [SideEffectSkillApplierEnum.WenGua]: (player: Player, room: Room, sourceId: PlayerId) => player.Id !== sourceId,
    [SideEffectSkillApplierEnum.ZhanYi]: (player: Player, room: Room) => player.getFlag(ZhanYi.Name) !== undefined,
    [SideEffectSkillApplierEnum.PveLongShenQiFu]: (player: Player, _: Room, sourceId: PlayerId) =>
      player.Id !== sourceId,
  };

  export type AwakeningSkillApplierFunc = (room: Room, player: Player) => boolean;

  export const enum SkillTagsTransformEnum {
    DingHan = 'dinghan',
    JiuFa = 'jiufa',
  }

  export const enum AwakeningSkillApplierEnum {
    BaiYin = 'baiyin',
    HunZi = 'hunzi',
    RuoYu = 'ruoyu',
    ZaoXian = 'zaoxian',
    ZhiJi = 'zhiji',
    QianXin = 'qianxin',
    QinXue = 'qinxue',
    HongJu = 'hongju',
    PoShi = 'poshi',
    ZhiSanChen = 'zhi_sanchen',
    ChengZhang = 'chengzhang',
    Zili = 'zili',
    GodTianYi = 'god_tianyi',
    FanXiang = 'fanxiang',
    JuYi = 'juyi',
    BaiJia = 'baijia',
    ShanLi = 'shanli',
    MangQing = 'mangqing',
    ChouJue = 'choujue',
    BeiShui = 'beishui',
    MouCuan = 'moucuan',
    ZhuangRong = 'zhuangrong',
    WuJi = 'wuji',
    DuJiang = 'dujiang',
    ZhanYuan = 'zhanyuan',
    PveClassicGuYong = 'pve_classic_guyong',
  }

  export const AwakeningSkillApplier: { [K in AwakeningSkillApplierEnum]: AwakeningSkillApplierFunc } = {
    [AwakeningSkillApplierEnum.BaiYin]: (room: Room, player: Player) => player.getMark(MarkEnum.Ren) > 3,
    [AwakeningSkillApplierEnum.HunZi]: (room: Room, player: Player) => player.Hp <= 2,
    [AwakeningSkillApplierEnum.RuoYu]: (room: Room, player: Player) =>
      room.getOtherPlayers(player.Id).find(p => p.Hp < player.Hp) === undefined,
    [AwakeningSkillApplierEnum.ZaoXian]: (room: Room, player: Player) =>
      player.getCardIds(PlayerCardsArea.OutsideArea, TunTian.Name).length > 2,
    [AwakeningSkillApplierEnum.ZhiJi]: (room: Room, player: Player) =>
      player.getCardIds(PlayerCardsArea.HandArea).length <= 0,
    [AwakeningSkillApplierEnum.QianXin]: (room: Room, player: Player) => player.LostHp > 0,
    [AwakeningSkillApplierEnum.QinXue]: (room: Room, player: Player) =>
      player.getCardIds(PlayerCardsArea.HandArea).length - player.Hp >= 2,
    [AwakeningSkillApplierEnum.HongJu]: (room: Room, player: Player) =>
      player.getCardIds(PlayerCardsArea.OutsideArea, ZhengRong.Name).length > 2,
    [AwakeningSkillApplierEnum.PoShi]: (room: Room, player: Player) =>
      player.Hp === 1 || player.AvailableEquipSections.length === 0,
    [AwakeningSkillApplierEnum.ZhiSanChen]: (room: Room, player: Player) => player.getFlag<number>(WuKu.Name) >= 3,
    [AwakeningSkillApplierEnum.ChengZhang]: (room: Room, player: Player) =>
      room.Analytics.getDamage(player.Id) + room.Analytics.getDamaged(player.Id) >= 7,
    [AwakeningSkillApplierEnum.Zili]: (room: Room, player: Player) =>
      player.getCardIds(PlayerCardsArea.OutsideArea, QuanJi.Name).length > 2,
    [AwakeningSkillApplierEnum.GodTianYi]: (room: Room, player: Player) =>
      room
        .getAlivePlayersFrom()
        .find(player => room.Analytics.getDamagedRecord(player.Id, undefined, undefined, 1).length === 0) === undefined,
    [AwakeningSkillApplierEnum.FanXiang]: (room: Room, player: Player) => {
      const players = player.getFlag<PlayerId[]>(LiangZhu.Name);
      return players && players.find(p => room.getPlayerById(p).LostHp > 0) !== undefined;
    },
    [AwakeningSkillApplierEnum.JuYi]: (room: Room, player: Player) => player.MaxHp > room.AlivePlayers.length,
    [AwakeningSkillApplierEnum.BaiJia]: (room: Room, player: Player) => player.getFlag<number>(GuJu.Name) >= 7,
    [AwakeningSkillApplierEnum.ShanLi]: (room: Room, player: Player) =>
      player.hasUsedSkill(BaiYi.Name) && (player.getFlag<PlayerId[]>(JingLve.Name) || []).length >= 2,
    [AwakeningSkillApplierEnum.MangQing]: (room: Room, player: Player) =>
      room.AlivePlayers.filter(player => player.LostHp > 0).length > player.Hp,
    [AwakeningSkillApplierEnum.ChouJue]: (room: Room, player: Player) =>
      Math.abs(player.Hp - player.getCardIds(PlayerCardsArea.HandArea).length) >= 3,
    [AwakeningSkillApplierEnum.BeiShui]: (room: Room, player: Player) =>
      player.Hp < 2 || player.getCardIds(PlayerCardsArea.HandArea).length < 2,
    [AwakeningSkillApplierEnum.PveClassicGuYong]: (room: Room, player: Player) =>
      [MarkEnum.PveTanLang, MarkEnum.PveWenQu, MarkEnum.PveWuQu, MarkEnum.PvePoJun].every(
        mark => player.getMark(mark) > 0,
      ),
    [AwakeningSkillApplierEnum.MouCuan]: (room: Room, player: Player) =>
      player.getCardIds(PlayerCardsArea.OutsideArea, JiBing.Name).length >=
      room.AlivePlayers.reduce<CharacterNationality[]>((allNations, p) => {
        if (!allNations.includes(p.Nationality)) {
          allNations.push(p.Nationality);
        }
        return allNations;
      }, []).length,
    [AwakeningSkillApplierEnum.ZhuangRong]: (room: Room, player: Player) =>
      player.Hp === 1 || player.getCardIds(PlayerCardsArea.HandArea).length === 1,
    [AwakeningSkillApplierEnum.WuJi]: (room: Room, player: Player) => room.Analytics.getDamage(player.Id, 'round') > 2,
    [AwakeningSkillApplierEnum.DuJiang]: (room: Room, player: Player) => player.Armor > 2,
    [AwakeningSkillApplierEnum.ZhanYuan]: (room: Room, player: Player) => player.getFlag<number>(ZhanYuan.Name) > 7,
    [AwakeningSkillApplierEnum.PveClassicGuYong]: (room: Room, player: Player) =>
      [MarkEnum.PveTanLang, MarkEnum.PveWenQu, MarkEnum.PveWuQu, MarkEnum.PvePoJun].every(
        mark => player.getMark(mark) > 0,
      ),
  };

  export const SkillTagsTransformer: Record<string, (values: any[]) => (Card | Character)[]> = {
    [SkillTagsTransformEnum.DingHan]: (cardNames: string[]) =>
      cardNames.map(cardName => VirtualCard.create({ cardName, bySkill: SkillTagsTransformEnum.DingHan })),
    [SkillTagsTransformEnum.JiuFa]: (cardNames: string[]) =>
      cardNames.map(cardName => VirtualCard.create({ cardName, bySkill: SkillTagsTransformEnum.JiuFa })),
  };
}
