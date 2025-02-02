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

function calculateLocationScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.location_latitude || !preferences.location_longitude || !building.latitude || !building.longitude) {
    console.log('Missing location data for building:', building.id);
    return 0;
  }

  const distance = calculateDistance(
    preferences.location_latitude,
    preferences.location_longitude,
    building.latitude,
    building.longitude
  );

  const maxDistance = 20; // 20km radius
  const score = Math.max(0, 1 - (distance / maxDistance));
  return score;
}

function calculateBudgetScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.max_budget || !building.min_price) {
    console.log('Missing budget data for building:', building.id);
    return 0;
  }

  if (building.min_price <= preferences.max_budget) {
    return 1;
  }

  const overBudgetRatio = (building.min_price - preferences.max_budget) / preferences.max_budget;
  const score = Math.max(0, 1 - (overBudgetRatio * 2));
  return score;
}

function calculateAmenitiesScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.amenities?.length || !building.features?.length) {
    console.log('Missing amenities data for building:', building.id);
    return 0;
  }

  // Convert building features to lowercase for case-insensitive comparison
  const buildingFeatures = building.features.map(f => f.toLowerCase());
  const userAmenities = preferences.amenities.map(a => a.toLowerCase());

  const matchingAmenities = userAmenities.filter(amenity => 
    buildingFeatures.includes(amenity)
  );

  return matchingAmenities.length / userAmenities.length;
}

function calculateBHKScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.bhk_preferences?.length || !building.bhk_types) {
    console.log('Missing BHK data for building:', building.id);
    return 0;
  }

  // Handle comma-separated BHK types
  const buildingBHKTypes = building.bhk_types.flatMap(type => 
    type.split(',').map(t => t.trim())
  );

  const matchingTypes = preferences.bhk_preferences.filter(type => 
    buildingBHKTypes.includes(type)
  );

  return matchingTypes.length > 0 ? 1 : 0;
}

function calculateLocalityScore(building: Building, preferences: UserPreferences): number {
  if (!preferences.preferred_localities?.length || !building.locality) {
    console.log('Missing locality data for building:', building.id);
    return 0;
  }

  // Case-insensitive locality comparison
  const buildingLocality = building.locality.toLowerCase();
  const preferredLocalities = preferences.preferred_localities.map(l => 
    typeof l === 'string' ? l.toLowerCase() : ''
  );

  return preferredLocalities.includes(buildingLocality) ? 1 : 0;
}

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
      const localityScore = calculateLocalityScore(building, preferences);

      console.log(`Scores for building ${building.id}:`, {
        locationScore,
        budgetScore,
        amenitiesScore,
        bhkScore,
        localityScore
      });

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