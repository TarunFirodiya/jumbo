
import { Building2, Clock, BadgeIndianRupee, Droplets, Home, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface PropertyDetailsSectionProps {
  totalFloors?: number;
  age?: string | null;
  pricePsqft?: number;
  water?: string[] | null;
  bhkTypes?: (string | number)[] | null;
  totalUnits?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function PropertyDetailsSection({
  totalFloors,
  age,
  pricePsqft,
  water,
  bhkTypes,
  totalUnits
}: PropertyDetailsSectionProps) {
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={container}
    >
      <h2 className="text-2xl font-semibold">Property Details</h2>
      
      <Card className="p-6">
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" variants={container}>
          {pricePsqft && (
            <motion.div variants={item}>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BadgeIndianRupee className="h-4 w-4" />
                Price per sq ft
              </p>
              <p className="font-medium">₹{pricePsqft.toLocaleString()}</p>
            </motion.div>
          )}
          
          {age !== null && (
            <motion.div variants={item}>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Age
              </p>
              <p className="font-medium">{age}</p>
            </motion.div>
          )}
          
          {totalFloors && (
            <motion.div variants={item}>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Total Floors
              </p>
              <p className="font-medium">{totalFloors}</p>
            </motion.div>
          )}
          
          {totalUnits && (
            <motion.div variants={item}>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Units
              </p>
              <p className="font-medium">{totalUnits}</p>
            </motion.div>
          )}
          
          {bhkTypes && bhkTypes.length > 0 && (
            <motion.div variants={item}>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Home className="h-4 w-4" />
                Configuration
              </p>
              <p className="font-medium">
                {Array.isArray(bhkTypes) ? bhkTypes.join(', ') : bhkTypes} BHK
              </p>
            </motion.div>
          )}
          
          {water?.length ? (
            <motion.div variants={item}>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Water Source
              </p>
              <p className="font-medium">{water.join(", ")}</p>
            </motion.div>
          ) : null}
        </motion.div>
      </Card>
    </motion.div>
  );
}
