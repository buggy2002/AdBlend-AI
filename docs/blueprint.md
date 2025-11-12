# **App Name**: AdBlend AI

## Core Features:

- Image Upload to Storage: Allows users to upload model and product images to Firebase Storage.
- Prompt Builder: UI to construct a prompt by selecting actions, styles, backgrounds, and product descriptions.
- AI Image Generation: Sends the constructed prompt and image references to Gemini/Imagen via a Firebase Cloud Function to generate a blended image, with clear instructions acting as a tool for composing the model from Image 1 and product from Image 2 into the new image.
- Image Storage: Saves the AI-generated image back into Firebase Storage.
- Image Display: Presents the generated image to the user.

## Style Guidelines:

- Primary color: Soft Blue (#A0D2EB) to convey trust and sophistication.
- Background color: Light Gray (#F5F5F5) for a clean, modern backdrop.
- Accent color: Coral Pink (#FF7F50) for highlights and calls to action.
- Body and headline font: 'Inter', a grotesque-style sans-serif font known for its clean, readable design, will be used across the application for a modern and accessible feel.
- Simple, minimalist icons to represent different actions and categories.
- Clean, modern layout with clear sections for image input, prompt construction, and image display.
- Subtle loading animations during image generation to keep the user informed.