import { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./OpenAIProvider";

export class AIProviderFactory {
  static createProvider(apiKey: string, model: string): AIProvider {
    return new OpenAIProvider(apiKey, model);
  }
}
