#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { program } from "commander";
import { renderTemplateFiles, printTemplateMarkdownToConsole } from "./utils";
import inquirer from "inquirer";

program
  .command("project")
  .description("Create a new microservices project")
  .option("-i, --instructions", "Print only the instructions")
  .action(async (opts) => {
    const template = "project";

    if (!opts.instructions) {
      const { projectName, commonPackageName, host } = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "Enter project name:",
        },
        {
          type: "input",
          name: "commonPackageName",
          message: "Enter common package name (ex: @orgname/proy-common):",
        },
        {
          type: "input",
          name: "host",
          message: "Enter host domain (ex: www.microservices.com):",
        },
      ]);
      const targetDir = path.join(process.cwd(), projectName);

      // Create the target directory
      fs.mkdirSync(targetDir);

      // Copy template files to the target directory
      await renderTemplateFiles(template, targetDir, {
        projectName,
        commonPackageName,
        host,
      });
    }

    // Read and print the readme contents. Here we include manual steps and instructions
    printTemplateMarkdownToConsole(template);
  });

program
  .command("infra")
  .description("Add infrastructure to an existing project")
  .option("-i, --instructions", "Print only the instructions")
  .action(async (opts) => {
    const { infraTemplate } = await inquirer.prompt([
      {
        type: "list",
        name: "infraTemplate",
        message: "Select a infrastructure:",
        choices: ["redis", "mongodb", "postgres", "nats"],
      },
    ]);
    const template = "infra" + "/" + infraTemplate;

    if (!opts.instructions) {
      const { infraName } = await inquirer.prompt([
        {
          type: "input",
          name: "infraName",
          message: "Select a name for the infrastructure generated:",
        },
      ]);
      const targetDir = path.join(process.cwd(), "infra", "k8s");

      // Check directory exists
      if (!fs.existsSync(targetDir)) {
        return console.error(
          `Directory does not exist: ${targetDir}. Make sure to run this from project root.`
        );
      }

      // Copy template files to the target directory
      await renderTemplateFiles(template, targetDir, {
        infraName,
      });
    }

    printTemplateMarkdownToConsole(template);
  });

program
  .command("services")
  .description("Add template services to an existing project")
  .option("-i, --instructions", "Print only the instructions")
  .action(async (opts) => {
    const { serviceTemplate } = await inquirer.prompt([
      {
        type: "list",
        name: "serviceTemplate",
        message: "Select a service:",
        choices: ["auth", "base"],
      },
    ]);
    const template = "services" + "/" + serviceTemplate;

    if (!opts.instructions) {
      // Check we're running this from project root
      if (!fs.existsSync(path.join(process.cwd(), "infra"))) {
        return console.error("Make sure to run this from project root.");
      }

      const { serviceName, commonPackageName, commonPackageVersion } =
        await inquirer.prompt([
          {
            type: "input",
            name: "serviceName",
            message: "Enter the service name:",
          },
          {
            type: "input",
            name: "commonPackageName",
            message: "Enter common package name:",
          },
          {
            type: "input",
            name: "commonPackageVersion",
            message: "Enter common package version number (ex: 0.2.0):",
          },
        ]);

      const targetDir = path.join(process.cwd(), serviceName);

      // Create the target directory
      fs.mkdirSync(targetDir);

      // Copy template files to the target directory
      await renderTemplateFiles(template, targetDir, {
        serviceName,
        commonPackageName,
        commonPackageVersion,
      });
    }

    // Read and print the readme contents
    printTemplateMarkdownToConsole(template);
  });

program
  .command("client")
  .description("Create a client project")
  .option("-i, --instructions", "Print only the instructions")
  .action(async (opts) => {
    const template = "client";

    if (!opts.instructions) {
      const { clientName, commonPackageName, commonPackageVersion } =
        await inquirer.prompt([
          {
            type: "input",
            name: "clientName",
            message: "Enter the client name:",
          },
          {
            type: "input",
            name: "commonPackageName",
            message: "Enter common package name:",
          },
          {
            type: "input",
            name: "commonPackageVersion",
            message: "Enter common package version number (ex: 0.2.0):",
          },
        ]);
      const targetDir = path.join(process.cwd(), clientName);

      // Create the target directory
      fs.mkdirSync(targetDir);

      // Copy template files to the target directory
      await renderTemplateFiles(template, targetDir, {
        clientName,
        commonPackageName,
        commonPackageVersion,
      });
    }

    // Read and print the readme contents
    printTemplateMarkdownToConsole(template);
  });

// Parse command line arguments
program.parse(process.argv);
