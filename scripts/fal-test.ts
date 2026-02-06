/**
 * FAL.AI IMG2IMG TEST SCRIPT
 * ==========================
 *
 * Dieses Script testet fal.ai als automatisierte img2img Loesung
 * fuer Poster-Mockup-Generierung.
 *
 * SETUP:
 * ------
 * 1. API Key bekommen:
 *    - Gehe zu https://fal.ai
 *    - Registriere dich (GitHub/Google Login moeglich)
 *    - Gehe zu https://fal.ai/dashboard/keys
 *    - Erstelle einen neuen API Key
 *    - Du bekommst $10 kostenlose Credits zum Start
 *
 * 2. Environment Variable setzen:
 *    export FAL_KEY="dein-api-key-hier"
 *    oder in .env.local: FAL_KEY=dein-api-key-hier
 *
 * VERFUEGBARE IMG2IMG MODELLE AUF FAL.AI:
 * ---------------------------------------
 *
 * 1. FLUX.1 [dev] Image-to-Image (fal-ai/flux/dev/image-to-image)
 *    - Beste Qualitaet fuer kreative Transformationen
 *    - Kosten: ~$0.025 pro Bild (512x512), ~$0.05 pro Bild (1024x1024)
 *    - Empfohlen fuer: Stilistische Aenderungen, Artwork
 *
 * 2. FLUX.1 [schnell] Image-to-Image (fal-ai/flux-realism/image-to-image)
 *    - Schneller, guenstiger
 *    - Kosten: ~$0.003 pro Bild
 *    - Empfohlen fuer: Schnelle Tests, einfache Transformationen
 *
 * 3. SDXL Image-to-Image (fal-ai/fast-sdxl/image-to-image)
 *    - Klassischer SDXL Ansatz
 *    - Kosten: ~$0.01-0.02 pro Bild
 *    - Empfohlen fuer: Traditionelle img2img Workflows
 *
 * 4. ControlNet SDXL (fal-ai/fast-sdxl-controlnet-canny)
 *    - Mit Kanten-Erkennung fuer praezise Kontrolle
 *    - Kosten: ~$0.02 pro Bild
 *    - Empfohlen fuer: Struktur-erhaltende Transformationen
 *
 * 5. IP-Adapter SDXL (fal-ai/ip-adapter-face-id)
 *    - Fuer Gesichts/Stil-Transfer
 *    - Kosten: ~$0.02 pro Bild
 *
 * BESTE MODELLE FUER "POSTER IN RAUM" MOCKUPS:
 * --------------------------------------------
 *
 * Option A: FLUX.1 [dev] mit Inpainting (fal-ai/flux/dev/inpainting)
 *   - Kann einen Bereich im Bild ersetzen
 *   - Ideal wenn du ein Raum-Foto hast und das Poster einsetzen willst
 *   - Prompt: "modern minimalist poster on white wall, living room"
 *
 * Option B: SDXL ControlNet (fal-ai/fast-sdxl-controlnet-canny)
 *   - Behaelt die Struktur des Original-Posters
 *   - Fuegt Raum-Kontext hinzu
 *   - Prompt: "poster frame on wall in modern living room, photorealistic"
 *
 * Option C: FLUX Fill (fal-ai/flux/dev/fill)
 *   - Neueres Modell fuer Inpainting
 *   - Sehr gute Qualitaet
 *
 * EMPFEHLUNG FUER MOCKUPS:
 * Der beste Ansatz ist NICHT reines img2img, sondern:
 * 1. Verwende vorgefertigte Mockup-Templates (Raum-Bilder mit leerem Rahmen)
 * 2. Nutze Compositing (Poster in Rahmen einsetzen)
 * 3. Optional: FLUX Inpainting fuer Feinschliff
 *
 * USAGE:
 * ------
 * npx ts-node scripts/fal-test.ts
 *
 * oder mit bun:
 * bun run scripts/fal-test.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// ============================================================================
// CONFIGURATION
// ============================================================================

const FAL_API_KEY = process.env.FAL_KEY || process.env.FAL_API_KEY || '';
const FAL_API_BASE = 'https://queue.fal.run';

const SOURCE_IMAGE_URL = 'https://lumeries.com/api/generate-moon-image?scale=2';
const OUTPUT_DIR = '/Users/waleria/Desktop/poster/public/mockups';

// ============================================================================
// TYPES
// ============================================================================

interface FalQueueResponse {
  request_id: string;
  status: string;
  response_url: string;
  status_url: string;
}

interface FalStatusResponse {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  logs?: Array<{ message: string }>;
}

interface FalResultImage {
  url: string;
  width: number;
  height: number;
  content_type: string;
}

interface FalImg2ImgResult {
  images: FalResultImage[];
  timings?: {
    inference: number;
  };
  seed?: number;
  has_nsfw_concepts?: boolean[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Download an image from URL and return as base64
 */
