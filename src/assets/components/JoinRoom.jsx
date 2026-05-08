import React, { useState } from "react";

const JoinRoom = ({ joinRoom }) => {

    const [room, setRoom] = useState("");

    return (
        <div className="join-container">

            <h1>Audio Call App</h1>

            <input
                type="text"
                placeholder="Enter Room ID"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />

            <button onClick={() => joinRoom(room)}>
                Join Call
            </button>

        </div>
    );
};

export default JoinRoom;