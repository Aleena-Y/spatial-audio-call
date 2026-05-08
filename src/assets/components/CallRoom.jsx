import React from "react";

const CallRoom = ({
    leaveRoom,
    roomName,
    displayName,
    participants,
    speakingUsers,
    isMuted,
    toggleMute,
    userPositions,
    listenerPosition,
    setListenerPosition,
    updateUserPosition,
    spatialAudioEnabled,
    setSpatialAudioEnabled,
    autoPositionUsers
}) => {

    const calculateDistance = (pos1, pos2) => {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2);
    };

    const handlePositionChange = (axis, value) => {
        const newPos = { ...listenerPosition, [axis]: parseFloat(value) };
        setListenerPosition(newPos);
    };

    return (
        <div className="call-container-spatial">

            <div className="header-section">

                <h2>Connected to Room:</h2>

                <h1>{roomName}</h1>

                <p>You joined as: <strong>{displayName}</strong></p>

                <p>{isMuted ? "You are muted." : "Two-way audio is active."}</p>

            </div>

            <div className="spatial-audio-section">

                <h3>🎧 8D Spatial Audio</h3>

                <div className="spatial-toggle">

                    <label>
                        <input
                            type="checkbox"
                            checked={spatialAudioEnabled}
                            onChange={(e) => setSpatialAudioEnabled(e.target.checked)}
                        />
                        Enable Spatial Audio
                    </label>

                </div>

                {spatialAudioEnabled && (

                    <>

                        <div className="position-controls">

                            <h4>Your Position in 3D Space</h4>

                            <div className="axis-control">

                                <label>X (Left-Right): {listenerPosition.x.toFixed(1)}</label>

                                <input
                                    type="range"
                                    min="-10"
                                    max="10"
                                    step="0.5"
                                    value={listenerPosition.x}
                                    onChange={(e) => handlePositionChange("x", e.target.value)}
                                />

                            </div>

                            <div className="axis-control">

                                <label>Y (Up-Down): {listenerPosition.y.toFixed(1)}</label>

                                <input
                                    type="range"
                                    min="-5"
                                    max="5"
                                    step="0.5"
                                    value={listenerPosition.y}
                                    onChange={(e) => handlePositionChange("y", e.target.value)}
                                />

                            </div>

                            <div className="axis-control">

                                <label>Z (Front-Back): {listenerPosition.z.toFixed(1)}</label>

                                <input
                                    type="range"
                                    min="-10"
                                    max="10"
                                    step="0.5"
                                    value={listenerPosition.z}
                                    onChange={(e) => handlePositionChange("z", e.target.value)}
                                />

                            </div>

                            <button className="auto-position-btn" onClick={autoPositionUsers}>
                                🎯 Auto-Position Users
                            </button>

                        </div>

                        <div className="spatial-info">

                            <h4>Participant Positions & Distance</h4>

                            <ul className="spatial-list">

                                {
                                    participants.map((participant) => {

                                        const pos = userPositions[participant] || { x: 0, y: 0, z: 0 };
                                        const distance = calculateDistance(listenerPosition, pos);

                                        return (
                                            <li key={participant} className="spatial-item">

                                                <span className="participant-name">
                                                    {participant}
                                                    {participant === displayName ? " (You)" : ""}
                                                    {speakingUsers.includes(participant) ? " 🎤" : ""}
                                                </span>

                                                <span className="position-info">
                                                    pos: ({pos.x.toFixed(1)}, {pos.y.toFixed(1)}, {pos.z.toFixed(1)})
                                                </span>

                                                <span className="distance-info">
                                                    dist: {distance}m
                                                </span>

                                            </li>
                                        );
                                    })
                                }

                            </ul>

                        </div>

                    </>

                )}

            </div>

            <div className="participants">

                <h3>People in call ({participants.length})</h3>

                {
                    participants.length === 0
                        ? <p>No one else yet.</p>
                        : (
                            <ul>
                                {
                                    participants.map((participant) => (
                                        <li
                                            key={participant}
                                            className={speakingUsers.includes(participant) ? "speaking" : ""}
                                        >
                                            {participant}
                                            {participant === displayName ? " (You)" : ""}
                                            {speakingUsers.includes(participant) ? " speaking" : ""}
                                        </li>
                                    ))
                                }
                            </ul>
                        )
                }

            </div>

            <div className="controls">

                <button className="mute-btn" onClick={toggleMute}>
                    {isMuted ? "Unmute" : "Mute"}
                </button>

                <button onClick={leaveRoom}>
                    Leave Call
                </button>

            </div>

        </div>
    );
};

export default CallRoom;