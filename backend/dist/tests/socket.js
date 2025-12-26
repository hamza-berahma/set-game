"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Test client (create a test file)
const socket_io_client_1 = require("socket.io-client");
const socket = (0, socket_io_client_1.io)("http://localhost:5000", {
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
