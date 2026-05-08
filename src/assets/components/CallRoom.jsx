import React from "react";

const CallRoom = ({ leaveRoom, roomName }) => {

    return (
        <div className="call-container">

            <h2>Connected to Room:</h2>

            <h1>{roomName}</h1>

            <p>Microphone streaming active...</p>

            <button onClick={leaveRoom}>
                Leave Call
            </button>

        </div>
    );
};

export default CallRoom;