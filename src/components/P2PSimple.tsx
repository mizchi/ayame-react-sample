import * as React from 'react';
export interface P2PSimpleProps {
  title: string;
}
export const P2PSimple = (props: P2PSimpleProps) => (
  <h1>
    {props.title}
  </h1>
);
