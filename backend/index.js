import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello API!");
});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
