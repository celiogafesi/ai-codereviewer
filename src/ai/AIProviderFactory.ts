import { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AmazonBedrockProvider } from "./AmazonBedrockProvider";

export class AIProviderFactory {
  static createProvider(providerType: string, apiKey: string, model: string): AIProvider {
    switch (providerType.toLowerCase()) {
      case "open-ai":
        return new OpenAIProvider(apiKey, model);
      case "amazon-bedrock":
        return new AmazonBedrockProvider(apiKey, model);
      default:
        throw new Error(`Unsupported AI provider type: ${providerType}`);
    }
  }
}
