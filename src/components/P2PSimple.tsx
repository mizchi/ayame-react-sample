import * as React from 'react';
import styled from 'styled-components';
export interface P2PSimpleProps {
  title: string;
  wsUrl: string;
}

export interface P2PSimpleState {
  isLoading: boolean;
}

const Main = styled.div`
  text-align: center;
`
const Title = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 40px;
`

const Button = styled.button`
  background-color: #4285f4;
  border: none;
  border-radius: 2px;
  box-shadow: 1px 1px 5px 0 rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 0.8em;
  height: 2.75em;
  margin: 0 5px 20px 5px;
  padding: 0.5em 0.7em 0.5em 0.7em;
  width: 8em;
`
const Buttons = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 120px;
`

const Videos = styled.div`
  font-size: 0;
  pointer-events: none;
  position: absolute;
  transition: all 1s;
  width: 100%;
  height: 100%;
  display: block;
`

const RemoteVideo = styled.video`
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  object-fit: cover;
  transform: scale(-1, 1);
  transition: opacity 1s;
  width: 100%;
`
const LocalVideo = styled.video`
  z-index: 2;
  border: 1px solid gray;
  bottom: 20px;
  right: 20px;
  max-height: 17%;
  max-width: 17%;
  position: absolute;
  transition: opacity 1s;
`

class P2PSimple extends React.Component<P2PSimpleProps, P2PSimpleState> {
  constructor(props: P2PSimpleProps) {
    super(props);
  }
  render() {
    return (
      <Main>
      <Title>
      <h2>{this.props.title}</h2>
      <label htmlFor="url">シグナリングサーバのURL:</label>
      <input type="text" id="url" value={this.props.wsUrl} required />
      </Title>
      <Buttons>
      <Button type="button">接続</Button>
      <Button type="button" >切断</Button>
      </Buttons>
      <Videos>
      <RemoteVideo autoPlay />
      <LocalVideo autoPlay muted />
      </Videos>
      </Main>
    );
  }
}

export default P2PSimple;
