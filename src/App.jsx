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

// Spatial audio configuration
const SPATIAL_CONFIG = {
    updateInterval: 50,
    maxDistance: 10,
    minVolume: 0.1,
    autoPositionRadius: 3
};

function App() {

    const [joined, setJoined] = useState(false);

    const [roomName, setRoomName] = useState("");

    const [displayName, setDisplayName] = useState("");

    const [participants, setParticipants] = useState([]);

    const [speakingUsers, setSpeakingUsers] = useState([]);

    const [isMuted, setIsMuted] = useState(false);

    const [localTrack, setLocalTrack] = useState(null);

    const [userPositions, setUserPositions] = useState({});

    const [listenerPosition, setListenerPosition] = useState({ x: 0, y: 0, z: 0 });

    const [spatialAudioEnabled, setSpatialAudioEnabled] = useState(true);

    const [spatialUpdateInterval, setSpatialUpdateInterval] = useState(null);

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

        setUserPositions((prev) => {
            const updated = { ...prev };
            delete updated[uidText];
            return updated;
        });
    };

    const calculateDistance = (pos1, pos2) => {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };

    const calculateSpatialVolume = (distance) => {
        if (distance === 0) return 1;
        const normalized = Math.min(distance / SPATIAL_CONFIG.maxDistance, 1);
        return Math.max(SPATIAL_CONFIG.minVolume, 1 - normalized);
    };

    const updateSpatialAudio = () => {
        if (!spatialAudioEnabled) return;

        for (const user of client.remoteUsers) {
            if (user.audioTrack && userPositions[user.uid]) {
                const userPos = userPositions[user.uid];
                const distance = calculateDistance(listenerPosition, userPos);
                const volume = calculateSpatialVolume(distance);
                user.audioTrack.setVolume(Math.round(volume * 100));
            }
        }
    };

    const updateUserPosition = (uid, x, y, z) => {
        const uidText = String(uid);
        setUserPositions((prev) => ({
            ...prev,
            [uidText]: { x, y, z }
        }));
    };

    const autoPositionUsers = () => {
        const positions = {};
        const userCount = participants.length;
        const angleStep = (2 * Math.PI) / Math.max(userCount, 1);

        positions[displayName] = { x: 0, y: 0, z: 0 };

        for (let i = 1; i < userCount; i++) {
            const angle = i * angleStep;
            const distance = SPATIAL_CONFIG.autoPositionRadius;
            positions[participants[i]] = {
                x: distance * Math.cos(angle),
                y: 0,
                z: distance * Math.sin(angle)
            };
        }

        setUserPositions(positions);
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

    useEffect(() => {
        if (spatialAudioEnabled && joined) {
            const interval = setInterval(updateSpatialAudio, SPATIAL_CONFIG.updateInterval);
            setSpatialUpdateInterval(interval);
            return () => clearInterval(interval);
        }
    }, [spatialAudioEnabled, joined, listenerPosition, userPositions]);

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

            setUserPositions({ [trimmedName]: { x: 0, y: 0, z: 0 } });

            setListenerPosition({ x: 0, y: 0, z: 0 });

            setSpatialAudioEnabled(true);

            setJoined(true);

        } catch (error) {

            console.log(error);

        }
    };

    const leaveRoom = async () => {

        if (spatialUpdateInterval) {

            clearInterval(spatialUpdateInterval);
        }

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

        setUserPositions({});

        setListenerPosition({ x: 0, y: 0, z: 0 });

        setSpatialAudioEnabled(false);
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
                        userPositions={userPositions}
                        listenerPosition={listenerPosition}
                        setListenerPosition={setListenerPosition}
                        updateUserPosition={updateUserPosition}
                        spatialAudioEnabled={spatialAudioEnabled}
                        setSpatialAudioEnabled={setSpatialAudioEnabled}
                        autoPositionUsers={autoPositionUsers}
                    />
                    :
                    <JoinRoom joinRoom={joinRoom} />
            }

        </div>
    );
}

export default App;