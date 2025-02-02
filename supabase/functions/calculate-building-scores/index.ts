import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserPreferences {
  location_latitude: number | null;
  location_longitude: number | null;
  max_budget: number;
  amenities: string[];
  bhk_preferences: string[];
  preferred_localities: string[];
  lifestyle_cohort: string;
}

interface Building {
  id: string;
  latitude: number | null;
  longitude: number | null;
  min_price: number;
  features: string[];
  bhk_types: string[] | null;
  locality: string;
}

interface LocalityCoordinates {
  name: string;
  latitude: number;
  longitude: number;
}

const LOCALITIES: LocalityCoordinates[] = [
  { name: "whitefield", latitude: 12.9698196, longitude: 77.7499721 },
  { name: "hsr layout", latitude: 12.9121181, longitude: 77.6445548 },
  { name: "koramangala", latitude: 12.9352403, longitude: 77.624532 },
  { name: "jp nagar", latitude: 12.9063433, longitude: 77.5856825 },
  { name: "marathahalli", latitude: 12.956924, longitude: 77.701127 },
  { name: "indiranagar", latitude: 12.9783692, longitude: 77.6408356 }
];

function calculateLocationScore(building: Building, preferences: UserPreferences): number {
  if (preferences.preferred_localities && preferences.preferred_localities.length > 0) {
    const buildingLocality = building.locality?.toLowerCase();
    if (!buildingLocality) return 0;

    const matchingLocality = LOCALITIES.find(l => 
      l.name === buildingLocality || buildingLocality.includes(l.name)
    );

    if (matchingLocality) {
      return 1; // Perfect match
    }

    let minDistance = Number.MAX_VALUE;
    if (building.latitude && building.longitude) {
      preferences.preferred_localities.forEach(locality => {
        const matchingCoords = LOCALITIES.find(l => l.name === locality);
        if (matchingCoords) {
          const distance = calculateDistance(
            matchingCoords.latitude,
            matchingCoords.longitude,
            building.latitude,
            building.longitude
          );
          minDistance = Math.min(minDistance, distance);
        }
      });

      const maxDistance = 20;
      return Math.max(0, 1 - (minDistance / maxDistance));
    }
  }

  if (preferences.location_latitude && preferences.location_longitude && 
      building.latitude && building.longitude) {
    const distance = calculateDistance(
      preferences.location_latitude,
      preferences.location_longitude,
      building.latitude,
      building.longitude
    );
    const maxDistance = 20; // 20km radius
    return Math.max(0, 1 - (distance / maxDistance));
  }

  return 0;
}

function calculateBHKScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.bhk_preferences?.length || !building.bhk_types) {
    console.log('Missing BHK data for building:', building.id);
    return 0;
  }

  const normalizedPreferences = preferences.bhk_preferences.map(pref => {
    const match = pref.match(/\d+/);
    return match ? match[0] : '';
  });

  const buildingBHKTypes = building.bhk_types.flatMap(type => {
    const parts = type.split(',').map(t => t.trim());
    return parts.map(part => {
      const match = part.match(/\d+/);
      return match ? match[0] : '';
    });
  });

  console.log('Normalized preferences:', normalizedPreferences);
  console.log('Building BHK types:', buildingBHKTypes);

  const matchingTypes = normalizedPreferences.filter(type => 
    buildingBHKTypes.includes(type)
  );

  return matchingTypes.length > 0 ? 1 : 0;
}

function calculateOverallScore(
  locationScore: number,
  budgetScore: number,
  amenitiesScore: number,
  bhkScore: number
): number {
  return (
    locationScore * 0.4 +
    budgetScore * 0.3 +
    amenitiesScore * 0.2 +
    bhkScore * 0.1
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing environment variables.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('Missing user_id in request body');
    }

    console.log('Fetching preferences for user:', user_id);

    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (preferencesError) {
      console.error('Error fetching preferences:', preferencesError);
      throw new Error('Failed to fetch user preferences');
    }

    if (!preferences) {
      console.log('No preferences found for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'No preferences found for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log('User preferences:', preferences);

    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*');

    if (buildingsError) {
      console.error('Error fetching buildings:', buildingsError);
      throw new Error('Failed to fetch buildings');
    }

    if (!buildings?.length) {
      console.log('No buildings found');
      return new Response(
        JSON.stringify({ message: 'No buildings found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    console.log(`Calculating scores for ${buildings.length} buildings`);

    const buildingScores = buildings.map(building => {
      const locationScore = calculateLocationScore(building, preferences);
      const budgetScore = calculateBudgetScore(building, preferences);
      const amenitiesScore = calculateAmenitiesScore(building, preferences);
      const bhkScore = calculateBHKScore(building, preferences);

      console.log(`Scores for building ${building.id}:`, {
        locationScore,
        budgetScore,
        amenitiesScore,
        bhkScore
      });

      const overallScore = calculateOverallScore(
        locationScore,
        budgetScore,
        amenitiesScore,
        bhkScore
      );

      return {
        user_id,
        building_id: building.id,
        location_match_score: locationScore,
        budget_match_score: budgetScore,
        lifestyle_match_score: amenitiesScore,
        overall_match_score: overallScore,
        amenities_match_score: amenitiesScore,
        bhk_match_score: bhkScore,
        calculated_at: new Date().toISOString(),
        top_callout_1: `${Math.round(locationScore * 100)}% location match`,
        top_callout_2: `${Math.round(budgetScore * 100)}% budget match`,
      };
    });

    const batchSize = 50;
    const batches = chunkArray(buildingScores, batchSize);

    console.log(`Updating scores in ${batches.length} batches`);

    for (const batch of batches) {
      const { error: upsertError } = await supabase
        .from('user_building_scores')
        .upsert(batch, {
          onConflict: 'user_id,building_id',
        });

      if (upsertError) {
        console.error('Error upserting scores:', upsertError);
        throw new Error('Failed to update building scores');
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Building scores updated successfully',
        scores: buildingScores 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
