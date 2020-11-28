import descriptionImage from 'assets/images/lobby/description.png';
import logoImage from 'assets/images/lobby/logo.png';
import * as React from 'react';
import { PagePropsWithConfig } from 'types/page_props';
import styles from './openning.module.css';

export class OpenningPage extends React.PureComponent<PagePropsWithConfig> {

  componentDidMount() {
    setTimeout(() => {
      this.props.history.push('/lobby');
    }, 6000);
  }

  render() {
    return (
      <div className={styles.scene}>
        <img className={styles.logo} src={logoImage} alt="logo" />
        <img className={styles.description} src={descriptionImage} alt="description" />
      </div>
    );
  }
}
