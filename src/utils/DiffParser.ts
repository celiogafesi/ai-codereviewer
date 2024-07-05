import parseDiff, { File } from "parse-diff";
import minimatch from "minimatch";
import * as core from "@actions/core";

export function parseAndFilterDiff(diff: string): File[] {
  const parsedDiff = parseDiff(diff);
  const excludePatterns = core
    .getInput("exclude")
    .split(",")
    .map((s) => s.trim());

  return parsedDiff.filter((file) => {
    return !excludePatterns.some((pattern) =>
      minimatch(file.to ?? "", pattern)
    );
  });
}
