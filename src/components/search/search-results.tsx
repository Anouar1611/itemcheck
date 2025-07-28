'use client';

import type { ProductSearchOutput } from '@/ai/flows/product-search-and-analysis-flow';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  CheckCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  Lightbulb,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface SearchResultsProps {
  results: ProductSearchOutput;
}

export function SearchResults({ results }: SearchResultsProps) {
  const {
    overallVerdict,
    comparisons,
    similarItems,
    alternativeReplacements,
    suggestedPaymentMethods,
  } = results;

  return (
    <div className="space-y-8">
      {/* Overall Verdict */}
      <Card className="shadow-xl bg-card/80 border-primary/20">
        <CardHeader className="text-center">
          {overallVerdict.isRecommended ? (
            <CheckCircle className="mx-auto h-16 w-16 text-primary" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-destructive" />
          )}
          <CardTitle className="text-3xl font-bold mt-2">
            {overallVerdict.isRecommended
              ? 'Recommendation: Buy'
              : 'Recommendation: Hold Off'}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {overallVerdict.reason}
          </CardDescription>
          {overallVerdict.bestPlatform && (
             <div className="mt-4">
                <Badge className="text-base px-4 py-2">
                    Best Platform: {overallVerdict.bestPlatform}
                </Badge>
             </div>
          )}
        </CardHeader>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Price & Delivery Comparison</CardTitle>
          <CardDescription>
            Here's a breakdown of the best offers we found across popular platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Best Price</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisons.map((item) => (
                <TableRow key={item.platform}>
                  <TableCell className="font-semibold">{item.platform}</TableCell>
                  <TableCell className="font-medium text-primary">{item.bestPrice}</TableCell>
                  <TableCell>{item.deliveryConditions}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={item.bestListingUrl} target="_blank">
                        View Offer <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Similar Items */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> Similar Items</CardTitle>
                <CardDescription>You might also like these products.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {similarItems.map((item, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                ))}
            </CardContent>
        </Card>

        {/* Alternative Replacements */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><RefreshCw className="text-accent" /> Alternative Replacements</CardTitle>
                <CardDescription>Consider these alternatives to solve your problem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {alternativeReplacements.map((item, index) => (
                    <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><CreditCard className="text-primary" /> Easy Payment Methods</CardTitle>
              <CardDescription>For a smooth and secure checkout, we suggest using one of these common payment options.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {suggestedPaymentMethods.map((method, index) => (
                <Badge key={index} variant="secondary" className="text-md px-3 py-1">{method}</Badge>
            ))}
          </CardContent>
      </Card>

    </div>
  );
}
