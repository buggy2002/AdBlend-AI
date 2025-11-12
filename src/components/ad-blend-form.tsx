"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Loader2, UploadCloud, X } from "lucide-react";
import { handleGenerateImage } from "@/app/actions";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  modelImage: z
    .custom<File>((v) => v instanceof File, "Model image is required.")
    .refine((file) => file.size > 0, "Model image is required.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  productImage: z
    .custom<File>((v) => v instanceof File, "Product image is required.")
    .refine((file) => file.size > 0, "Product image is required.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
  productName: z.string().min(3, "Product name must be at least 3 characters."),
  action: z.string().min(1, "Please select an action."),
  style: z.string().min(1, "Please select a style."),
  background: z.string().min(1, "Please select a background."),
});

type FormValues = z.infer<typeof formSchema>;

const actions = [
  { value: "standing gracefully", label: "Standing" },
  { value: "lying down comfortably", label: "Lying Down" },
  { value: "holding delicately", label: "Holding" },
  { value: "sitting elegantly on top of", label: "Sitting On" },
  { value: "leaning against", label: "Leaning" },
  { value: "walking past", label: "Walking Past" },
  { value: "pointing towards", label: "Pointing To" },
];

const styles = [
  { value: "full-body shot", label: "Full-Body Shot" },
  { value: "medium shot", label: "Medium Shot" },
  { value: "close-up", label: "Close-Up" },
  { value: "cinematic", label: "Cinematic" },
  { value: "dramatic", label: "Dramatic" },
];

const backgrounds = [
  { value: "minimalist studio", label: "Minimalist Studio" },
  { value: "luxury hotel lobby", label: "Luxury Hotel Lobby" },
  { value: "urban street at night", label: "Urban Street at Night" },
  { value: "serene beach at sunset", label: "Beach at Sunset" },
  { value: "futuristic cityscape", label: "Futuristic City" },
  { value: "lush green forest", label: "Lush Forest" },
];

const modelPlaceholder = PlaceHolderImages.find(p => p.id === 'model-placeholder');
const productPlaceholder = PlaceHolderImages.find(p => p.id === 'product-placeholder');

const ImageUpload = ({ field, label }: { field: any; label: string }) => {
  const [preview, setPreview] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      field.onChange(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    field.onChange(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <FormItem className="w-full">
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div
          className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent/20 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <input
            type="file"
            ref={inputRef}
            className="hidden"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={handleFileChange}
          />
          {preview ? (
            <>
              <Image src={preview} alt="Preview" fill style={{ objectFit: "contain" }} className="rounded-lg p-2" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 z-10"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};


export default function AdBlendForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      action: "",
      style: "",
      background: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedImage(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await handleGenerateImage(formData);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: result.error,
      });
    } else if (result.generatedImage) {
      setGeneratedImage(result.generatedImage);
      toast({
        title: "Success!",
        description: "Your new ad image has been generated.",
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Create your Ad</CardTitle>
            <CardDescription>
              Blend a model and product into a single, stunning advertisement.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="modelImage"
                    render={({ field }) => <ImageUpload field={field} label="Model Image" />}
                  />
                  <FormField
                    control={form.control}
                    name="productImage"
                    render={({ field }) => <ImageUpload field={field} label="Product Image" />}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name / Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Luxury leather handbag" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Action</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an action" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {actions.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {styles.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="background"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a background" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {backgrounds.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Image"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated ad will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-square w-full relative">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : generatedImage ? (
                <Image
                  src={generatedImage}
                  alt="Generated advertisement"
                  fill
                  className="object-contain rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-muted rounded-lg">
                   {productPlaceholder && (
                    <Image
                      src={productPlaceholder.imageUrl}
                      alt="Placeholder for generated image"
                      width={500}
                      height={500}
                      className="object-contain rounded-lg opacity-20"
                      data-ai-hint={productPlaceholder.imageHint}
                    />
                  )}
                  <p className="absolute text-muted-foreground">Your ad will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
