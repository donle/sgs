import styles from './dialog.module.css';
import classNames from 'classnames';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Curtain } from 'ui/curtain/curtain';

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

  private readonly onMouseDown = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) => {
    if (e.currentTarget !== e.target) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
    this.moving = true;
    const clientX =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientX;
    const clientY =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientY ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientY;

    this.posX = clientX;
    this.posY = clientY;
  };

  @mobx.action
  private readonly onMouseMove = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) => {
    if (!this.moving || e.currentTarget !== e.target) {
      return;
    }
    e.stopPropagation();
    e.preventDefault();

    const clientX =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientX;
    const clientY =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientY ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientY;
    this.leftOffset += clientX - this.posX;
    this.topOffset += clientY - this.posY;
    this.posX = clientX;
    this.posY = clientY;
  };

  private readonly onMouseUp = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) => {
    if (e.currentTarget !== e.target) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();
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
          onTouchEnd={this.onMouseUp}
          onTouchStart={this.onMouseDown}
          onTouchMove={this.onMouseMove}
          ref={this.onElementRendered}
          style={{ top: this.topOffset, left: this.leftOffset }}
        >
          {this.props.children}
        </div>
      </this.Container>
    );
  }
}
