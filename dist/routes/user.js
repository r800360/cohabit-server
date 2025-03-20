"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController = __importStar(require("../controllers/user"));
const UserValidator = __importStar(require("../validators/user"));
const router = express_1.default.Router();
// Fetch user by email, name, or ID
router.get("/email/:email", UserController.fetchUserByEmail);
router.get("/name/:name", UserController.fetchUserByName);
router.get("/:id", UserController.fetchUserById);
// Fetch user profile and all details about habits (visible, friends-only)
router.get("/profile/name/:name", UserController.fetchProfileByName);
router.get("/profile/email/:email", UserController.fetchProfileByEmail);
router.get("/profile/:id", UserController.fetchProfileById);
// User operations
router.get("/", UserController.getAllUsers);
router.post("/", UserValidator.validateUserCreation, UserController.createUser);
router.post("/signup", UserController.createUser);
router.patch("/", UserController.updateUser);
router.delete("/", UserController.deleteUserByEmail);
// Debugging
// TODO restrict access to debugging operations
router.get("/test-db", UserController.debugRoute);
router.post("/check", UserValidator.validateEmail, UserController.checkUserExists);
router.delete("/email", UserValidator.validateEmail, UserController.deleteUserByEmail);
exports.default = router;
//# sourceMappingURL=user.js.map