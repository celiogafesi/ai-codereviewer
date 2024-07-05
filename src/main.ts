import { readFileSync } from "fs";
import * as core from "@actions/core";
import { AIProviderFactory } from "./ai/AIProviderFactory";
import { GitHubService } from "./github/GitHubService";
import { parseAndFilterDiff } from "./utils/DiffParser";
import { createPrompt } from "./utils/Prompts";
import { createComment } from "./utils/CommentFormatter";

async function main() {
  const GITHUB_TOKEN: string = core.getInput("GITHUB_TOKEN");
  const API_KEY: string = core.getInput("API_KEY");
  const API_MODEL: string = core.getInput("API_MODEL");

  const githubService = new GitHubService(GITHUB_TOKEN);
  const aiProvider = AIProviderFactory.createProvider("open-ai", API_KEY, "gpt-4-1106-preview");

  try {
    const prDetails = await githubService.getPRDetails();
    let diff: string | null;
    const eventData = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH ?? "", "utf8")
    );

    if (eventData.action === "opened" || eventData.action === "synchronize") {
      diff = await githubService.getDiff(prDetails);
    } else {
      console.log("Unsupported event:", process.env.GITHUB_EVENT_NAME);
      return;
    }

    if (!diff) {
      console.log("No diff found");
      return;
    }

    const parsedDiff = parseAndFilterDiff(diff);
    const comments = [];

    for (const file of parsedDiff) {
      if (file.to === "/dev/null") continue; // Ignore deleted files
      for (const chunk of file.chunks) {
        const prompt = createPrompt(file, chunk, prDetails);
        const aiResponses = await aiProvider.getAIResponse(prompt);
        if (aiResponses) {
          const newComments = createComment(file, chunk, aiResponses);
          comments.push(...newComments);
        }
      }
    }

    if (comments.length > 0) {
      await githubService.createReviewComment(prDetails, comments);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