async function downloadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadImageAsBase64(redirectUrl).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString('base64');
        const mimeType = response.headers['content-type'] || 'image/png';
        resolve(`data:${mimeType};base64,${base64}`);
      });
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Download image from URL and save to file
 */
async function downloadAndSaveImage(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadAndSaveImage(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Make a request to fal.ai API
 */
async function falRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: object
): Promise<T> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, FAL_API_BASE);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`API Error ${res.statusCode}: ${data}`));
            return;
          }
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Wait for a queued job to complete
 */
async function waitForCompletion(statusUrl: string, responseUrl: string): Promise<FalImg2ImgResult> {
  console.log('Waiting for completion...');

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const status = await falRequest<FalStatusResponse>(statusUrl);
    console.log(`  Status: ${status.status}`);

    if (status.logs) {
      status.logs.forEach(log => console.log(`  Log: ${log.message}`));
    }

    if (status.status === 'COMPLETED') {
      return await falRequest<FalImg2ImgResult>(responseUrl);
    }

    if (status.status === 'FAILED') {
      throw new Error('Job failed');
    }
  }
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test SDXL Image-to-Image
 */
async function testSDXLImg2Img(imageUrl: string): Promise<string | null> {
  console.log('\n=== Testing SDXL Image-to-Image ===');
  console.log('Model: fal-ai/fast-sdxl/image-to-image');
  console.log('Estimated cost: ~$0.01-0.02');

  try {
    const result = await falRequest<FalQueueResponse>(
      'https://queue.fal.run/fal-ai/fast-sdxl/image-to-image',
      'POST',
      {
        image_url: imageUrl,
        prompt: 'elegant framed poster hanging on a modern white wall in a stylish minimalist living room, natural lighting, professional interior photography, high quality',
        negative_prompt: 'blurry, low quality, distorted, ugly, bad proportions',
        strength: 0.65, // How much to transform (0.0-1.0)
        num_inference_steps: 30,
        guidance_scale: 7.5,
        image_size: 'square_hd', // 1024x1024
        sync_mode: false, // Use queue for large images
      }
    );

    console.log(`Request ID: ${result.request_id}`);

    const finalResult = await waitForCompletion(result.status_url, result.response_url);

    if (finalResult.images && finalResult.images.length > 0) {
      const outputPath = path.join(OUTPUT_DIR, `fal_sdxl_mockup_${Date.now()}.png`);
      await downloadAndSaveImage(finalResult.images[0].url, outputPath);
      console.log(`Saved to: ${outputPath}`);
      return outputPath;
    }

    return null;
  } catch (error) {
    console.error('SDXL test failed:', error);
    return null;
  }
}

/**
 * Test FLUX Image-to-Image
 */
async function testFLUXImg2Img(imageUrl: string): Promise<string | null> {
  console.log('\n=== Testing FLUX Image-to-Image ===');
  console.log('Model: fal-ai/flux/dev/image-to-image');
  console.log('Estimated cost: ~$0.025-0.05');

  try {
    const result = await falRequest<FalQueueResponse>(
      'https://queue.fal.run/fal-ai/flux/dev/image-to-image',
      'POST',
      {
        image_url: imageUrl,
        prompt: 'beautiful framed art poster displayed on a wall in a cozy modern living room with soft natural lighting, interior design photography, professional quality',
        strength: 0.7,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        image_size: {
          width: 1024,
          height: 1024
        },
        sync_mode: false,
      }
    );

    console.log(`Request ID: ${result.request_id}`);

    const finalResult = await waitForCompletion(result.status_url, result.response_url);

    if (finalResult.images && finalResult.images.length > 0) {
      const outputPath = path.join(OUTPUT_DIR, `fal_flux_mockup_${Date.now()}.png`);
      await downloadAndSaveImage(finalResult.images[0].url, outputPath);
      console.log(`Saved to: ${outputPath}`);
      return outputPath;
    }

    return null;
  } catch (error) {
    console.error('FLUX test failed:', error);
    return null;
  }
}

