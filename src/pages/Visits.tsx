import { Card, CardContent } from "@/components/ui/card";

const Visits = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Visits</h1>
      <Card>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <p className="text-xl text-muted-foreground">Coming Soon</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Visits;