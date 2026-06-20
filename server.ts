import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent as requested in the instructions
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not set. Real AI responses will fail. Please add it via the secrets panel.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// 1. Analyze journal entry endpoint
app.post("/api/analyze-journal", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== "string" || !content.trim()) {
      return res.status(400).json({ error: "Journal content is required." });
    }

    const ai = getGeminiClient();
    const prompt = `Analyze the following journal entry written by a student preparing for high-stakes entrance exams (JEE/NEET).
Identify hidden stress triggers, self-doubt patterns, and physical burnout cues. Detail them thoroughly but gently.

Student Journal Entry:
"""
${content}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional, gentle developmental psychologist or mental wellness guide who specializes in exam coaching stress (JEE, NEET, Board Exams) for teenagers and young adults. Your analysis must make them feel validated, not judged.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "Psychological stress analysis feedback from a school journal entry.",
          properties: {
            stressTriggers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Latent stressors mentioned or implied (e.g., negative mock test scores, peer comparison, family high expectations, syllabus overload)."
            },
            selfDoubtPatterns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Cognitive distortions or self-limiting thoughts (e.g., catastrophizing, 'imposter syndrome', equating self-worth entirely with ranks/marks)."
            },
            burnoutCues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Somatic, physical, or behavioral signs of severe fatigue (e.g., chronic lack of sleep, skipping meals, eye strain, heart racing, brain fog)."
            },
            overallStressScore: {
              type: Type.INTEGER,
              description: "Estimated psychological/burnout stress level on a scale from 0 to 100."
            },
            stressLevelCategory: {
              type: Type.STRING,
              description: "One of: 'Unwind Mode (Relaxed)', 'Focused But Balanced', 'Moderate Stress Warning', 'Severe Burnout Alert'"
            },
            empatheticReflection: {
              type: Type.STRING,
              description: "A gentle, 2-3 sentence validation note summarizing what they are going through and showing high empathy."
            },
            copingPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 simple, highly tailored, actionable steps suitable for an exam aspirant's daily routine (e.g., 'Take a micro-break every 50 minutes of math practice', 'Do 2 minutes of belly breathing before opening physics tests')."
            }
          },
          required: [
            "stressTriggers",
            "selfDoubtPatterns",
            "burnoutCues",
            "overallStressScore",
            "stressLevelCategory",
            "empatheticReflection",
            "copingPlan"
          ]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text returned from Gemini API");
    }

    const data = JSON.parse(resultText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Journal Analysis Error:", error);
    return res.status(500).json({
      error: "Could not analyze the journal entry at this moment.",
      details: error.message
    });
  }
});

// 2. Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, journalContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    // Map frontend messages into the format required by SDK chat history
    // and extract the latest message.
    const historyPayload = messages.slice(0, -1).map(msg => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.message }]
    }));

    const latestMessageObj = messages[messages.length - 1];
    const latestMessageText = latestMessageObj ? latestMessageObj.message : "Hello";

    let contextInstruction = "";
    if (journalContext) {
      contextInstruction = `\n\n[Active Student Journal Context]: The student recently wrote a journal entry with these stress patterns:\n${journalContext}\nAlways show recognition of this context if appropriate, incorporating gentle solutions into your feedback or exercises, but don't force it unnaturally.`;
    }

    const systemInstruction = 
      "You are 'Saathi' (literally meaning 'companion' in Hindi), an empathetic, warm, and comforting AI wellness companion specially designed for stressed-out Indian students preparing for intense competitive exams like JEE Main, JEE Advanced, NEET, or school Boards.\n\n" +
      "Guidelines for your support:\n" +
      "1. Be extremely supportive, gentle, and warm. Treat the student like a caring mentor or wise, non-judgmental friend.\n" +
      "2. When they raise self-criticism, actively dismantle cognitive distortions. Destigmatize scoring low or feeling lost. Constantly remind them they are worth far more than any percentile, score, or college branch.\n" +
      "3. Offer very specific, real-time micro-mindfulness exercises (e.g., 'Let's do a 4-7-8 breathing practice together. Inhale now for 4...', 'Let's do a quick eyes-palming break'). Keep them interactive and break down steps.\n" +
      "4. Suggest smart, stress-beating study guidelines: Pomodoro sessions, healthy sleep habits, simple 10-minute walk intervals, staying hydrated.\n" +
      "5. Use friendly, empathetic language with a blend of English and occasional natural cultural nods (like 'bacha', 'yaar', 'beta' or simply warm supportive English phrases depending on context) but keep it universally uplifting.\n" +
      "6. NEVER offer medical diagnoses. If they represent profound danger to themselves, tell them in a warm, loving way that they deserve real human support, and urge them to connect with parent, trusted teacher, or professional helpline counselors." +
      contextInstruction;

    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      history: historyPayload,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const response = await chatInstance.sendMessage({
      message: latestMessageText
    });

    return res.json({
      message: response.text
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return res.status(500).json({
      error: "Your companion Saathi is taking a small pause. Let's try again in a moment.",
      details: error.message
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
