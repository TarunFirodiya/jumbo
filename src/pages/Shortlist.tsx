import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { Home, Heart, Settings, HelpCircle } from "lucide-react";

const tabs = [
  { title: "Home", icon: Home },
  { title: "Shortlist", icon: Heart },
  { title: "Settings", icon: Settings },
  { title: "Support", icon: HelpCircle },
];

export default function Shortlist() {
  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 z-10 bg-background py-4">
        <ExpandableTabs tabs={tabs} />
      </div>
      <div className="mt-8">
        <h1 className="text-2xl font-bold">Your Shortlisted Properties</h1>
        {/* Content will be added in the next iteration */}
      </div>
    </div>
  );
}