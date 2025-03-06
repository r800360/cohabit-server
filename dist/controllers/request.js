"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFriends = void 0;
const firebase_1 = require("../config/firebase");
const listFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const friends = [];
        const sentReqs = yield firebase_1.db.collection("requests")
            .where("senderId", "==", userID)
            .where("status", "==", "accepted")
            .get();
        sentReqs.forEach(doc => {
            friends.push(doc.data().receiverId);
        });
        const recReqs = yield firebase_1.db.collection("requests")
            .where("receiverId", "==", userID)
            .where("status", "==", "accepted")
            .get();
        recReqs.forEach(doc => {
            friends.push(doc.data().senderId);
        });
        res.status(200).json({ friends });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.listFriends = listFriends;
//# sourceMappingURL=request.js.map