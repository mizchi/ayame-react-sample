import * as React from 'react';
import styled from 'styled-components';
import { randomString } from '../utils';
export interface P2PSimpleProps {
  title: string;
}

export interface P2PSimpleState {
  isNegotiating: boolean;
  wsUrl: string;
  ws: WebSocket | null;
  peer: RTCPeerConnection | null;
  localStream: MediaStream | null;
  roomId: string;
}

const initialState: P2PSimpleState = {
  isNegotiating: false,
  wsUrl: 'ws://localhost:3000/ws',
  ws: null,
  peer: null,
  localStream: null,
  roomId: randomString(9)
};

const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
const peerConnectionConfig = {
  iceServers,
};

class P2PSimple extends React.Component<P2PSimpleProps, P2PSimpleState> {
  private localVideoRef = React.createRef<HTMLVideoElement>();
  private remoteVideoRef = React.createRef<HTMLVideoElement>();

  constructor(props: P2PSimpleProps) {
    super(props);
    this.state = initialState;
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
  }

  public render() {
    return (
      <Main>
      <Title>
      <h2>{this.props.title}</h2>
      </Title>
      <Inputs>
      <Input>
      <label htmlFor='url'>シグナリングサーバのURL:</label>
      <input className='input' type='text' id='url' onChange={this.onChangeWsUrl.bind(this)} value={this.state.wsUrl} />
      </Input>
      <Input>
      <label htmlFor='roomId'>部屋のID:</label>
      <input
        className='input'
        type='text'
        id='roomId'
        onChange={this.onChangeRoomId.bind(this)}
        value={this.state.roomId}
      />
      </Input>
      </Inputs>
      <Buttons>
      <Button onClick={this.connect.bind(this)} type='button'>接続</Button>
      <Button onClick={this.disconnect.bind(this)} type='button' >切断</Button>
      </Buttons>
      <Videos>
      <RemoteVideo ref={this.remoteVideoRef} autoPlay />
      <LocalVideo ref={this.localVideoRef} autoPlay muted />
      </Videos>
      </Main>
    );
  }

  public componentDidMount() {
    // ローカルビデオを再生する
    this.startLocalVideo();
  }

