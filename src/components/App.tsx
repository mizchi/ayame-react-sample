import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect
} from "react";
import styled from "styled-components";
import P2PNegotiator from "./P2PNegotiactor";

export default function App() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        setLocalStream(localStream);
      } catch (error) {
        console.error("mediaDevice.getUserMedia() error:", error);
      }
    })();
  }, []);

  const onCloseRemoteStream = useCallback(() => setRemoteStream(null), []);
  return (
    <Main>
      <Title>
        <h2>Ayame React Sample</h2>
      </Title>
      <P2PNegotiator
        localStream={localStream}
        onStartRemoteStream={setRemoteStream}
        onCloseRemoteStream={onCloseRemoteStream}
      />
      <VideoViewer localStream={localStream} remoteStream={remoteStream} />
    </Main>
  );
}

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

// VideoViewer

function VideoViewer({
  localStream,
  remoteStream
}: {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useLayoutEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <Videos>
      <RemoteVideo ref={remoteVideoRef} autoPlay />
      <LocalVideo ref={localVideoRef} autoPlay muted />
    </Videos>
  );
}

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
