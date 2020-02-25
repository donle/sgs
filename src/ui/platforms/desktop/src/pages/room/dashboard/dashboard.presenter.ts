import * as mobx from 'mobx';
import { ClientCard } from '../card/card';
import { DashboardStore } from './dashboard.store';

export class DashboardPresenter {
  public createStore() {
    return new DashboardStore();
  }

  @mobx.action
  obtainCard() {}
}