  public connect() {
    this.setState({isNegotiating: false});
  // 新規に websocket を作成
    const ws = new WebSocket(this.state.wsUrl);
    // ws のコールバックを定義する
    ws.onopen = () => {
      console.log('ws open()');
      ws.send(JSON.stringify({
        type: 'register',
        room_id: this.state.roomId,
      }));
      ws.onmessage = (event: MessageEvent) => {
        console.log('ws onmessage() data:', event.data);
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'offer': {
            console.log('Received offer ...');
            this.setOffer(message);
            break;
          }
          case 'answer': {
            console.log('Received answer ...');
            this.setAnswer(message);
            break;
          }
          case 'candidate': {
            console.log('Received ICE candidate ...');
            const candidate = new RTCIceCandidate(message.ice);
            console.log(candidate);
            this.addIceCandidate(candidate);
            break;
          }
          case 'close': {
            console.log('peer is closed ...');
            this.disconnect();
            break;
          }
          default: {
            console.log('Invalid message type: ');
            break;
          }
        }
      };

      if (!this.state.peer) {
        console.log('make Offer');
        this.prepareNewConnection(true);
      } else {
        console.warn('peer already exist.');
      }
    };
    ws.onerror = (error) => {
      console.error('ws onerror() ERROR:', error);
    };
    this.setState({ws});
  }

  public disconnect(): void {
    if (this.state.peer) {
      if (this.state.peer.iceConnectionState !== 'closed') {
        // peer connection を閉じる
        this.state.peer.close();
      }
      if (this.state.ws) {
        this.state.ws.close();
      }
      this.setState({peer: null, ws: null});
    }
    if (this.remoteVideoRef.current) {
      this.remoteVideoRef.current.srcObject = null;
    }
  }


  private async startLocalVideo() {
    if (this.localVideoRef.current) {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        this.setState({localStream});
        this.localVideoRef.current.srcObject = localStream;
      } catch (error) {
        console.error('mediaDevice.getUserMedia() error:', error);
      }
    }
  }

  private startRemoteVideo(remoteStream: MediaStream) {
    if (this.remoteVideoRef.current) {
      this.remoteVideoRef.current.srcObject = remoteStream;
      console.log('play remote video');
    }
  }

  private prepareNewConnection(isOffer: boolean) {
    const peer = new RTCPeerConnection(peerConnectionConfig);
    if ('ontrack' in peer) {
      const tracks: MediaStreamTrack[] = [];
      peer.ontrack = (event: RTCTrackEvent) => {
        tracks.push(event.track);
        console.log('-- peer.ontrack()', event);
        const mediaStream = new MediaStream(tracks);
        this.startRemoteVideo(mediaStream);
      };
    } else {
      // @ts-ignore
      peer.onaddstream = (event: MediaStreamEvent) => {
        if (event.stream) {
          const stream = event.stream as MediaStream;
          this.startRemoteVideo(stream);
        }
      };
    }

    peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        console.log('-- peer.onicecandidate()', event.candidate);
        const candidate = event.candidate;
        if (this.state.ws) {
          const message = JSON.stringify({ type: 'candidate', ice: candidate });
          this.state.ws.send(message);
        }
      } else {
        console.log('empty ice event');
      }
    };

    peer.onnegotiationneeded = async () => {
      if (this.state.isNegotiating) {
        console.log('SKIP nested negotiations');
        return;
      }
      try {
        this.setState({isNegotiating: true});
        if (isOffer) {
          const offer = await peer.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          console.log('createOffer() succsess in promise');
          await peer.setLocalDescription(offer);
          console.log('setLocalDescription() succsess in promise');
          if (peer.localDescription) {
            this.sendSdp(peer.localDescription);
          }
          this.setState({isNegotiating: false});
        }
      } catch (error) {
        console.error('setLocalDescription(offer) ERROR: ', error);
      }
    };

    peer.oniceconnectionstatechange = () => {
      console.log('ICE connection Status has changed to ' + peer.iceConnectionState);
      switch (peer.iceConnectionState) {
        case 'connected':
          this.setState({isNegotiating: false});
          break;
        case 'closed':
        case 'failed':
          if (this.state.peer) {
            this.disconnect();
          }
          break;
        case 'disconnected':
          break;
      }
    };

    peer.onsignalingstatechange = () => {
      console.log('signaling state changes:', peer.signalingState);
    };

    if (this.state.localStream) {
      const videoTrack = this.state.localStream.getVideoTracks()[0];
      const audioTrack = this.state.localStream.getAudioTracks()[0];
      if (videoTrack) {
          peer.addTrack(videoTrack, this.state.localStream);
        }
      if (audioTrack) {
          peer.addTrack(audioTrack, this.state.localStream);
        }
    } else {
      console.warn('no local stream, but continue.');
    }
    this.setState({peer});
  }

  private async setAnswer(sessionDescription: RTCSessionDescription) {
    if (this.state.peer) {
      try {
        await this.state.peer.setRemoteDescription(sessionDescription);
        console.log('setRemoteDescription(answer) success in promise');
      } catch (error) {
        console.error('setRemoteDescription(answer) ERROR: ', error);
      }
    }
  }

  private async makeAnswer() {
    if (this.state.peer) {
      try {
        const answer = await this.state.peer.createAnswer();
        await this.state.peer.setLocalDescription(answer);
        const localDescription = this.state.peer.localDescription;
        if (localDescription) {
          this.sendSdp(localDescription);
        }
      } catch (error) {
        console.error('makeAnswer ERROR: ', error);
      }
    }
  }

  private async setOffer(sessionDescription: RTCSessionDescription) {
    this.prepareNewConnection(false);
    try {
      if (this.state.peer) {
        await this.state.peer.setRemoteDescription(sessionDescription);
        console.log('setRemoteDescription(answer) success in promise');
        this.makeAnswer();
      }
    } catch (error) {
      console.error('setRemoteDescription(offer) ERROR: ', error);
    }
  }

  private sendSdp(sessionDescription: RTCSessionDescription) {
    if (this.state.ws) {
      console.log('---sending sdp ---');
      const message = JSON.stringify(sessionDescription);
      console.log('sending SDP=' + message);
      this.state.ws.send(message);
    }
  }

  private onChangeWsUrl(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({wsUrl: event.target.value});
  }

  private onChangeRoomId(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({roomId: event.target.value});
  }

  private addIceCandidate(candidate: RTCIceCandidate) {
    console.log('add ice candidate', candidate);
    if (this.state.peer) {
      this.state.peer.addIceCandidate(candidate);
    } else {
      console.error('PeerConnection does not exist!');
    }
  }

}

export default P2PSimple;

const Main = styled.div`
  text-align: center;
`;
const Title = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 40px;
`;
const Inputs = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  top: 80px;
`;
const Input = styled.div`
  display: inline-block;
`;

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
`;
const Buttons = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  top: 140px;
`;
const Videos = styled.div`
  font-size: 0;
  pointer-events: none;
  position: absolute;
  transition: all 1s;
  width: 100%;
  height: 100%;
  display: block;
`;

const RemoteVideo = styled.video`
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  object-fit: cover;
  transform: scale(-1, 1);
  transition: opacity 1s;
  width: 100%;
`;
const LocalVideo = styled.video`
  z-index: 2;
  border: 1px solid gray;
  bottom: 20px;
  right: 20px;
  max-height: 17%;
  max-width: 17%;
  position: absolute;
  transition: opacity 1s;
`;

