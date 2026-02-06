/**
 * Replicate API Test Script
 *
 * Tests img2img generation using Replicate's SDXL models.
 *
 * Installation (einmalig):
 *   npm install -D tsx
 *
 * Usage:
 *   npx tsx scripts/replicate-test.ts [model]
 *
 * Available models:
 *   - sdxl     : Standard SDXL img2img
 *   - pixar    : Pixar 3D animation style (default)
 *   - simpsons : Simpsons cartoon style
 *   - emoji    : Emoji style
 *
 * Requirements:
 *   - REPLICATE_API_TOKEN must be set in .env.local
 *   - Get your token at: https://replicate.com/account/api-tokens
 *
 * ============================================================
 * KOSTEN (Stand 2025):
 * ============================================================
 *   - SDXL img2img: ~$0.0032 pro Bild (bei 30 steps)
 *   - SDXL Fine-tuned (Pixar/Simpsons): ~$0.004-0.005 pro Bild (bei 50 steps)
 *   - Abrechnung erfolgt pro Sekunde GPU-Zeit
 *   - Typische Generation: 10-30 Sekunden auf A40 GPU
 *   - Bei 1000 Bildern/Monat: ca. $3-5
 *   - Details: https://replicate.com/pricing
 *
 *   GPU-Preise (Replicate):
 *   - Nvidia A40 (SDXL): $0.000575/sec = ~$0.002/min
 *   - Nvidia A100: $0.0014/sec
 * ============================================================
 */

import Replicate from 'replicate';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local manually (no dotenv dependency needed)
function loadEnvFile(envPath: string): void {
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([^=]+)=["']?(.*)["']?$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove surrounding quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

// Load .env.local
const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(scriptDir, '..');
loadEnvFile(path.join(projectRoot, '.env.local'));

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

if (!REPLICATE_API_TOKEN) {
  console.error('ERROR: REPLICATE_API_TOKEN not found in .env.local');
  console.error('');
  console.error('Please add your Replicate API token to .env.local:');
  console.error('  REPLICATE_API_TOKEN="r8_your_token_here"');
  console.error('');
  console.error('Get your token at: https://replicate.com/account/api-tokens');
  process.exit(1);
}

const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
});

const OUTPUT_DIR = path.join(projectRoot, 'public', 'mockups');
const SOURCE_URL = 'https://lumeries.com/api/generate-moon-image?scale=2';

// Available test models
const MODELS = {
  // SDXL img2img - General purpose
  sdxl: {
    id: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    name: 'SDXL (Standard)',
    cost: '~$0.0032/image',
    getInput: (imageUrl: string) => ({
      image: imageUrl,
      prompt: 'artistic poster design, high quality print, vibrant colors, professional artwork',
      negative_prompt: 'blurry, low quality, distorted, ugly',
      num_inference_steps: 30,
      guidance_scale: 7.5,
      prompt_strength: 0.6, // Lower = more faithful to original
      width: 1024,
      height: 1024,
    }),
  },

  // Pixar Style
  pixar: {
    id: 'swartype/sdxl-pixar:81f8bbd3463056c8521eb528feb10509cc1385e2fabef590747f159848589048',
    name: 'SDXL Pixar Style',
    cost: '~$0.004/image',
    getInput: (imageUrl: string) => ({
      image: imageUrl,
      prompt: '3d pixar animation style poster, pixar movie artwork, colorful and vibrant',
      negative_prompt: 'noisy, messy, grainy, photo, NSFW, blurry, low quality',
      num_inference_steps: 50,
      guidance_scale: 7.5,
      prompt_strength: 0.65,
      width: 1024,
      height: 1024,
    }),
  },

  // Simpsons Style
  simpsons: {
    id: 'fofr/sdxl-simpsons-characters:c8e539cf095b8a1127dc389fb7f68f92e33184fcab8af0cc0fe36d4c0a8d63de',
    name: 'SDXL Simpsons Style',
    cost: '~$0.004/image',
    getInput: (imageUrl: string) => ({
      image: imageUrl,
      prompt: 'simpsons cartoon style poster, 2d cartoon artwork, the simpsons art style',
      negative_prompt: 'realistic, photo, 3d, noisy, blurry, low quality',
      num_inference_steps: 50,
      guidance_scale: 7.5,
      prompt_strength: 0.65,
      width: 1024,
      height: 1024,
    }),
  },

  // Emoji Style (fun alternative)
  emoji: {
    id: 'fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e',
    name: 'SDXL Emoji Style',
    cost: '~$0.004/image',
    getInput: (imageUrl: string) => ({
      image: imageUrl,
      prompt: 'emoji style, cute cartoon, simple shapes, colorful',
      negative_prompt: 'realistic, photo, detailed, complex',
      num_inference_steps: 50,
      guidance_scale: 7.5,
      prompt_strength: 0.7,
      width: 1024,
      height: 1024,
    }),
  },
};

