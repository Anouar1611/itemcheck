import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-listing.ts';
import '@/ai/flows/check-price-fairness.ts';
import '@/ai/flows/assess-listing-quality.ts';