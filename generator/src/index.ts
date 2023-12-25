#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { program } from "commander";
import { renderTemplateFiles, printTemplateMarkdownToConsole } from "./utils";
import inquirer from "inquirer";

// Command to create a new project
program
  .command("create")
  .description("Create a new microservices project")
  .action(async () => {
    const { projectName, commonPackageName } = await inquirer.prompt([
      { type: "input", name: "projectName", message: "Enter project name:" },
      {
        type: "input",
        name: "commonPackageName",
        message: "Enter common package name:",
      },
    ]);
    const targetDir = path.join(process.cwd(), projectName);
    const template = "project";

    // Create the target directory
    fs.mkdirSync(targetDir);

    try {
      // Copy template files to the target directory
      renderTemplateFiles(template, targetDir, {
        projectName,
        commonPackageName,
      });

      // Read and print the readme contents
      printTemplateMarkdownToConsole(template);
    } catch (e) {
      console.log(e);
    }
  });

program
  .command("infra")
  .description("Add infrastructure to an existing project");

program
  .command("services")
  .description("Add template services to an existing project");

// Parse command line arguments
program.parse(process.argv);
