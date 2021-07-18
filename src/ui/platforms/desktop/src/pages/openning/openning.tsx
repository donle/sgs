import descriptionImage from 'assets/images/lobby/description.png';
import logoImage from 'assets/images/lobby/logo.png';
import * as React from 'react';
import { PagePropsWithConfig } from 'types/page_props';
import styles from './openning.module.css';

export class OpenningPage extends React.PureComponent<PagePropsWithConfig> {
  private timeoutId: NodeJS.Timeout;

  private readonly jumpToLobby = () => {
    this.props.history.push('/lobby');
  };

  componentDidMount() {
    document.addEventListener('keydown', this.jumpToLobby);
    this.timeoutId = setTimeout(() => {
      this.jumpToLobby();
    }, 6000);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.jumpToLobby);
    clearTimeout(this.timeoutId);
  }

  render() {
    return (
      <div className={styles.scene} onClick={this.jumpToLobby}>
        <img className={styles.logo} src={logoImage} alt="logo" />
        <img className={styles.description} src={descriptionImage} alt="description" />
      </div>
    );
  }
}
