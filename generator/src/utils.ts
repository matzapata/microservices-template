#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import * as handlebars from "handlebars";
import markshell from "markshell";

function templatesDir(
  template: string // May contain slashes to indicate subdirectories
) {
  const templatePath: string[] = template.includes("/")
    ? template.split("/")
    : [template];

  return path.join(__dirname, "..", "templates", ...templatePath);
}

// Function to copy template files to the target directory
export function renderTemplateFiles(
  template: string, // May contain slashes to indicate subdirectories
  targetDir: string,
  renderData: unknown
) {
  const templateFilesDir = path.join(templatesDir(template), "files");

  // Recursive function to traverse directories
  const renderFileRecursively = (dir: string, relativePath = "") => {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const relativeFilePath = path.join(relativePath, file);

      if (fs.statSync(filePath).isDirectory()) {
        // If it's a directory, recursively render the templates
        renderFileRecursively(filePath, relativeFilePath);
      } else {
        // If it's a file, process it
        const fileContent = fs.readFileSync(filePath, "utf-8");

        // Extract file name, render it, and remove .handlebars extension
        const targetFilePath = path.join(
          targetDir,
          handlebars
            .compile(relativeFilePath)(renderData)
            .replace(/\.handlebars$/, "")
        );

        // Ensure target directory exists
        fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });

        // Render file content using Handlebars and write to target
        const renderedContent = handlebars.compile(fileContent)(renderData);
        fs.writeFileSync(targetFilePath, renderedContent);
      }
    });
  };

  renderFileRecursively(templateFilesDir);
}

// Function to print markdown to the console using markshell
export function printTemplateMarkdownToConsole(template: string) {
  const readmePath = path.join(templatesDir(template), "template-readme.md");
  if (fs.existsSync(readmePath)) {
    markshell.toConsole(readmePath);
  }
}
