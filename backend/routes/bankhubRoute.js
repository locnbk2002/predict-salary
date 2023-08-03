import express from "express";
import bankHubController from "../controllers/bankhubController";

let router = express.Router();

const bankhubRoute = (app) => {
    router.get("/grant_token", bankHubController.grant_token);
    router.post("/grant_exchange", bankHubController.grant_exchange);
    router.post("/grant_exchange", bankHubController.grant_exchange);
    router.post("/transactions", bankHubController.transactions);
    router.post("/kyc", bankHubController.kyc);

    return app.use("/api", router);
};

export default bankhubRoute;
