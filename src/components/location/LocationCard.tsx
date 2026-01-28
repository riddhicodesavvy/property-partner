import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, IndianRupee, Clock, Home, Utensils, Train } from "lucide-react";
import { BudgetLevel } from "./BudgetSelector";

export interface LocationData {
  name: string;
  rentRange: { min: number; max: number };
  commuteScore: "Easy" | "Moderate" | "Challenging";
  lifestyleScore: "Basic" | "Moderate" | "Vibrant";
  highlights: string[];
  tradeoffs: string[];
}

interface LocationCardProps {
  location: LocationData;
  budgetLevel: BudgetLevel;
}

const budgetMultipliers: Record<BudgetLevel, number> = {
  "bare-minimum": 0.7,
  "average": 1,
  "luxury": 1.8,
};

const formatCurrency = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${(amount / 1000).toFixed(0)}K`;
};

const getCommuteColor = (score: string) => {
  switch (score) {
    case "Easy":
      return "text-success";
    case "Moderate":
      return "text-accent";
    case "Challenging":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
};

const getLifestyleColor = (score: string) => {
  switch (score) {
    case "Vibrant":
      return "text-success";
    case "Moderate":
      return "text-accent";
    case "Basic":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
};

export function LocationCard({ location, budgetLevel }: LocationCardProps) {
  const multiplier = budgetMultipliers[budgetLevel];
  const adjustedMin = Math.round(location.rentRange.min * multiplier);
  const adjustedMax = Math.round(location.rentRange.max * multiplier);

  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(location.name + ", India")}`;

  return (
    <Card className="h-full flex flex-col animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-lg">{location.name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Rent Range */}
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <IndianRupee className="w-4 h-4" />
            <span>Monthly Rent Range</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {formatCurrency(adjustedMin)} - {formatCurrency(adjustedMax)}
          </p>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Train className="w-3 h-3" />
              <span>Commute</span>
            </div>
            <p className={`text-sm font-medium ${getCommuteColor(location.commuteScore)}`}>
              {location.commuteScore}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Utensils className="w-3 h-3" />
              <span>Lifestyle</span>
            </div>
            <p className={`text-sm font-medium ${getLifestyleColor(location.lifestyleScore)}`}>
              {location.lifestyleScore}
            </p>
          </div>
        </div>

        {/* Highlights */}
        {location.highlights.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Highlights</p>
            <ul className="space-y-1">
              {location.highlights.map((highlight, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-success mt-1">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trade-offs */}
        {location.tradeoffs.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Trade-offs</p>
            <ul className="space-y-1">
              {location.tradeoffs.map((tradeoff, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-accent mt-1">•</span>
                  {tradeoff}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Google Maps Link */}
        <div className="mt-auto pt-3">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="w-full group">
              <MapPin className="w-4 h-4" />
              View on Google Maps
              <ExternalLink className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
