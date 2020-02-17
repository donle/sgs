import { History } from 'history';
import * as React from 'react';
import { match } from 'react-router-dom';

export class RoomPage extends React.Component<{
  match: match<{ slug: string }>;
  history: History<History.PoorMansUnknown>;
}> {
  render() {
    return <div>{this.props.match.params.slug}</div>;
  }
}