type ModelKey = keyof typeof MODELS;

async function downloadImage(url: string, outputPath: string): Promise<void> {
  console.log(`Downloading image from: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Saved to: ${outputPath}`);
}

async function runReplicateModel(modelKey: ModelKey, sourceImageUrl: string): Promise<string> {
  const model = MODELS[modelKey];
  console.log(`\n--- Running ${model.name} ---`);
  console.log(`Estimated cost: ${model.cost}`);
  console.log(`Source image: ${sourceImageUrl}`);

  const startTime = Date.now();

  try {
    const output = await replicate.run(model.id as `${string}/${string}:${string}`, {
      input: model.getInput(sourceImageUrl),
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Generation completed in ${duration}s`);

    // Handle output format (can be array of FileOutput objects or strings)
    let resultUrl: string;

    if (Array.isArray(output) && output.length > 0) {
      const firstItem = output[0];
      if (typeof firstItem === 'object' && 'url' in firstItem) {
        resultUrl = typeof firstItem.url === 'function' ? firstItem.url() : String(firstItem.url);
      } else if (typeof firstItem === 'string') {
        resultUrl = firstItem;
      } else {
        throw new Error('Unexpected output item format');
      }
    } else if (typeof output === 'string') {
      resultUrl = output;
    } else {
      console.log('Raw output:', JSON.stringify(output, null, 2));
      throw new Error('Unexpected output format from Replicate');
    }

    console.log(`Result URL: ${resultUrl}`);
    return resultUrl;

  } catch (error: any) {
    console.error(`Error running ${model.name}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('=== Replicate API Test ===\n');
  console.log('Source: lumeries.com Moon Poster API');
  console.log(`Output directory: ${OUTPUT_DIR}`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Select which model to test (can be changed via command line arg)
  const modelArg = process.argv[2] as ModelKey | undefined;
  const selectedModel: ModelKey = modelArg && modelArg in MODELS ? modelArg : 'pixar';

  console.log(`\nSelected model: ${MODELS[selectedModel].name}`);
  console.log('(Change model with: npx tsx scripts/replicate-test.ts [sdxl|pixar|simpsons|emoji])');

  try {
    // Step 1: Run img2img transformation
    // Note: We pass the URL directly - Replicate can fetch it
    const resultUrl = await runReplicateModel(selectedModel, SOURCE_URL);

    // Step 2: Download and save result
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFilename = `replicate_test_${selectedModel}_${timestamp}.png`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    await downloadImage(resultUrl, outputPath);

    console.log('\n=== Test Completed Successfully ===');
    console.log(`Output saved to: ${outputPath}`);
    console.log(`\nCost summary for ${MODELS[selectedModel].name}:`);
    console.log(`  Estimated: ${MODELS[selectedModel].cost}`);
    console.log('  (Actual cost depends on GPU time - check Replicate dashboard)');

  } catch (error: any) {
    console.error('\n=== Test Failed ===');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
main();
