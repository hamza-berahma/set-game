// Test client (create a test file)
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    auth: {
        token: "YOUR_JWT_TOKEN_HERE"
    }
});

socket.on("connect", () => {
    console.log("Connected!");
});

socket.on("hello", (data) => {
    console.log("Hello event:", data);
});

socket.on("game:state:update", (data) => {
    console.log("Game state updated:", data);
});

socket.emit("join-room", { roomId: "test-room", token: "YOUR_JWT_TOKEN" });