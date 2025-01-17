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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const readline_1 = __importDefault(require("readline"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
let isAwaitingResponse = false; // Flag to check if we are currently awaiting a response
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 500,
            }
        });
        // Function to get user input and send it to the model using streaming
        function askAndRespond() {
            if (!isAwaitingResponse) {
                // Check if not currently awaiting a response
                rl.question("You: ", (msg) => __awaiter(this, void 0, void 0, function* () {
                    var _a, e_1, _b, _c;
                    if (msg.toLowerCase() === "exit") {
                        rl.close();
                    }
                    else {
                        isAwaitingResponse = true; // Set flag to true as we start receiving
                        try {
                            const result = yield chat.sendMessageStream(msg);
                            let text = "";
                            try {
                                for (var _d = true, _e = __asyncValues(result.stream), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                                    _c = _f.value;
                                    _d = false;
                                    const chunk = _c;
                                    const chunkText = yield chunk.text(); // Assuming chunk.text() exists
                                    console.log("AI: ", chunkText);
                                    text += chunkText;
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            isAwaitingResponse = false; // Reset flag after stream is complete
                            askAndRespond(); // Ready for the next input
                        }
                        catch (error) {
                            console.error("Error:", error);
                            isAwaitingResponse = false; // Ensure flag is reset on error too
                        }
                    }
                }));
            }
            else {
                console.log("Please wait for the current response to complete.");
            }
        }
        askAndRespond(); // Start the conversation loop
    });
}
run();
