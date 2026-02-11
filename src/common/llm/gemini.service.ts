import { Injectable } from "@nestjs/common";

@Injectable()
export class GeminiService {
  async generate(prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message || 'Gemini API error',
      );
    }

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    );
  }

  async generateChat(
    contents: { role: string; parts: { text: string }[] }[],
  ): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error?.message || 'Gemini API error',
      );
    }

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    );
  }
}