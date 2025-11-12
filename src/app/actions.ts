"use server";

import { generateBlendedImage, type GenerateBlendedImageInput } from '@/ai/flows/generate-blended-image';
import { z } from 'zod';

const fileToDataUri = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

const actionInputSchema = z.object({
  modelImage: z.instanceof(File),
  productImage: z.instanceof(File),
  action: z.string(),
  style: z.string(),
  background: z.string(),
  productName: z.string(),
});

export async function handleGenerateImage(formData: FormData): Promise<{ generatedImage?: string; error?: string }> {
    const validatedFields = actionInputSchema.safeParse({
        modelImage: formData.get('modelImage'),
        productImage: formData.get('productImage'),
        action: formData.get('action'),
        style: formData.get('style'),
        background: formData.get('background'),
        productName: formData.get('productName'),
    });

    if (!validatedFields.success) {
        return { error: 'Invalid form data. Please ensure all fields are filled correctly.' };
    }

    try {
        const { modelImage, productImage, action, style, background, productName } = validatedFields.data;

        const [modelImageUri, productImageUri] = await Promise.all([
            fileToDataUri(modelImage),
            fileToDataUri(productImage),
        ]);

        const input: GenerateBlendedImageInput = {
            modelImage: modelImageUri,
            productImage: productImageUri,
            action,
            style,
            background,
            productName,
        };

        const result = await generateBlendedImage(input);

        if (!result.generatedImage) {
            return { error: 'The AI failed to generate an image. Please try a different prompt.' };
        }

        return { generatedImage: result.generatedImage };
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
        return { error: `Failed to generate image: ${errorMessage}` };
    }
}
