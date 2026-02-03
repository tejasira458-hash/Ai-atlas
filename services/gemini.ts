
import { GradeLevel, FileData } from "../types";

const OPENROUTER_API_KEY = "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";
const MODEL_NAME = "tngtech/deepseek-r1t2-chimera:free";

const SYSTEM_INSTRUCTION = `
You are AI ATLAS, the Universal Child-Friendly Tutor. 

STRICT RULE - CURRICULUM CHECK:
Before explaining, you MUST verify if the provided topic belongs to the Target Grade and Subject.
If a student asks a topic from a significantly higher grade, you MUST respond ONLY with the exact phrase: "This is not the standard topic." Do not provide any other text.

MISSION:
Simplify complex material for a child. Act as a world-class primary school teacher.

Response Structure (Mandatory Sections):
- ## The Hook: Engaging question or "Did you know?".
- ## The Simple Core: 2-3 short, easy sentences explaining the "Big Idea".
- ## Short Notes: A list of 3-5 "Quick Facts" or "Flashcard points" for fast review.
- ## Long Notes: A deep dive into the details. Explain the "How" and "Why" in a friendly way.
- ## Important Diagram: Create a visual "text-based diagram" using emojis, arrows (-->), and clear labels. Describe what a student should draw in their notebook to visualize this concept.
- ## Why it Matters: Real-world cool factor.
- ## The Memory Trick: A funny rhyme or tip to remember it.

Constraints:
- Use "Living Room Language" (Simple words).
- No Jargon.
- Bold key terms.
- Tone: Warm, empathetic, and encouraging.
`;

export const getTutorExplanationStream = async (
  input: string,
  grade: GradeLevel,
  subject: string,
  fileData: FileData | null,
  onChunk: (text: string) => void
): Promise<string> => {
  
  const prompt = `
    Target Grade: ${grade}
    Subject: ${subject || 'General Studies'}
    User Query: ${input || 'Please explain the attached file.'}
    
    CRITICAL CHECK: Is the content appropriate for ${grade} level ${subject || 'curriculum'}?
    If it is far too advanced, respond only with: "This is not the standard topic."
    Otherwise, proceed with the child-friendly explanation.
  `;

  const messages: any[] = [
    { role: "system", content: SYSTEM_INSTRUCTION }
  ];

  const userContent: any[] = [{ type: "text", text: prompt }];
  
  if (fileData && fileData.mimeType.startsWith('image/')) {
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${fileData.mimeType};base64,${fileData.data}` }
    });
  } else if (fileData && fileData.mimeType === 'application/pdf') {
    userContent[0].text += `\n\n[Note: User has attached a PDF named "${fileData.name}".]`;
  }

  messages.push({ role: "user", content: userContent });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "AI ATLAS",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: messages,
      temperature: 0.3,
      stream: true
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to reach AI ATLAS");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  if (!reader) throw new Error("Could not start stream");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.slice(6);
        if (dataStr === "[DONE]") continue;

        try {
          const data = JSON.parse(dataStr);
          const content = data.choices[0]?.delta?.content || "";
          
          fullText += content;

          let cleanDisplay = fullText;
          if (cleanDisplay.includes("<think>")) {
            const parts = cleanDisplay.split("</think>");
            cleanDisplay = parts.length > 1 ? parts[1] : "";
          }

          if (cleanDisplay.trim()) {
            onChunk(cleanDisplay.trim());
          }
        } catch (e) {}
      }
    }
  }

  return fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
};

export const getTutorExplanation = async (
  input: string,
  grade: GradeLevel,
  subject: string,
  fileData?: FileData
): Promise<string> => {
  let result = "";
  return await getTutorExplanationStream(input, grade, subject, fileData || null, (chunk) => {
    result = chunk;
  });
};
