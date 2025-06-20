import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const pricingTiers = [
  {
    name: "Free Tier",
    price: "$0",
    period: "/month",
    description: "Get started with basic analysis features.",
    features: [
      "Up to 5 analyses per month",
      "Basic listing quality score",
      "Community support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro Tier",
    price: "$19",
    period: "/month",
    description: "For frequent users needing more power.",
    features: [
      "Up to 100 analyses per month",
      "Detailed quality & price insights",
      "Seller reliability check",
      "Priority email support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Business Tier",
    price: "$49",
    period: "/month",
    description: "For businesses and power sellers.",
    features: [
      "Unlimited analyses",
      "Advanced AI insights",
      "API Access (coming soon)",
      "Dedicated support",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Find the Perfect Plan
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that best fits your needs for analyzing online marketplace listings.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {pricingTiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col shadow-lg ${tier.popular ? 'border-primary border-2 relative' : 'border-border'}`}>
            {tier.popular && (
              <div className="absolute top-0 right-0 -mt-3 mr-3">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                  Popular
                </span>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">{tier.name}</CardTitle>
              <CardDescription className="h-12">{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                {tier.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
       <div className="mt-16 text-center text-muted-foreground">
        <p>All plans come with a 7-day money-back guarantee. Cancel anytime.</p>
      </div>
    </div>
  );
}
