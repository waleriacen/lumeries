import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { image, style, prompt } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    let output;

    console.log(`Starting ${style} transformation...`);

    if (style === 'pixar') {
      // SDXL Pixar model - img2img mode
      output = await replicate.run(
        "swartype/sdxl-pixar:81f8bbd3463056c8521eb528feb10509cc1385e2fabef590747f159848589048",
        {
          input: {
            image: image, // Input image for transformation
            prompt: prompt || "portrait in pixar 3d animation style, pixar character, 3d animated movie character",
            negative_prompt: "noisy, sloppy, messy, grainy, highly detailed, ultra textured, photo, NSFW, blurry, low quality, realistic photo",
            num_inference_steps: 50,
            guidance_scale: 7.5,
            prompt_strength: 0.65, // Lower = more faithful to original image
            width: 1024,
            height: 1024,
          }
        }
      );
    } else if (style === 'simpsons') {
      // SDXL Simpsons model - img2img mode
      output = await replicate.run(
        "fofr/sdxl-simpsons-characters:c8e539cf095b8a1127dc389fb7f68f92e33184fcab8af0cc0fe36d4c0a8d63de",
        {
          input: {
            image: image, // Input image for transformation
            prompt: prompt || "simpsons character portrait, yellow skin, 2d cartoon, the simpsons tv show art style",
            negative_prompt: "realistic, photo, 3d, noisy, blurry, low quality, NSFW, photorealistic",
            num_inference_steps: 50,
            guidance_scale: 7.5,
            prompt_strength: 0.65, // Lower = more faithful to original image
            width: 1024,
            height: 1024,
          }
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid style. Use "pixar" or "simpsons"' },
        { status: 400 }
      );
    }

    console.log('Replicate output:', output);

    // Output is an array of File objects with .url() method
    let resultUrl;
    if (Array.isArray(output) && output.length > 0) {
      // Check if it's a File object with url() method
      const firstItem = output[0];
      if (typeof firstItem === 'object' && 'url' in firstItem) {
        // It's a FileOutput object, call url() method
        resultUrl = typeof firstItem.url === 'function' ? firstItem.url() : firstItem.url;
      } else if (typeof firstItem === 'string') {
        // It's already a string URL
        resultUrl = firstItem;
      } else {
        throw new Error('Unexpected output item format');
      }
    } else if (typeof output === 'string') {
      resultUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    console.log('Result URL:', resultUrl);

    return NextResponse.json({
      success: true,
      imageUrl: resultUrl,
      style: style,
    });

  } catch (error: any) {
    console.error('Replicate API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Transformation failed' },
      { status: 500 }
    );
  }
}
