import swaggerUi from "swagger-ui-express";
import { swaggerOptions } from "./config/swagger.config";
import fs from "fs";
import path from "path";

let swaggerSpec: any = null;
let swaggerInitialized = false;

function initializeSwagger() {
  if (swaggerInitialized) {
    return swaggerSpec;
  }

  // Try swagger-jsdoc first, fallback to manual parsing if it fails
  try {
    const swaggerJsdoc = require("swagger-jsdoc");
    swaggerSpec = swaggerJsdoc(swaggerOptions);
    
    const pathCount = swaggerSpec.paths ? Object.keys(swaggerSpec.paths).length : 0;
    if (pathCount > 0) {
      swaggerInitialized = true;
      return swaggerSpec;
    } else {
      throw new Error("No paths found");
    }
  } catch (error: any) {
    // If swagger-jsdoc fails, use manual parsing silently
    try {
      const docsDir = path.join(process.cwd(), 'src/docs');
      const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.swagger.ts'));

      const allPaths: any = {};

      files.forEach(file => {
        try {
          const filePath = path.join(docsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');

          // Extract @swagger comment block
          const swaggerBlockMatch = content.match(/\/\*\*[\s\S]*?@swagger([\s\S]*?)\*\//);
          
          if (!swaggerBlockMatch) {
            return;
          }

          // Clean YAML content
          let yamlContent = swaggerBlockMatch[1]
            .replace(/\/\*\*/g, '')
            .replace(/\*\//g, '')
            .replace(/^\s*\*/gm, '')
            .trim();

          // Parse with js-yaml
          try {
            const yaml = require("js-yaml");
            const parsed = yaml.load(yamlContent, { 
              schema: yaml.DEFAULT_SCHEMA,
              strict: false 
            }) as any;

            if (parsed && typeof parsed === 'object') {
              Object.keys(parsed).forEach(key => {
                if (key.startsWith('/ats-checker/') || key.startsWith('/health')) {
                  if (!allPaths[key]) {
                    allPaths[key] = {};
                  }
                  Object.assign(allPaths[key], parsed[key]);
                }
              });
            }
          } catch (yamlError: any) {
            // Silent fail
          }
        } catch (fileError: any) {
          // Silent fail
        }
      });

      swaggerSpec = {
        ...swaggerOptions.definition,
        paths: allPaths,
      };
      
      swaggerInitialized = true;
    } catch (manualError: any) {
      swaggerSpec = {
        ...swaggerOptions.definition,
        paths: {},
      };
      swaggerInitialized = true;
    }
  }

  return swaggerSpec;
}

// Initialize on first access
function getSwaggerSpec() {
  if (!swaggerSpec) {
    return initializeSwagger();
  }
  return swaggerSpec;
}

// Initialize Swagger at module load to catch errors early
initializeSwagger();

export { swaggerUi, getSwaggerSpec };

