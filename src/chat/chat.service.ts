import { Injectable } from '@nestjs/common';
import { GeminiService } from '../common/llm/gemini.service';
import { AiUsageService } from '../ai-usage/ai-usage.service';
import { ChatHistoryItemDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  async chat(
    userId: string,
    message: string,
    context?: string,
    history?: ChatHistoryItemDto[],
  ): Promise<{ response: string }> {
    const systemPrompt = `คุณเป็น AI Assistant สำหรับแพลตฟอร์มการศึกษา "edNote" ช่วยตอบคำถามเกี่ยวกับเนื้อหาการเรียน อธิบายแนวคิดต่างๆ และช่วยเหลือเรื่องการศึกษาทั่วไป ตอบเป็นภาษาไทยเป็นหลัก แต่ถ้าผู้ใช้ถามเป็นภาษาอื่นก็ตอบภาษานั้น

คำแนะนำสำคัญในการจัดรูปแบบ Markdown:
- ใช้ "# " (มีช่องว่างหลัง #) สำหรับหัวข้อระดับ 1, "## " สำหรับระดับ 2, "### " สำหรับระดับ 3
- **ห้าม** ใช้ "**ชื่อหัวข้อ**" แทนหัวข้อ ต้องใช้ # เท่านั้น
- ใช้ "* text" (มีช่องว่างหลัง *) สำหรับรายการแบบ bullet points
- ใช้ "1. text" (มีช่องว่างหลังตัวเลขและจุด) สำหรับรายการแบบตัวเลข
- ใช้ "**text**" สำหรับตัวหนา และ "*text*" สำหรับตัวเอียง`;

    // Build Gemini contents array with history for multi-turn conversation
    const contents: { role: string; parts: { text: string }[] }[] = [];

    // Add system instruction as first user message
    let firstUserText = systemPrompt;

    if (context) {
      firstUserText += `\n\nเนื้อหา Note ที่แนบมาเป็น context:\n${context}`;
    }

    // If there's history, include it in the conversation
    if (history && history.length > 0) {
      // First message includes system prompt
      contents.push({
        role: 'user',
        parts: [{ text: firstUserText + '\n\n' + history[0]?.content }],
      });

      // Add remaining history
      for (let i = 1; i < history.length; i++) {
        contents.push({
          role: history[i].role === 'assistant' ? 'model' : 'user',
          parts: [{ text: history[i].content }],
        });
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    } else {
      // No history - single turn with system prompt
      contents.push({
        role: 'user',
        parts: [{ text: firstUserText + '\n\nคำถาม: ' + message }],
      });
    }

    await this.aiUsageService.increment(userId);
    const aiResponse = await this.geminiService.generateChat(contents);

    return { response: aiResponse };
  }
}
