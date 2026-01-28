import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, MapPin, Search, Loader2 } from "lucide-react";
import { LocationInput } from "@/components/location/LocationInput";
import { BudgetSelector } from "@/components/location/BudgetSelector";
import { LocationCard } from "@/components/location/LocationCard";
import { useLocationComparison } from "@/hooks/useLocationComparison";

export default function LocationCompare() {
  const {
    locations,
    budgetLevel,
    locationData,
    isLoading,
    addLocation,
    removeLocation,
    setBudgetLevel,
    compareLocations,
    clearResults,
  } = useLocationComparison();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">Location Compare</h1>
              <p className="text-xs text-muted-foreground">Compare areas for living</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <CardTitle>Compare Locations</CardTitle>
            </div>
            <CardDescription>
              Add areas you're considering and compare their living costs, commute options, and lifestyle amenities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <LocationInput
              locations={locations}
              onAdd={addLocation}
              onRemove={removeLocation}
              maxLocations={4}
            />

            <BudgetSelector value={budgetLevel} onChange={setBudgetLevel} />

            <div className="flex gap-3">
              <Button
                onClick={compareLocations}
                disabled={locations.length < 2 || isLoading}
                className="flex-1"
                variant="hero"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Compare Locations
                  </>
                )}
              </Button>
              {locationData.length > 0 && (
                <Button variant="outline" onClick={clearResults}>
                  Clear Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {locationData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">
                Comparison Results
              </h2>
              <p className="text-sm text-muted-foreground">
                Showing {budgetLevel.replace("-", " ")} budget estimates
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {locationData.map((location, index) => (
                <LocationCard
                  key={index}
                  location={location}
                  budgetLevel={budgetLevel}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6">
              Note: Rent estimates are indicative and based on general market knowledge. 
              Actual prices may vary. Always verify with local brokers and property listings.
            </p>
          </div>
        )}

        {/* Empty State */}
        {locationData.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-2">
              Add locations to compare
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter at least 2 areas you're considering for renting or buying. 
              We'll analyze commute, costs, and lifestyle trade-offs for each.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
