import OpenAI from "openai";
import { AIProvider, AIResponse } from "./AIProvider";

export class AmazonBedrockProvider implements AIProvider {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  async getAIResponse(prompt: string): Promise<AIResponse[] | null> {
    const queryConfig = {
      model: this.model,
      temperature: 0.2,
      max_tokens: 700,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    try {
      const response = await this.openai.chat.completions.create({
        ...queryConfig,
        // return JSON if the model supports it:
        ...(this.model === "gpt-4-1106-preview"
          ? { response_format: { type: "json_object" } }
          : {}),
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
      });

      const res = response.choices[0].message?.content?.trim() || "{}";
      console.log(res);
      return JSON.parse(res).reviews;
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  }
}
