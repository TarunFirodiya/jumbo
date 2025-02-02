import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BuildingData {
  id: string;
  latitude: number | null;
  longitude: number | null;
  min_price: number | null;
  max_price: number | null;
  amenities_cohort: number | null;
  features: any;
  bhk_types: string[];
  locality: string | null;
}

interface UserPreferences {
  location_latitude: number | null;
  location_longitude: number | null;
  location_radius: number | null;
  max_budget: number | null;
  lifestyle_cohort: string | null;
  preferred_localities: string[] | null;
  bhk_preferences: string[] | null;
  amenities: string[] | null;
}

interface PreferenceWeights {
  location_weight: number;
  budget_weight: number;
  lifestyle_weight: number;
  amenities_weight: number;
  bhk_weight: number;
  locality_weight: number;
}

const LIFESTYLE_COHORT_MAP: { [key: string]: number } = {
  'luxury': 1,
  'gated_basic': 2,
  'gated_no_amenities': 3,
  'villa': 4
};

function calculateLocalityScore(building: BuildingData, preferences: UserPreferences): number {
  if (!preferences.preferred_localities || !building.locality) return 0;
  return preferences.preferred_localities.includes(building.locality) ? 1 : 0;
}

function calculateBHKScore(building: BuildingData, preferences: UserPreferences): number {
  if (!preferences.bhk_preferences || !building.bhk_types) return 0;
  const matchingBHK = building.bhk_types.some(bhk => 
    preferences.bhk_preferences?.includes(bhk)
  );
  return matchingBHK ? 1 : 0;
}

function calculateAmenitiesScore(building: BuildingData, preferences: UserPreferences): number {
  if (!preferences.amenities || !building.features) return 0;
  
  const buildingAmenities = Object.keys(building.features);
  const matchingAmenities = preferences.amenities.filter(amenity => 
    buildingAmenities.includes(amenity)
  );
  
  return matchingAmenities.length / preferences.amenities.length;
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id, building_ids } = await req.json()
    console.log('Received request for user_id:', user_id)
    console.log('Number of building IDs:', building_ids?.length)

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { data: preferences, error: preferencesError } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (preferencesError) {
      console.error('Error fetching preferences:', preferencesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user preferences', details: preferencesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const { data: weights } = await supabaseClient
      .from('user_preference_weights')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle()

    const preferenceWeights: PreferenceWeights = {
      location_weight: weights?.location_weight ?? 0.2,
      budget_weight: weights?.budget_weight ?? 0.2,
      lifestyle_weight: weights?.lifestyle_weight ?? 0.2,
      amenities_weight: 0.15,
      bhk_weight: 0.15,
      locality_weight: 0.1,
    }

    const CHUNK_SIZE = 50;
    const buildingChunks = chunkArray(building_ids || [], CHUNK_SIZE);
    let allBuildings: BuildingData[] = [];

    for (const chunk of buildingChunks) {
      const { data: buildings, error: buildingsError } = await supabaseClient
        .from('buildings')
        .select('id, latitude, longitude, min_price, max_price, amenities_cohort, features, bhk_types, locality')
        .in('id', chunk);

      if (buildingsError) {
        console.error('Error fetching buildings chunk:', buildingsError);
        continue;
      }

      allBuildings = allBuildings.concat(buildings);
    }

    console.log(`Calculating scores for ${allBuildings.length} buildings`);

    const userLifestyleCohort = preferences?.lifestyle_cohort ? 
      LIFESTYLE_COHORT_MAP[preferences.lifestyle_cohort.toLowerCase()] : null;

    const buildingScores = allBuildings.map((building: BuildingData) => {
      let locationScore = 0;
      if (building.latitude && building.longitude && 
          preferences?.location_latitude && preferences?.location_longitude) {
        const distance = calculateDistance(
          preferences.location_latitude,
          preferences.location_longitude,
          building.latitude,
          building.longitude
        );
        const maxRadius = preferences.location_radius || 5;
        locationScore = Math.max(0, 1 - (distance / maxRadius));
      }

      let budgetScore = 0;
      if (building.max_price && preferences?.max_budget) {
        if (building.max_price <= preferences.max_budget) {
          budgetScore = 1;
        } else {
          budgetScore = Math.max(0, 1 - ((building.max_price - preferences.max_budget) / preferences.max_budget));
        }
      }

      let lifestyleScore = 0;
      if (building.amenities_cohort !== null && userLifestyleCohort !== null) {
        const cohortDiff = Math.abs(building.amenities_cohort - userLifestyleCohort);
        if (cohortDiff === 0) lifestyleScore = 1;
        else if (cohortDiff === 1) lifestyleScore = 0.7;
        else if (cohortDiff === 2) lifestyleScore = 0.4;
        else lifestyleScore = 0.2;
      }

      const amenitiesScore = calculateAmenitiesScore(building, preferences);
      const bhkScore = calculateBHKScore(building, preferences);
      const localityScore = calculateLocalityScore(building, preferences);

      const overallScore = (
        locationScore * preferenceWeights.location_weight +
        budgetScore * preferenceWeights.budget_weight +
        lifestyleScore * preferenceWeights.lifestyle_weight +
        amenitiesScore * preferenceWeights.amenities_weight +
        bhkScore * preferenceWeights.bhk_weight +
        localityScore * preferenceWeights.locality_weight
      );

      return {
        building_id: building.id,
        user_id,
        location_match_score: locationScore,
        budget_match_score: budgetScore,
        lifestyle_match_score: lifestyleScore,
        amenities_match_score: amenitiesScore,
        bhk_match_score: bhkScore,
        locality_match_score: localityScore,
        overall_match_score: overallScore,
        last_calculation_time: new Date().toISOString()
      };
    });

    const { error: upsertError } = await supabaseClient
      .from('user_building_scores')
      .upsert(buildingScores, {
        onConflict: 'building_id,user_id'
      });

    if (upsertError) {
      console.error('Error upserting scores:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to update building scores', details: upsertError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, scores: buildingScores }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error calculating building scores:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

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