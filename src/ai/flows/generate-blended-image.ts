'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating blended images using a model and a product image based on a user-provided prompt.
 *
 * - generateBlendedImage - An asynchronous function that takes input parameters and returns the generated image as a data URI.
 * - GenerateBlendedImageInput - The input type for the generateBlendedImage function.
 * - GenerateBlendedImageOutput - The return type for the generateBlendedImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBlendedImageInputSchema = z.object({
  modelImage: z
    .string()
    .describe(
      "The image of the model, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productImage: z
    .string()
    .describe(
      "The image of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  action: z.string().describe('The action/pose of the model with the product.'),
  style: z.string().describe('The style of the photograph (e.g., full-body shot, close-up).'),
  background: z.string().describe('The scene/background/mood of the image.'),
  productName: z.string().describe('The name/description of the product.'),
});

export type GenerateBlendedImageInput = z.infer<typeof GenerateBlendedImageInputSchema>;

const GenerateBlendedImageOutputSchema = z.object({
  generatedImage: z
    .string()
    .describe('The AI-generated image as a data URI.'),
});

export type GenerateBlendedImageOutput = z.infer<typeof GenerateBlendedImageOutputSchema>;

export async function generateBlendedImage(
  input: GenerateBlendedImageInput
): Promise<GenerateBlendedImageOutput> {
  return generateBlendedImageFlow(input);
}

const generateBlendedImagePromptText = `A {{style}} photograph of a fashionable model {{action}} the {{productName}}. The scene is a {{background}}. Professional studio lighting, high quality, photorealistic, commercial advertisement look. Use the first image as the model's appearance and the second image as the product.`;

const generateBlendedImageFlow = ai.defineFlow(
  {
    name: 'generateBlendedImageFlow',
    inputSchema: GenerateBlendedImageInputSchema,
    outputSchema: GenerateBlendedImageOutputSchema,
  },
  async input => {
    const {modelImage, productImage} = input;
    const {media, content} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {text: generateBlendedImagePromptText},
        {media: {url: modelImage}},
        {media: {url: productImage}},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed. Please try again.');
    }

    return {generatedImage: media.url};
  }
);
