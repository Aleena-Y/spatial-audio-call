import React, { useEffect, useState } from "react";

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

    const [displayName, setDisplayName] = useState("");

    const [participants, setParticipants] = useState([]);

    const [speakingUsers, setSpeakingUsers] = useState([]);

    const [isMuted, setIsMuted] = useState(false);

    const [localTrack, setLocalTrack] = useState(null);

    const addParticipant = (uid) => {

        const uidText = String(uid);

        setParticipants((prev) => {

            if (prev.includes(uidText)) return prev;

            return [...prev, uidText];

        });
    };

    const removeParticipant = (uid) => {

        const uidText = String(uid);

        setParticipants((prev) => prev.filter((id) => id !== uidText));

        setSpeakingUsers((prev) => prev.filter((id) => id !== uidText));
    };

    useEffect(() => {

        const handleUserJoined = (user) => {

            addParticipant(user.uid);
        };

        const handleUserLeft = (user) => {

            removeParticipant(user.uid);
        };

        const handleUserPublished = async (user, mediaType) => {

            await client.subscribe(user, mediaType);

            if (mediaType === "audio" && user.audioTrack) {

                user.audioTrack.play();
            }

            addParticipant(user.uid);
        };

        const handleUserUnpublished = (user) => {

            addParticipant(user.uid);
        };

        const handleVolumeIndicator = (volumes) => {

            const activeSpeakers = volumes
                .filter((volume) => volume.level > 5)
                .map((volume) => String(volume.uid));

            setSpeakingUsers(activeSpeakers);
        };

        client.on("user-joined", handleUserJoined);
        client.on("user-left", handleUserLeft);
        client.on("user-published", handleUserPublished);
        client.on("user-unpublished", handleUserUnpublished);
        client.on("volume-indicator", handleVolumeIndicator);

        return () => {

            client.off("user-joined", handleUserJoined);
            client.off("user-left", handleUserLeft);
            client.off("user-published", handleUserPublished);
            client.off("user-unpublished", handleUserUnpublished);
            client.off("volume-indicator", handleVolumeIndicator);
        };
    }, []);

    const joinRoom = async (room, name) => {

        if (!room || !name) return;

        const trimmedRoom = room.trim();
        const trimmedName = name.trim();

        if (!trimmedRoom || !trimmedName) return;

        try {

            await client.join(APP_ID, trimmedRoom, null, trimmedName);

            client.enableAudioVolumeIndicator();

            const micTrack =
                await AgoraRTC.createMicrophoneAudioTrack();

            await client.publish([micTrack]);

            for (const user of client.remoteUsers) {

                if (user.hasAudio) {

                    await client.subscribe(user, "audio");

                    if (user.audioTrack) {

                        user.audioTrack.play();
                    }
                }

                addParticipant(user.uid);
            }

            setLocalTrack(micTrack);

            setRoomName(trimmedRoom);

            setDisplayName(trimmedName);

            setParticipants([trimmedName]);

            setSpeakingUsers([]);

            setIsMuted(false);

            setJoined(true);

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

        setDisplayName("");

        setParticipants([]);

        setSpeakingUsers([]);

        setIsMuted(false);
    };

    const toggleMute = async () => {

        if (!localTrack) return;

        try {

            const nextMuted = !isMuted;

            await localTrack.setEnabled(!nextMuted);

            setIsMuted(nextMuted);

        } catch (error) {

            console.log(error);
        }
    };

    return (
        <div className="app">

            {
                joined
                    ?
                    <CallRoom
                        leaveRoom={leaveRoom}
                        roomName={roomName}
                        displayName={displayName}
                        participants={participants}
                        speakingUsers={speakingUsers}
                        isMuted={isMuted}
                        toggleMute={toggleMute}
                    />
                    :
                    <JoinRoom joinRoom={joinRoom} />
            }

        </div>
    );
}

export default App;