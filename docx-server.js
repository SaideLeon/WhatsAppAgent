"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const markdownToDocx_1 = require("./utils/markdownToDocx");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json({ limit: '2mb' }));
app.post('/docx', markdownToDocx_1.serveDocx);
const PORT = process.env.DOCX_PORT || 3010;
app.listen(PORT, () => {
    console.log(`DOCX server running on port ${PORT}`);
});
