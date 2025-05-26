import * as core from "@actions/core";
import { exec } from "child_process";
import { promisify } from "util";
import { unlink, writeFile, stat } from "fs/promises";
import { createWriteStream } from "fs";
import { spawn } from "child_process";

const execAsync = promisify(exec);

const PIPE_PATH = "/tmp/claude_prompt_pipe";
const EXECUTION_FILE = "/tmp/claude-execution-output.json";
const BASE_ARGS = ["-p", "--verbose", "--output-format", "stream-json"];

export type ClaudeOptions = {
  allowedTools?: string;
  disallowedTools?: string;
  maxTurns?: string;
  mcpConfig?: string;
};

type PreparedConfig = {
  claudeArgs: string[];
  promptPath: string;
};

export function prepareRunConfig(
  promptPath: string,
  options: ClaudeOptions,
): PreparedConfig {
  const claudeArgs = [...BASE_ARGS];

  if (options.allowedTools) {
    claudeArgs.push("--allowedTools", options.allowedTools);
  }
  if (options.disallowedTools) {
    claudeArgs.push("--disallowedTools", options.disallowedTools);
  }
  if (options.maxTurns) {
    claudeArgs.push("--max-turns", options.maxTurns);
  }
  if (options.mcpConfig) {
    claudeArgs.push("--mcp-config", options.mcpConfig);
  }

  return {
    claudeArgs,
    promptPath,
  };
}

export async function runClaude(promptPath: string, options: ClaudeOptions) {
  const config = prepareRunConfig(promptPath, options);

  // Log prompt file size
  let promptSize = "unknown";
  try {
    const stats = await stat(config.promptPath);
    promptSize = stats.size.toString();
  } catch (e) {
    // Ignore error
  }

  console.log(`Prompt file size: ${promptSize} bytes`);

  // Output to console
  console.log(`Running Claude with prompt from file: ${config.promptPath}`);
  console.log(`Claude args: ${config.claudeArgs.join(" ")}`);

  // MOCK: Instead of actually executing Claude CLI, return fixed response
  console.log("MOCK MODE: Simulating Claude CLI execution...");

  // Mock fixed response simulating Claude CLI stream-json output
  const mockResponses = [
    '{"type":"status","message":"Starting Claude Code execution..."}',
    '{"type":"info","message":"Processing prompt..."}',
    '{"type":"response","content":"Hello! This is a mock response from Claude. I\'ve analyzed your request and here is my simulated output. In a real scenario, I would process your prompt and provide actual assistance."}',
    '{"type":"status","message":"Execution completed successfully."}',
    '{"type":"metrics","tokens_used":150,"execution_time_ms":2000}'
  ];

  // Simulate output processing with mock data
  let output = "";
  for (const mockResponse of mockResponses) {
    // Pretty print JSON
    const parsed = JSON.parse(mockResponse);
    const prettyJson = JSON.stringify(parsed, null, 2);
    process.stdout.write(prettyJson);
    process.stdout.write("\n");
    
    output += mockResponse + "\n";
    
    // Add small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Mock successful exit code
  const exitCode = 0;

  // Set conclusion based on exit code
  if (exitCode === 0) {
    // Try to process the output and save execution metrics
    try {
      await writeFile("output.txt", output);

      // Process output.txt into JSON and save to execution file
      const { stdout: jsonOutput } = await execAsync("jq -s '.' output.txt");
      await writeFile(EXECUTION_FILE, jsonOutput);

      console.log(`Log saved to ${EXECUTION_FILE}`);
    } catch (e) {
      core.warning(`Failed to process output for execution metrics: ${e}`);
    }

    core.setOutput("conclusion", "success");
    core.setOutput("execution_file", EXECUTION_FILE);
  } else {
    core.setOutput("conclusion", "failure");

    // Still try to save execution file if we have output
    if (output) {
      try {
        await writeFile("output.txt", output);
        const { stdout: jsonOutput } = await execAsync("jq -s '.' output.txt");
        await writeFile(EXECUTION_FILE, jsonOutput);
        core.setOutput("execution_file", EXECUTION_FILE);
      } catch (e) {
        // Ignore errors when processing output during failure
      }
    }

    process.exit(exitCode);
  }
}
