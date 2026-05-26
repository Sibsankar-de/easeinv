import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { createModuleLogger } from "../utils/logger";

const log = createModuleLogger(import.meta.url);

// Options for rendering email
interface RenderEmailOptions<T = Record<string, any>> {
  templateName: string;
  data: T;
}

// Resolve template path safely
const getTemplatePath = (templateName: string) => {
  return path.join(process.cwd(), "src/templates/emails", templateName);
};

// Read file safely
const loadTemplate = async (filePath: string): Promise<string> => {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Email template not found: ${filePath}`);
  }
};

// Compile Handlebars template
const compileTemplate = <T>(source: string, data: T): string => {
  try {
    const template = Handlebars.compile(source);
    return template(data);
  } catch (error) {
    throw new Error("Error compiling Handlebars template");
  }
};

// Convert MJML to HTML
const convertToHtml = async (mjml: string): Promise<string> => {
  const { html, errors } = await mjml2html(mjml, {
    validationLevel: "soft",
  });

  if (errors && errors.length > 0) {
    log.warn("MJML warnings:" + errors);
  }

  return html;
};

export const renderEmail = async <T>({
  templateName,
  data,
}: RenderEmailOptions<T>): Promise<string> => {
  const templatePath = getTemplatePath(templateName);
  const source = await loadTemplate(templatePath);

  const mjmlWithData = compileTemplate(source, data);

  const html = await convertToHtml(mjmlWithData);

  return html;
};
