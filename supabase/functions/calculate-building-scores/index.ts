import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserPreferences {
  location_latitude: number;
  location_longitude: number;
  max_budget: number;
  amenities: string[];
  bhk_preferences: string[];
  preferred_localities: string[];
}

interface Building {
  id: string;
  latitude: number;
  longitude: number;
  min_price: number;
  max_price: number;
  amenities: string[];
  bhk_types: string[];
  locality: string;
}

function calculateLocationScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.location_latitude || !preferences.location_longitude || !building.latitude || !building.longitude) {
    return 0;
  }

  const distance = calculateDistance(
    preferences.location_latitude,
    preferences.location_longitude,
    building.latitude,
    building.longitude
  );

  // Convert distance to a score between 0 and 1 (closer = higher score)
  // Assuming max reasonable distance is 20km
  const maxDistance = 20;
  const score = Math.max(0, 1 - (distance / maxDistance));
  return score;
}

function calculateBudgetScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.max_budget || !building.min_price) {
    return 0;
  }

  // If the minimum price is within budget, give a high score
  if (building.min_price <= preferences.max_budget) {
    return 1;
  }

  // If it's over budget, calculate how much over (max 50% over)
  const overBudgetRatio = (building.min_price - preferences.max_budget) / preferences.max_budget;
  const score = Math.max(0, 1 - (overBudgetRatio * 2));
  return score;
}

function calculateAmenitiesScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.amenities?.length || !building.amenities?.length) {
    return 0;
  }

  const matchingAmenities = preferences.amenities.filter(amenity => 
    building.amenities.includes(amenity)
  );

  return matchingAmenities.length / preferences.amenities.length;
}

function calculateBHKScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.bhk_preferences?.length || !building.bhk_types?.length) {
    return 0;
  }

  const matchingTypes = preferences.bhk_preferences.filter(type => 
    building.bhk_types.includes(type)
  );

  return matchingTypes.length > 0 ? 1 : 0;
}

function calculateLocalityScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.preferred_localities?.length || !building.locality) {
    return 0;
  }

  return preferences.preferred_localities.includes(building.locality) ? 1 : 0;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing environment variables.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('Missing user_id in request body');
    }

    // Fetch user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (preferencesError || !preferences) {
      throw new Error('Failed to fetch user preferences');
    }

    // Fetch all buildings
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*');

    if (buildingsError || !buildings) {
      throw new Error('Failed to fetch buildings');
    }

    // Calculate scores for each building
    const buildingScores = buildings.map(building => {
      const locationScore = calculateLocationScore(building, preferences);
      const budgetScore = calculateBudgetScore(building, preferences);
      const amenitiesScore = calculateAmenitiesScore(building, preferences);
      const bhkScore = calculateBHKScore(building, preferences);
      const localityScore = calculateLocalityScore(building, preferences);

      // Calculate overall score (equal weights for now)
      const overallScore = (
        locationScore * 0.3 +
        budgetScore * 0.3 +
        amenitiesScore * 0.2 +
        bhkScore * 0.1 +
        localityScore * 0.1
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
        locality_match_score: localityScore,
        calculated_at: new Date().toISOString(),
        top_callout_1: `${Math.round(locationScore * 100)}% location match`,
        top_callout_2: `${Math.round(budgetScore * 100)}% budget match`,
      };
    });

    // Update scores in batches
    const batchSize = 50;
    const batches = chunkArray(buildingScores, batchSize);

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
      JSON.stringify({ message: 'Building scores updated successfully' }),
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