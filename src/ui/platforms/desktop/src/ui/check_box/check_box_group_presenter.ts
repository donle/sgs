import * as mobx from 'mobx';
import { CheckBoxProps } from './check_box';

export class CheckBoxGroupPresenter {
  createStore<Value>(options: Omit<CheckBoxProps<Value>, 'onChecked'>[]) {
    return new CheckBoxGroupStore<Value>(options);
  }

  @mobx.action
  onChecked<Value>(store: CheckBoxGroupStore<Value>, index: number, checked: boolean, exclusive?: boolean) {
    for (let i = 0; i < store.options.length; i++) {
      const option = store.options[i];
      option.checked = exclusive ? (index === i ? checked : false) : index === i ? checked : option.checked;
    }
  }
}

export class CheckBoxGroupStore<Value = string | number> {
  @mobx.observable
  public options: Omit<CheckBoxProps<Value>, 'onChecked'>[] = [];
  constructor(_options: Omit<CheckBoxProps<Value>, 'onChecked'>[]) {
    mobx.runInAction(() => {
      this.options.push(..._options);
    });
  }
}
