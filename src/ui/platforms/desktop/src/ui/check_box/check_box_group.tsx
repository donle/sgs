import classNames from 'classnames';
import * as React from 'react';
import { CheckBox, CheckBoxProps } from './check_box';
import styles from './check_box.module.css';

export type CheckBoxGroupProps = {
  options: Omit<CheckBoxProps, 'onChecked'>[];
  excludeSelection?: boolean;
  onChecked?(checkedIds: (string | number)[]): void;
  itemsPerLine?: 4 | 5 | 6;
  className?: string;
};

export const CheckBoxGroup = ({ options, excludeSelection, onChecked, itemsPerLine = 4, className }: CheckBoxGroupProps) => {
  const [checkedIds, setCheckedIds] = React.useState<(string | number)[]>(
    options.filter(o => o.checked).map(o => o.id),
  );
  const [checkedIndex, setCheckedIndex] = React.useState<boolean[]>(options.map(o => o.checked));

  const onCheck = (index: number, id: string | number) => (checked: boolean) => {
    if (excludeSelection) {
      if (checked) {
        setCheckedIds([id]);
        onChecked?.([id]);
      } else {
        setCheckedIds([]);
        onChecked?.([]);
      }

      setCheckedIndex(prevCheckedIndex => {
        return prevCheckedIndex.map((checkedIndex, i) => (i === index ? checked : false));
      });
    } else {
      if (checked) {
        setCheckedIds(prev => [...prev, id]);
        onChecked?.([...checkedIds, id]);
      } else {
        setCheckedIds(prev => prev.filter(checkedId => checkedId !== id));
        onChecked?.(checkedIds.filter(checkedId => checkedId !== id));
      }

      setCheckedIndex(prevCheckedIndex => {
        prevCheckedIndex[index] = checked;
        return prevCheckedIndex.slice();
      });
    }
  };

  return (
    <div className={classNames(styles.checkboxGroup, className)}>
      {options.map((option, index) => (
        <CheckBox
          {...option}
          key={index}
          className={classNames({
            [styles.regularCheckBox]: itemsPerLine === 4,
            [styles.squashCheckBox]: itemsPerLine === 5,
            [styles.smashCheckBox]: itemsPerLine === 6,
          })}
          onChecked={onCheck(index, option.id)}
          checked={checkedIndex[index]}
        />
      ))}
    </div>
  );
};
