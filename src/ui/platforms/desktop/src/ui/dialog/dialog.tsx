import classNames from 'classnames';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Curtain } from 'ui/curtain/curtain';
import styles from './dialog.module.css';

@mobxReact.observer
export class Dialog extends React.Component<{ className?: string; children?: React.ReactNode; onClose?(): void }> {
  private moving = false;
  private onElementRendered = React.createRef<HTMLDivElement>();
  private Container = (props: { children?: React.ReactNode }) =>
    this.props.onClose !== undefined ? (
      <Curtain onCancel={this.props.onClose}>{props.children}</Curtain>
    ) : (
      <>{props.children}</>
    );

  @mobx.observable.ref
  topOffset: number;
  @mobx.observable.ref
  leftOffset: number;

  private posX: number;
  private posY: number;

  private readonly onMouseDown = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.moving = true;
    this.posX = e.clientX;
    this.posY = e.clientY;
  };

  @mobx.action
  private readonly onMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!this.moving) {
      return;
    }

    this.leftOffset += e.clientX - this.posX;
    this.topOffset += e.clientY - this.posY;
    this.posX = e.clientX;
    this.posY = e.clientY;
  };

  private readonly onMouseUp = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.moving = false;
  };

  @mobx.action
  componentDidMount() {
    if (!this.onElementRendered.current) {
      return;
    }

    this.topOffset = this.onElementRendered.current.getBoundingClientRect().top;
    this.leftOffset = this.onElementRendered.current.getBoundingClientRect().left;
  }

  render() {
    return (
      <this.Container>
        <div
          className={classNames(styles.dialog, this.props.className)}
          onMouseMove={this.onMouseMove}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          ref={this.onElementRendered}
          style={{ top: this.topOffset, left: this.leftOffset }}
        >
          {this.props.children}
        </div>
      </this.Container>
    );
  }
}
