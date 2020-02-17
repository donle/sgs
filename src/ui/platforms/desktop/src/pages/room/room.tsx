import * as React from 'react';
import { useParams } from 'react-router-dom';

export const RoomPage = () => {
  const { slug } = useParams<{ slug: string }>();
  return <div>{slug}</div>;
};
