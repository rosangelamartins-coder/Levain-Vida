import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// We instantiate GoogleGenAI on the server side using the process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array provided" }, { status: 400 });
    }

    const systemInstruction = `You are the "Levain Sourdough Master", a warm, encouraging, and highly detailed artisanal baker.
Your role of helping beginners start baking with sourdough and Levain (natural yeast fermentation) is crucial.
Explain technical steps (like autolyse, bulk fermentation, stretch-and-fold, windowpane test, shaping, cold proofing, and baking in dynamic dutch ovens) with absolute clarity.
Use baker's percentages where appropriate and relate chemical changes (like fermentation gas, lactic acid vs acetic acid balance, and gluten formation) to simple kitchen observations.
Keep answers friendly, clear, and action-oriented.
You are bilingual and MUST respond in Portuguese if the prompt or conversation history is in Portuguese (and English if it is in English). Maintain your Sourdough Master persona in both languages!`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Send the last message in context. To simulate continuous conversation, 
    // we can pass previous exchange context in the system prompt or feed previous messages if supported,
    // or simply inject history as a custom-formatted single message input.
    // Let's feed history in formatting so the model has the exact context.
    const historyContext = messages.slice(0, -1).map((m: any) => `${m.role === 'user' ? 'Beginner' : 'Bake Master'}: ${m.content}`).join("\n");
    const currentMsg = messages[messages.length - 1].content;
    const finalPrompt = historyContext 
      ? `Here is our conversation history:\n${historyContext}\n\nBeginner current question: ${currentMsg}`
      : currentMsg;

    const response = await chat.sendMessage({ message: finalPrompt });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in Gemini Sourdough API:", error);
    return NextResponse.json({ error: error.message || "Something went wrong during yeast proofing. Please retry!" }, { status: 500 });
  }
}
