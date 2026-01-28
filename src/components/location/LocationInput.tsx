import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LocationInputProps {
  locations: string[];
  onAdd: (location: string) => void;
  onRemove: (index: number) => void;
  maxLocations?: number;
}

export function LocationInput({
  locations,
  onAdd,
  onRemove,
  maxLocations = 4,
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !locations.includes(trimmed) && locations.length < maxLocations) {
      onAdd(trimmed);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Locations to Compare
      </label>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter area name (e.g., Koramangala, Bangalore)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!inputValue.trim() || locations.length >= maxLocations}
          size="icon"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {locations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {locations.map((location, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="pl-3 pr-1 py-1.5 flex items-center gap-1"
            >
              {location}
              <button
                onClick={() => onRemove(index)}
                className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Add up to {maxLocations} locations to compare ({locations.length}/{maxLocations})
      </p>
    </div>
  );
}
