"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./types/config");
const PORT = config_1.config.port;
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🏠 App: ${config_1.config.appName}`);
});
//# sourceMappingURL=index.js.map