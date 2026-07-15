import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";
import mjml2html from "mjml";
import { createModuleLogger } from "../utils/logger";
import { env } from "../configs/env";
import { clientAssets } from "../constants/client.constant";


const log = createModuleLogger(import.meta.url);

// Options for rendering email
interface RenderEmailOptions<T = Record<string, unknown>> {
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
    console.error("MJML conversion errors:", errors);
    log.warn("MJML warnings: " + errors?.[0]?.formattedMessage);
  }

  return html;
};

export const renderEmail = async <T>({
  templateName,
  data,
}: RenderEmailOptions<T>): Promise<string> => {
  const templatePath = getTemplatePath(templateName);
  const source = await loadTemplate(templatePath);

  const mergedContext = {
    clientUrl: env.CLIENT_URL || "http://localhost:3000",
    logoFullUrl: clientAssets.LOGO_FULL,
    ...(data as Record<string, unknown>),
  };

  const mjmlWithData = compileTemplate(source, mergedContext);

  const html = await convertToHtml(mjmlWithData);

  return html;
};
