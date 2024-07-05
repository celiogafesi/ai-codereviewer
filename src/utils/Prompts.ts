import { File, Chunk } from "parse-diff";
import { PRDetails } from "../github/PRDetails";

export function createPrompt(file: File, chunk: Chunk, prDetails: PRDetails): string {
  return `Your task is to review pull requests. Instructions:
  - Provide the response in following JSON format:  {"reviews": [{"lineNumber":  <line_number>, "reviewComment": "<review comment>"}]}
  - Do not give positive comments or compliments.
  - Provide comments and suggestions ONLY if there is something to improve, otherwise "reviews" should be an empty array.
  - Write the comment in GitHub Markdown format.
  - Use the given description only for the overall context and only comment the code.
  - IMPORTANT: NEVER suggest adding comments to the code.

  Review the following code diff in the file "${file.to}" and take the pull request title and description into account when writing the response.

  Pull request title: ${prDetails.title}
  Pull request description:

  ---
  ${prDetails.description}
  ---

  Git diff to review:

  \`\`\`diff
  ${chunk.content}
  ${chunk.changes
    .map((c) => `${'ln' in c ? (c as any).ln : 'ln2' in c ? (c as any).ln2 : ''} ${c.content}`)
    .join("\n")}
  \`\`\`
  `;
}
