import React, { useState } from "react";

const JoinRoom = ({ joinRoom }) => {

    const [room, setRoom] = useState("");
    const [name, setName] = useState("");

    return (
        <div className="join-container">

            <h1>Audio Call App</h1>

            <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                type="text"
                placeholder="Enter Room ID"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
            />

            <button onClick={() => joinRoom(room, name)}>
                Join Call
            </button>

        </div>
    );
};

export default JoinRoom;