/**
 * Test FLUX Schnell (faster, cheaper)
 */
async function testFLUXSchnell(imageUrl: string): Promise<string | null> {
  console.log('\n=== Testing FLUX Schnell ===');
  console.log('Model: fal-ai/flux/schnell');
  console.log('Estimated cost: ~$0.003');
  console.log('Note: schnell is text-to-image, using it for comparison');

  try {
    // FLUX schnell is primarily text-to-image, but we can describe the poster
    const result = await falRequest<FalQueueResponse>(
      'https://queue.fal.run/fal-ai/flux/schnell',
      'POST',
      {
        prompt: 'a beautiful celestial moon phases poster in an elegant black frame, hanging on a white wall in a modern minimalist Scandinavian living room, natural soft lighting from window, professional interior photography, high quality',
        image_size: {
          width: 1024,
          height: 1024
        },
        num_inference_steps: 4,
        sync_mode: false,
      }
    );

    console.log(`Request ID: ${result.request_id}`);

    const finalResult = await waitForCompletion(result.status_url, result.response_url);

    if (finalResult.images && finalResult.images.length > 0) {
      const outputPath = path.join(OUTPUT_DIR, `fal_flux_schnell_${Date.now()}.png`);
      await downloadAndSaveImage(finalResult.images[0].url, outputPath);
      console.log(`Saved to: ${outputPath}`);
      return outputPath;
    }

    return null;
  } catch (error) {
    console.error('FLUX Schnell test failed:', error);
    return null;
  }
}

/**
 * Test ControlNet for structure-preserving transformation
 */
async function testControlNet(imageBase64: string): Promise<string | null> {
  console.log('\n=== Testing SDXL ControlNet (Canny) ===');
  console.log('Model: fal-ai/fast-sdxl-controlnet-canny');
  console.log('Estimated cost: ~$0.02');
  console.log('Best for: Keeping poster structure while adding room context');

  try {
    const result = await falRequest<FalQueueResponse>(
      'https://queue.fal.run/fal-ai/fast-sdxl-controlnet-canny',
      'POST',
      {
        image_url: imageBase64,
        prompt: 'elegant framed artwork on wall, modern interior, living room, soft natural lighting, professional photography',
        negative_prompt: 'blurry, distorted, low quality',
        controlnet_conditioning_scale: 0.5, // Lower = more creative freedom
        num_inference_steps: 30,
        guidance_scale: 7.5,
        sync_mode: false,
      }
    );

    console.log(`Request ID: ${result.request_id}`);

    const finalResult = await waitForCompletion(result.status_url, result.response_url);

    if (finalResult.images && finalResult.images.length > 0) {
      const outputPath = path.join(OUTPUT_DIR, `fal_controlnet_mockup_${Date.now()}.png`);
      await downloadAndSaveImage(finalResult.images[0].url, outputPath);
      console.log(`Saved to: ${outputPath}`);
      return outputPath;
    }

    return null;
  } catch (error) {
    console.error('ControlNet test failed:', error);
    return null;
  }
}

/**
 * Test FLUX Fill/Inpainting (best for mockups)
 */
