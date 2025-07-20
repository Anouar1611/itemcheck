"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextAnalyzer } from './text-analyzer';
import { ImageAnalyzer } from './image-analyzer';
import { FileText, Image as ImageIcon } from 'lucide-react';

export function ClarityPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-transparent">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Clarity AI Analyzer
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Uncover hidden biases and contradictions in text and images.
          </p>
        </header>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="text" className="text-base">
              <FileText className="mr-2 h-5 w-5" />
              Text Analyzer
            </TabsTrigger>
            <TabsTrigger value="image" className="text-base">
              <ImageIcon className="mr-2 h-5 w-5" />
              Image & Text Analyzer
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <TextAnalyzer />
          </TabsContent>
          <TabsContent value="image">
            <ImageAnalyzer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
