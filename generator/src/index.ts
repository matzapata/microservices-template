#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import inquirer from "inquirer";
import * as handlebars from "handlebars";
import { program } from "commander";
import markshell from "markshell";

interface FileConfig {
  source: string;
  target: string;
}

interface TemplateConfig {
  files: FileConfig[];
}

const templatesDir = path.join(__dirname, "..", "templates");

// Function to prompt user for project details
const promptUser = () => {
  return inquirer.prompt([
    { type: "input", name: "projectName", message: "Enter project name:" },
    {
      type: "list",
      name: "template",
      message: "Choose a template:",
      choices: getTemplateNames(),
    },
  ]);
};

// Function to get template names from the templates directory
const getTemplateNames = () => {
  return fs
    .readdirSync(templatesDir)
    .filter((file) => fs.statSync(path.join(templatesDir, file)).isDirectory());
};

// Function to read template configuration
const readTemplateConfig = (
  templateName: string,
  projectName: string
): TemplateConfig => {
  const configPath = path.join(templatesDir, templateName, "config.json");
  const templateConfig: TemplateConfig = JSON.parse(
    fs.readFileSync(configPath, "utf-8")
  );

  // Apply Handlebars templating to the target paths
  templateConfig.files.forEach((fileConfig) => {
    fileConfig.target = handlebars.compile(fileConfig.target)({ projectName });
  });

  return templateConfig;
};

// Function to copy template files to the target directory
const copyTemplateFiles = (
  templateName: string,
  targetDir: string,
  projectName: string
) => {
  const templateConfig = readTemplateConfig(templateName, projectName);

  templateConfig.files.forEach((fileConfig) => {
    const { source, target } = fileConfig;

    const sourceFilePath = path.join(templatesDir, templateName, source);
    const fileContent = fs.readFileSync(sourceFilePath, "utf-8");
    const renderedContent = handlebars.compile(fileContent)({ projectName });
    const targetFilePath = path.join(targetDir, target);

    // Ensure target directory exists
    fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });

    fs.writeFileSync(targetFilePath, renderedContent);
  });
};

// Function to print markdown to the console using markshell
const printTemplateMarkdownToConsole = (template: string) => {
  const readmePath = path.join(templatesDir, template, "readme.md");
  if (fs.existsSync(readmePath)) {
    markshell.toConsole(readmePath);
  }
};

// Command to create a new project
program
  .command("create")
  .description("Create a new project")
  .action(async () => {
    const { projectName, template } = await promptUser();
    const targetDir = path.join(process.cwd(), projectName);

    // Create the target directory
    fs.mkdirSync(targetDir);

    // Copy template files to the target directory
    copyTemplateFiles(template, targetDir, projectName);

    console.log(
      `Project "${projectName}" created successfully in "${targetDir}"`
    );

    // Read and print the readme contents
    printTemplateMarkdownToConsole(template);
  });

// Command to list available templates
program
  .command("list-templates")
  .description("List available templates")
  .action(() => {
    const templateNames = getTemplateNames();
    console.log("Available templates:\n", templateNames.join("\n"));
  });

// Parse command line arguments
program.parse(process.argv);
