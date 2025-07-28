import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-listing-flow';
import '@/ai/flows/analyze-image-damage-flow';
import '@/ai/flows/product-search-and-analysis-flow';
import '@/ai/tools/ebay-search-tool';
import '@/ai/tools/amazon-search-tool';
import '@/ai/tools/aliexpress-search-tool';
