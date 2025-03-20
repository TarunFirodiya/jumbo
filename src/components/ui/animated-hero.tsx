
import React from 'react';
import { Action } from './action-search-bar';
import { Card, CardContent } from './card';
import { Input } from './input';
import { Button } from './button';
import { Search } from 'lucide-react';

interface AnimatedHeroProps {
  subtitle?: string;
  localityActions?: Action[];
  onSearch?: (query: string) => void;
  onLocalitySelect?: (action: Action) => void;
}

export const AnimatedHero: React.FC<AnimatedHeroProps> = ({
  subtitle,
  localityActions = [],
  onSearch,
  onLocalitySelect,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Find Your Dream Home
          </h1>
          
          {subtitle && (
            <p className="text-lg text-gray-600 mb-8">
              {subtitle}
            </p>
          )}
          
          <Card className="bg-white/90 backdrop-blur shadow-xl">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search for a locality, building, or feature..."
                    className="w-full pl-10 pr-4 py-3"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <Button type="submit" className="bg-primary">
                  Search
                </Button>
              </form>
              
              {localityActions.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {localityActions.slice(0, 6).map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="flex items-center gap-2 text-sm"
                      onClick={() => onLocalitySelect?.(action)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
