import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bankhubRoute from "./routes/bankhubRoute";
import dotenv from "dotenv";

const app = express();
dotenv.config();
dotenv.config({ path: `.env.local` });
app.use(cors());
app.use(bodyParser.json());

bankhubRoute(app);

app.get("/", (req, res) => {
    res.send("Hello API!");
});

// Start server
app.listen(5002, () => {
    console.log("Server running on port 5000");
});
