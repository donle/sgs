import * as mobx from 'mobx';
import { CheckBoxProps } from './check_box';

export class CheckBoxGroupStore {
  @mobx.observable.ref
  options: Omit<CheckBoxProps, 'onChecked'>[];
}
