import * as mobx from 'mobx';
import { ClientCard } from '../card/card';

export class DashboardStore {
  @mobx.observable.shallow
  playerHandCards: ClientCard[] = [];
  @mobx.observable.ref
  weaponCard: ClientCard | undefined;
  @mobx.observable.ref
  armorCard: ClientCard | undefined;
  @mobx.observable.ref
  defenseHorseCard: ClientCard | undefined;
  @mobx.observable.ref
  offenseHorseCard: ClientCard | undefined;
}
