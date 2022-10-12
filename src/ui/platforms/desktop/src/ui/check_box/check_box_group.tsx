import { CheckBox, CheckBoxProps } from './check_box';
import styles from './check_box.module.css';
import classNames from 'classnames';
import * as mobxReact from 'mobx-react';
import * as React from 'react';

export type CheckBoxGroupProps = {
  options: Omit<CheckBoxProps, 'onChecked'>[];
  excludeSelection?: boolean;
  onChecked?(checkedIds: (string | number)[]): void;
  itemsPerLine?: 4 | 5 | 6;
  className?: string;
  head?: string | JSX.Element;
  disabled?: boolean;
};

@mobxReact.observer
export class CheckBoxGroup extends React.Component<CheckBoxGroupProps> {
  private checkedIds = this.props.options.filter(o => o.checked).map(o => o.id);

  private readonly onCheck = (id: string | number) => (checked: boolean) => {
    if (this.props.excludeSelection) {
      if (checked) {
        this.checkedIds = [id];
        this.props.onChecked?.(this.checkedIds);
      }
    } else {
      if (checked) {
        this.checkedIds = [...this.checkedIds, id];
        this.props.onChecked?.(this.checkedIds);
      } else {
        this.checkedIds = this.checkedIds.filter(checkedId => checkedId !== id);
        this.props.onChecked?.(this.checkedIds);
      }
    }
  };

  render() {
    const { className, options, itemsPerLine = 4, head, disabled } = this.props;
    return (
      <div className={classNames(styles.checkboxGroup, className)}>
        {typeof head === 'string' ? <h3 className={styles.checkboxGroupHead}>{head}</h3> : head}
        {options.map((option, index) => (
          <CheckBox
            {...option}
            key={index}
            className={classNames({
              [styles.regularCheckBox]: itemsPerLine === 4,
              [styles.squashCheckBox]: itemsPerLine === 5,
              [styles.smashCheckBox]: itemsPerLine === 6,
            })}
            disabled={disabled || option.disabled}
            onChecked={this.onCheck(option.id)}
          />
        ))}
      </div>
    );
  }
}
