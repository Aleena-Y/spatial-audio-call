import React, { useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng";

import JoinRoom from "./assets/components/JoinRoom";
import CallRoom from "./assets/components/CallRoom";

import { APP_ID } from "./agoraConfig";

import "./App.css";

const client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8"
});

function App() {

    const [joined, setJoined] = useState(false);

    const [roomName, setRoomName] = useState("");

    const [localTrack, setLocalTrack] = useState(null);

    const joinRoom = async (room) => {

        if (!room) return;

        try {

            await client.join(APP_ID, room, null, null);

            const micTrack =
                await AgoraRTC.createMicrophoneAudioTrack();

            await client.publish([micTrack]);

            setLocalTrack(micTrack);

            setRoomName(room);

            setJoined(true);

            client.on("user-published", async (user, mediaType) => {

                await client.subscribe(user, mediaType);

                if (mediaType === "audio") {

                    user.audioTrack.play();

                }
            });

        } catch (error) {

            console.log(error);

        }
    };

    const leaveRoom = async () => {

        if (localTrack) {

            localTrack.stop();

            localTrack.close();
        }

        await client.leave();

        setJoined(false);

        setRoomName("");
    };

    return (
        <div className="app">

            {
                joined
                    ?
                    <CallRoom
                        leaveRoom={leaveRoom}
                        roomName={roomName}
                    />
                    :
                    <JoinRoom joinRoom={joinRoom} />
            }

        </div>
    );
}

export default App;