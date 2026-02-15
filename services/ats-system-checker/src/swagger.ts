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

  // Always use manual parsing since swagger-jsdoc doesn't read TypeScript files well in runtime
  console.log("📖 Parsing swagger files manually...");

  // Manually parse the swagger files
  try {
    const docsDir = path.join(process.cwd(), 'src/docs');
    const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.swagger.ts'));

    console.log(`📄 Found ${files.length} swagger files`);

    const allPaths: any = {};

    files.forEach(file => {
      try {
        const filePath = path.join(docsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Extract all @swagger comment blocks
        // Match /** ... @swagger ... ... */ blocks (non-greedy to handle multiple blocks)
        const swaggerRegex = /\/\*\*[\s\S]*?@swagger([\s\S]*?)\*\//g;
        let match;
        let blockCount = 0;

        while ((match = swaggerRegex.exec(content)) !== null) {
          blockCount++;
          // Clean the block - remove comment markers
          let yamlContent = match[1]
            .replace(/\/\*\*/g, '')  // Remove opening /** if any
            .replace(/\*\//g, '')    // Remove closing */ if any
            .replace(/^\s*\*/gm, '')  // Remove leading * from each line
            .trim();

          // Parse YAML using js-yaml
          try {
            const yaml = require("js-yaml");
            const parsed = yaml.load(yamlContent) as any;

            if (parsed && typeof parsed === 'object') {
              // Merge all paths from this block
              Object.keys(parsed).forEach(key => {
                // Accept paths that start with /ats-checker/ or /health
                if (key.startsWith('/ats-checker/') || key.startsWith('/health')) {
                  if (!allPaths[key]) {
                    allPaths[key] = {};
                  }
                  // Merge methods for the same path
                  Object.assign(allPaths[key], parsed[key]);
                  console.log(`    ✓ Added path: ${key} with methods: ${Object.keys(parsed[key]).join(', ')}`);
                } else {
                  console.warn(`    ⚠ Skipping path ${key} (doesn't match expected pattern)`);
                }
              });
            } else {
              console.warn(`    ⚠ Parsed content is not an object in ${file}, block ${blockCount}`);
              console.warn(`    Parsed type: ${typeof parsed}, value:`, parsed);
            }
          } catch (yamlError: any) {
            console.warn(`    ⚠ Could not parse YAML from ${file}, block ${blockCount}:`, yamlError.message);
            // Log first few lines of YAML for debugging
            const firstLines = yamlContent.split('\n').slice(0, 10).join('\n');
            console.warn(`    First lines of YAML:\n${firstLines}`);
            console.warn(`    YAML Error details:`, yamlError);
          }
        }

        if (blockCount === 0) {
          console.warn(`  ⚠ No swagger blocks found in ${file}`);
        } else {
          console.log(`  📝 Found ${blockCount} swagger block(s) in ${file}`);
        }
      } catch (fileError: any) {
        console.warn(`⚠ Error reading ${file}:`, fileError.message);
      }
    });

    swaggerSpec = {
      ...swaggerOptions.definition,
      paths: allPaths,
    };

    const pathCount = Object.keys(allPaths).length;
    console.log(`✓ Swagger initialized manually - Found ${pathCount} path definitions`);
    
    // Log all paths for debugging
    if (pathCount > 0) {
      console.log(`📋 All paths found:`);
      Object.keys(allPaths).forEach(path => {
        const methods = Object.keys(allPaths[path]);
        console.log(`  - ${path} [${methods.join(', ')}]`);
      });
    } else {
      console.error(`❌ No paths found! Check that swagger files contain valid YAML.`);
    }

    swaggerInitialized = true;
  } catch (manualError: any) {
    console.error("❌ Failed to manually parse swagger files:", manualError.message);
    // Create minimal spec
    swaggerSpec = {
      ...swaggerOptions.definition,
      paths: {},
    };
    swaggerInitialized = true;
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

