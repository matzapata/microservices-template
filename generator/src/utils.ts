#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import inquirer from "inquirer";
import * as handlebars from "handlebars";
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
export function promptUser() {
  return inquirer.prompt([
    { type: "input", name: "projectName", message: "Enter project name:" },
    {
      type: "list",
      name: "template",
      message: "Choose a template:",
      choices: getTemplateNames(),
    },
  ]);
}

// Function to get template names from the templates directory
export function getTemplateNames() {
  return fs
    .readdirSync(templatesDir)
    .filter((file) => fs.statSync(path.join(templatesDir, file)).isDirectory());
}

// Function to read template configuration
function readTemplateConfig(
  templateName: string,
  projectName: string
): TemplateConfig {
  const configPath = path.join(
    templatesDir,
    templateName,
    "template-config.json"
  );
  const templateConfig: TemplateConfig = JSON.parse(
    fs.readFileSync(configPath, "utf-8")
  );

  // Apply Handlebars templating to the target paths
  templateConfig.files.forEach((fileConfig) => {
    fileConfig.target = handlebars.compile(fileConfig.target)({ projectName });
  });

  return templateConfig;
}

// Function to copy template files to the target directory
export function copyTemplateFiles(
  templateName: string,
  targetDir: string,
  projectName: string
) {
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
}

// Function to print markdown to the console using markshell
export function printTemplateMarkdownToConsole(template: string) {
  const readmePath = path.join(templatesDir, template, "template-readme.md");
  if (fs.existsSync(readmePath)) {
    markshell.toConsole(readmePath);
  }
}
