import { Octokit } from "@octokit/rest";
import * as core from "@actions/core";
import { PRDetails } from "./PRDetails";
import { readFileSync } from "fs";

export class GitHubService {
  private octokit: Octokit;

  constructor(authToken: string) {
    this.octokit = new Octokit({ auth: authToken });
  }

  async getPRDetails(): Promise<PRDetails> {
    const { repository, number } = JSON.parse(
      readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8")
    );
    const prResponse = await this.octokit.pulls.get({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: number,
    });
    return {
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: number,
      title: prResponse.data.title ?? "",
      description: prResponse.data.body ?? "",
    };
  }

  async getDiff(prDetails: PRDetails): Promise<string | null> {
    const latestPRDetails = await this.octokit.pulls.get({
      owner: prDetails.owner,
      repo: prDetails.repo,
      pull_number: prDetails.pull_number,
    });

    const baseSha = latestPRDetails.data.base.sha;
    const headSha = latestPRDetails.data.head.sha;

    const response = await this.octokit.repos.compareCommits({
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
      owner: prDetails.owner,
      repo: prDetails.repo,
      base: baseSha,
      head: headSha,
    });

    return String(response.data);
  }

  async createReviewComment(
    prDetails: PRDetails,
    comments: Array<{ body: string; path: string; line: number }>
  ): Promise<void> {
    await this.octokit.pulls.createReview({
      owner: prDetails.owner,
      repo: prDetails.repo,
      pull_number: prDetails.pull_number,
      comments,
      event: "COMMENT",
    });
  }
}
