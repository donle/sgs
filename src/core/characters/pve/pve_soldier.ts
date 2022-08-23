import { Character, CharacterGender, CharacterNationality } from 'core/characters/character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import {
  PveClassicLianZhen,
  PveClassicQiSha,
  PveClassicTianJi,
  PveClassicTianLiang,
  PveClassicTianTong,
  PveClassicTianXiang,
} from 'core/skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class PveSoldier extends Character {
  constructor(id: number) {
    super(id, 'pve_soldier', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, []);
  }
}

export class PveTianTong extends Character {
  constructor(id: number) {
    super(id, 'pve_tiantong', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveClassicTianTong.Name),
    ]);
  }
}

export class PveTianLiang extends Character {
  constructor(id: number) {
    super(id, 'pve_tianliang', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveClassicTianLiang.Name),
    ]);
  }
}

export class PveTianJi extends Character {
  constructor(id: number) {
    super(id, 'pve_tianji', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveClassicTianJi.Name),
    ]);
  }
}

export class PveTianXiang extends Character {
  constructor(id: number) {
    super(id, 'pve_tianxiang', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveClassicTianXiang.Name),
    ]);
  }
}

export class PveQiSha extends Character {
  constructor(id: number) {
    super(id, 'pve_qisha', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      skillLoaderInstance.getSkillByName(PveClassicQiSha.Name),
    ]);
  }
}

export class PveLianZhen extends Character {
  constructor(id: number) {
    super(id, 'pve_lianzhen', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, [
      ...skillLoaderInstance.getSkillsByName(PveClassicLianZhen.GeneralName),
    ]);
  }
}
