#!/usr/bin/env bun

import * as core from "@actions/core";
import { preparePrompt } from "./prepare-prompt";
import { runClaude } from "./run-claude";
import { validateEnvironmentVariables } from "./validate-env";

async function run() {
  try {
    validateEnvironmentVariables();
    core.info("validateEnvironmentVariables completed without throwing an error.");

    const promptConfig = await preparePrompt({
      prompt: process.env.INPUT_PROMPT || "",
      promptFile: process.env.INPUT_PROMPT_FILE || "",
    });
    core.info("preparePrompt completed.");

    await runClaude(promptConfig.path, {
      allowedTools: process.env.INPUT_ALLOWED_TOOLS,
      disallowedTools: process.env.INPUT_DISALLOWED_TOOLS,
      maxTurns: process.env.INPUT_MAX_TURNS,
      mcpConfig: process.env.INPUT_MCP_CONFIG,
    });
    core.info("runClaude completed.");
  } catch (error: any) {
    core.error("Error caught in src/index.ts run() function:");
    core.error(`Error type: ${Object.prototype.toString.call(error)}`);
    if (error instanceof Error) {
      core.error(`Error name: ${error.name}`);
      core.error(`Error message: ${error.message}`);
      if (error.stack) {
        core.error(`Error stack: ${error.stack}`);
      }
    } else {
      core.error(`Caught non-Error object: ${String(error)}`);
    }
    core.setFailed(`Action failed with error: ${error}`);
    core.setOutput("conclusion", "failure");
    process.exit(1);
  }
}

if (import.meta.main) {
  run();
}