async function testFLUXInpainting(): Promise<string | null> {
  console.log('\n=== Testing FLUX Inpainting ===');
  console.log('Model: fal-ai/flux-pro/v1/fill');
  console.log('Estimated cost: ~$0.05');
  console.log('Note: Requires base image with mask - best for compositing');

  // This would require a room image with a masked area for the poster
  // Skipping actual test, just documenting the approach
  console.log('Skipping - requires prepared room image with mask');
  console.log('');
  console.log('HOW TO USE FOR MOCKUPS:');
  console.log('1. Take a room photo with empty wall/frame area');
  console.log('2. Create mask for where poster should go');
  console.log('3. Use FLUX Fill to blend poster into scene');

  return null;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('========================================');
  console.log('FAL.AI IMG2IMG TEST');
  console.log('========================================');

  // Check API key
  if (!FAL_API_KEY) {
    console.error('\nERROR: FAL_KEY environment variable not set!');
    console.log('\nTo get your API key:');
    console.log('1. Go to https://fal.ai and sign up');
    console.log('2. Navigate to https://fal.ai/dashboard/keys');
    console.log('3. Create a new API key');
    console.log('4. Set it: export FAL_KEY="your-key-here"');
    console.log('\nYou get $10 free credits on signup!');
    process.exit(1);
  }

  console.log('\nAPI Key: ' + FAL_API_KEY.substring(0, 8) + '...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  // Download source image
  console.log('\n--- Downloading source poster ---');
  console.log(`Source: ${SOURCE_IMAGE_URL}`);

  let sourceImageBase64: string;
  try {
    sourceImageBase64 = await downloadImageAsBase64(SOURCE_IMAGE_URL);
    console.log('Downloaded and converted to base64');

    // Also save the source image for reference
    const sourceOutputPath = path.join(OUTPUT_DIR, 'source_poster.png');
    const base64Data = sourceImageBase64.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(sourceOutputPath, Buffer.from(base64Data, 'base64'));
    console.log(`Saved source to: ${sourceOutputPath}`);
  } catch (error) {
    console.error('Failed to download source image:', error);
    process.exit(1);
  }

  // Run tests
  const results: { model: string; path: string | null }[] = [];

  // Test 1: SDXL img2img
  results.push({
    model: 'SDXL img2img',
    path: await testSDXLImg2Img(sourceImageBase64)
  });

  // Test 2: FLUX img2img
  results.push({
    model: 'FLUX dev img2img',
    path: await testFLUXImg2Img(sourceImageBase64)
  });

  // Test 3: FLUX Schnell (text-to-image for comparison)
  results.push({
    model: 'FLUX Schnell (t2i)',
    path: await testFLUXSchnell(sourceImageBase64)
  });

  // Test 4: ControlNet
  results.push({
    model: 'SDXL ControlNet',
    path: await testControlNet(sourceImageBase64)
  });

  // Test 5: Document FLUX Fill approach
  await testFLUXInpainting();

  // Summary
  console.log('\n========================================');
  console.log('RESULTS SUMMARY');
  console.log('========================================');

  results.forEach(r => {
    const status = r.path ? 'SUCCESS' : 'FAILED';
    console.log(`${r.model}: ${status}`);
    if (r.path) console.log(`  -> ${r.path}`);
  });

  console.log('\n========================================');
  console.log('RECOMMENDATIONS FOR POSTER MOCKUPS');
  console.log('========================================');
  console.log(`
1. BEST APPROACH: Compositing + Light Adjustment
   - Use static room mockup templates
   - Composite poster into frame area
   - Optional: Use AI for lighting/shadow adjustment

2. AI-ONLY APPROACH: FLUX Fill/Inpainting
   - Requires room image with masked frame area
   - Best quality but needs preparation
   - Cost: ~$0.05 per image

3. QUICK & DIRTY: SDXL img2img
   - Simple but doesn't preserve poster details well
   - Cost: ~$0.01-0.02 per image
   - Good for concept/mood testing

4. ALTERNATIVE: Use dedicated mockup APIs
   - Placeit.net, Smartmockups, etc.
   - More reliable for production
   - Fixed pricing per mockup
  `);

  console.log('\n========================================');
  console.log('COST SUMMARY (fal.ai)');
  console.log('========================================');
  console.log(`
Model                        | Cost/Image | Speed    | Quality
-----------------------------|------------|----------|--------
FLUX Schnell                 | ~$0.003    | Fast     | Good
SDXL img2img                 | ~$0.01-02  | Medium   | Good
SDXL ControlNet              | ~$0.02     | Medium   | Good
FLUX dev img2img             | ~$0.025-05 | Slow     | Best
FLUX Pro Fill (Inpainting)   | ~$0.05     | Slow     | Best

With $10 free credits, you can run:
- ~3000+ FLUX Schnell generations
- ~500-1000 SDXL generations
- ~200-400 FLUX dev generations
  `);
}

main().catch(console.error);
