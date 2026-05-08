import React from "react";

const CallRoom = ({
    leaveRoom,
    roomName,
    displayName,
    participants,
    speakingUsers,
    isMuted,
    toggleMute
}) => {

    return (
        <div className="call-container">

            <h2>Connected to Room:</h2>

            <h1>{roomName}</h1>

            <p>You joined as: <strong>{displayName}</strong></p>

            <p>{isMuted ? "You are muted." : "Two-way audio is active."}</p>

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