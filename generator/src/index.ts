#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { program } from "commander";
import {
  copyTemplateFiles,
  getTemplateNames,
  printTemplateMarkdownToConsole,
  promptUser,
} from "./utils";

// Command to create a new project
program
  .command("create")
  .description("Create a new microservices project")
  .action(async () => {
    const { projectName, template } = await promptUser();
    const targetDir = path.join(process.cwd(), projectName);

    // Create the target directory
    fs.mkdirSync(targetDir);

    // Copy template files to the target directory
    // TODO: Render multiple templates
    copyTemplateFiles(template, targetDir, projectName);

    // Read and print the readme contents
    printTemplateMarkdownToConsole(template);
  });

program
  .command("infra")
  .description("Add infrastructure to an existing project");

program
  .command("services")
  .description("Add template services to an existing project");

// Command to list available templates
program
  .command("list-templates")
  .description("List available templates")
  .action(() => {
    const templateNames = getTemplateNames();
    console.log(
      "Available templates and instructions:\n",
      templateNames.join("\n")
    );
  });

// Parse command line arguments
program.parse(process.argv);
