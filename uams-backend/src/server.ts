import dns from "node:dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";

const PORT = process.env.PORT || 8000;
dotenv.config();

const startServer = async () => {
  try {
    connectDB()
      .then(() => seedAdmin())
      .then(() => {
        app.listen(PORT, () => {
          console.log(`Server running on port ${PORT}`);
        });
      });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();