import dotenv from "dotenv";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import readline from "readline";
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let isAwaitingResponse = false; // Flag to check if we are currently awaiting a response

async function run() {
    const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
        history: [],
        generationConfig: {
            maxOutputTokens: 500,
        }
    })

    // Function to get user input and send it to the model using streaming
    function askAndRespond() {
        if (!isAwaitingResponse) {
            // Check if not currently awaiting a response
            rl.question("You: ", async (msg) => {
                if (msg.toLowerCase() === "exit") {
                    rl.close();
                } else {
                    isAwaitingResponse = true; // Set flag to true as we start receiving
                    try {
                        const result = await chat.sendMessageStream(msg);
                        let text = "";
                        for await (const chunk of result.stream) {
                            const chunkText = await chunk.text(); // Assuming chunk.text() exists
                            console.log("AI: ", chunkText);
                            text += chunkText;
                        }
                        isAwaitingResponse = false; // Reset flag after stream is complete
                        askAndRespond(); // Ready for the next input
                    } catch (error) {
                        console.error("Error:", error);
                        isAwaitingResponse = false; // Ensure flag is reset on error too
                    }
                }
            });
        } else {
            console.log("Please wait for the current response to complete.");
        }
    }

    askAndRespond(); // Start the conversation loop
}

run();