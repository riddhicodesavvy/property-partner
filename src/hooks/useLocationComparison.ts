import { useState, useCallback } from "react";
import { toast } from "sonner";
import { BudgetLevel } from "@/components/location/BudgetSelector";
import { LocationData } from "@/components/location/LocationCard";

interface UseLocationComparisonResult {
  locations: string[];
  budgetLevel: BudgetLevel;
  locationData: LocationData[];
  isLoading: boolean;
  addLocation: (location: string) => void;
  removeLocation: (index: number) => void;
  setBudgetLevel: (level: BudgetLevel) => void;
  compareLocations: () => Promise<void>;
  clearResults: () => void;
}

export function useLocationComparison(): UseLocationComparisonResult {
  const [locations, setLocations] = useState<string[]>([]);
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>("average");
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLocation = useCallback((location: string) => {
    setLocations((prev) => [...prev, location]);
  }, []);

  const removeLocation = useCallback((index: number) => {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearResults = useCallback(() => {
    setLocationData([]);
  }, []);

  const compareLocations = useCallback(async () => {
    if (locations.length < 2) {
      toast.error("Please add at least 2 locations to compare");
      return;
    }

    setIsLoading(true);
    setLocationData([]);

    try {
      const prompt = `Compare these Indian locations for renting/living: ${locations.join(", ")}.
      
For EACH location, provide analysis in this exact JSON format (respond with ONLY the JSON array, no other text):
[
  {
    "name": "Location Name",
    "rentRange": { "min": 15000, "max": 25000 },
    "commuteScore": "Easy|Moderate|Challenging",
    "lifestyleScore": "Basic|Moderate|Vibrant",
    "highlights": ["2-3 positive points"],
    "tradeoffs": ["2-3 considerations or downsides"]
  }
]

Consider:
- Monthly rent for a 1-2 BHK apartment (in INR for average budget)
- Commute accessibility (metro, buses, traffic)
- Lifestyle amenities (restaurants, malls, parks, hospitals)
- Safety and neighborhood quality
- Cost of daily living

Be realistic and use actual Indian rental market knowledge. Rent values should reflect current 2024-2025 market rates.`;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/location-compare`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, locations, budgetLevel }),
        }
      );

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment and try again.");
        return;
      }

      if (resp.status === 402) {
        toast.error("AI usage limit reached. Please add credits to continue.");
        return;
      }

      if (!resp.ok) {
        throw new Error("Failed to get comparison");
      }

      const data = await resp.json();
      
      if (data.locations && Array.isArray(data.locations)) {
        setLocationData(data.locations);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Location comparison error:", error);
      toast.error("Sorry, something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [locations, budgetLevel]);

  return {
    locations,
    budgetLevel,
    locationData,
    isLoading,
    addLocation,
    removeLocation,
    setBudgetLevel,
    compareLocations,
    clearResults,
  };
}
