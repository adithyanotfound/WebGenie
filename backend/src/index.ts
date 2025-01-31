import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";
import { version } from "os";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const app = express();
app.use(cors());
app.use(express.json());

interface Message {
  role: string;
  content: string;
}

type Input = Array<Message>;

function transformMessages(input: Input) {
  if (!input || !Array.isArray(input)) {
    console.error("Invalid input structure");
    return { messages: [] };
  }
  const transformedMessages = input.map((message) => {
    const { content, ...rest } = message;
    return {
      ...rest,
      parts: [{ text: content }],
    };
  });
  return { messages: transformedMessages };
}

const asyncHandler =
  (fn: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Webgenie",
    version: "1.0.0",
    status: "Healthy",
  });
});

app.post(
  "/template",
  asyncHandler(async (req: Request, res: Response) => {
    const prompt = req.body.prompt;

    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra.",
    });

    const modelResponse = await model.generateContent(`${prompt}`);

    const answer = modelResponse.response.text().trim().toLowerCase(); // react or node

    if (answer == "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    } else {
      res.status(403).json({ message: "You cant access this" });
      return;
    }
  }),
);

app.post(
  "/chat",
  asyncHandler(async (req: Request, res: Response) => {
    const rawMessages = req.body.messages;

    const messages = transformMessages(rawMessages);

    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: getSystemPrompt(),
      generationConfig: { temperature: 0 },
    });

    const chat = model.startChat({
      history: messages.messages,
      generationConfig: {
        maxOutputTokens: 100000,
      },
    });

    const result =
      (await chat.sendMessage(messages.messages[2].parts[0].text)) ||
      (await chat.sendMessage(messages.messages[1].parts[0].text));

    const response = result.response?.candidates?.[0]?.content?.parts?.[0];

    res.json({
      response,
    });
  }),
);

app.use((req, res, next) => {
  res.status(404).json({ message: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "An internal server error occurred",
    error: err.message,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
