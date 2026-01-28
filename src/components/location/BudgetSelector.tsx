import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Wallet, TrendingUp, Crown } from "lucide-react";

export type BudgetLevel = "bare-minimum" | "average" | "luxury";

interface BudgetSelectorProps {
  value: BudgetLevel;
  onChange: (value: BudgetLevel) => void;
}

const budgetOptions = [
  {
    value: "bare-minimum" as BudgetLevel,
    label: "Bare Minimum",
    icon: Wallet,
    description: "Essential living",
  },
  {
    value: "average" as BudgetLevel,
    label: "Average",
    icon: TrendingUp,
    description: "Comfortable living",
  },
  {
    value: "luxury" as BudgetLevel,
    label: "Luxury",
    icon: Crown,
    description: "Premium lifestyle",
  },
];

export function BudgetSelector({ value, onChange }: BudgetSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Budget Level</label>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => v && onChange(v as BudgetLevel)}
        className="grid grid-cols-3 gap-2"
      >
        {budgetOptions.map((option) => (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            className="flex flex-col items-center gap-1 py-3 px-2 h-auto border border-border data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
          >
            <option.icon className="w-4 h-4" />
            <span className="text-xs font-medium">{option.label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
