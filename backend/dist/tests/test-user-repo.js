"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const UserRepository_1 = require("../repositories/UserRepository");
async function testRepository() {
    const userRepo = new UserRepository_1.UserRepository();
    try {
        console.log("Testing create...");
        const newUser = await userRepo.create({
            username: "sheikh",
            email: "email@sheikh.com",
            password_hash: "hayawan",
        });
        console.log("New user created: ", newUser);
        console.log("\nTesting findById...");
        const foundUser = await userRepo.findById(newUser.user_id);
        console.log("Found :", foundUser);
        console.log("\nTesting findByUsername...");
        const userByUsername = await userRepo.findByUsername("testuser");
        console.log("Found:", userByUsername);
        console.log("\nTesting update...");
        const updatedUser = await userRepo.update(newUser.user_id, {
            email: "email@sheikh.com",
        });
        console.log("Updated:", updatedUser);
        console.log("V All tests passed");
    }
    catch (err) {
        console.error("# Error : ", err);
    }
    finally {
        process.exit(0);
    }
}
testRepository();
