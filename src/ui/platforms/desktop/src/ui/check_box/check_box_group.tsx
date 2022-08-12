import classNames from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { CheckBox } from './check_box';
import styles from './check_box.module.css';
import { CheckBoxGroupPresenter, CheckBoxGroupStore } from './check_box_group_presenter';

export type CheckBoxGroupProps = {
  presenter: CheckBoxGroupPresenter;
  store: CheckBoxGroupStore;
  excludeSelection?: boolean;
  onChecked?(checkedIds: (string | number)[]): void;
  itemsPerLine?: 4 | 5 | 6;
  className?: string;
  head?: string | JSX.Element;
  disabled?: boolean;
};

@observer
export class CheckBoxGroup extends React.Component<CheckBoxGroupProps> {
  private checkedIds = this.props.store.options.filter(o => o.checked).map(o => o.id);

  private readonly onCheck = (index: number, id: string | number) => (checked: boolean) => {
    const { excludeSelection, onChecked, presenter, store } = this.props;
    if (excludeSelection) {
      if (checked) {
        this.checkedIds = [id];
        onChecked?.([id]);
      } else {
        return;
      }
    } else {
      if (checked) {
        this.checkedIds = [...this.checkedIds, id];
        onChecked?.(this.checkedIds);
      } else {
        this.checkedIds = this.checkedIds.filter(checkedId => checkedId !== id);
        onChecked?.(this.checkedIds);
      }
    }

    presenter.onChecked(store, index, checked, excludeSelection);
  };

  render() {
    const { className, head, store, itemsPerLine = 4, disabled } = this.props;
    return (
      <div className={classNames(styles.checkboxGroup, className)}>
        {typeof head === 'string' ? <h3 className={styles.checkboxGroupHead}>{head}</h3> : head}
        {store.options.map((option, index) => {
          return (
            <CheckBox
              {...option}
              key={index}
              className={classNames({
                [styles.regularCheckBox]: itemsPerLine === 4,
                [styles.squashCheckBox]: itemsPerLine === 5,
                [styles.smashCheckBox]: itemsPerLine === 6,
              })}
              disabled={disabled || option.disabled}
              onChecked={this.onCheck(index, option.id)}
            />
          );
        })}
      </div>
    );
  }
}
