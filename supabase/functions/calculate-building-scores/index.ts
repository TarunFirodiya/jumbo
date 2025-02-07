import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

function calculateBudgetScore(userBudget: number, minPrice: number, maxPrice: number): number {
  if (!userBudget || !minPrice) return 0;
  
  // Convert user budget from lakhs to rupees (1L = 100,000)
  const userBudgetInRupees = userBudget * 100000;
  const maxPriceToUse = maxPrice || minPrice;
  
  console.log('Budget comparison:', {
    userBudget: userBudgetInRupees,
    minPrice,
    maxPrice: maxPriceToUse
  });

  // Perfect match if building price is within 20% of user's budget
  const lowerBound = userBudgetInRupees * 0.8;
  const upperBound = userBudgetInRupees * 1.2;

  // If building price range overlaps with user's acceptable range
  if (minPrice <= upperBound && maxPriceToUse >= lowerBound) {
    const overlap = Math.min(maxPriceToUse, upperBound) - Math.max(minPrice, lowerBound);
    const totalRange = upperBound - lowerBound;
    return Math.max(0, Math.min(1, overlap / totalRange));
  }

  return 0; // No overlap in price ranges
}

function calculateLifestyleScore(buildingCohort: number | null, userCohort: number | null): number {
  if (!buildingCohort || !userCohort) return 0;
  
  console.log('Lifestyle comparison:', {
    buildingCohort,
    userCohort
  });

  // Direct match gets highest score
  if (buildingCohort === userCohort) return 1;
  
  // Calculate score based on how far apart the cohorts are
  const cohortDifference = Math.abs(buildingCohort - userCohort);
  return Math.max(0, 1 - (cohortDifference * 0.25)); // Reduce score by 25% for each level difference
}

function jaccardSimilarity(set1: string[], set2: string[]): number {
  if (!set1.length || !set2.length) return 0;
  
  const intersection = set1.filter(value => set2.includes(value)).length
  const union = new Set([...set1, ...set2]).size
  return (intersection / union) * 100
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id } = await req.json()
    
    console.log('Processing scores for user:', user_id);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing environment variables.')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Get user preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle()

    if (preferencesError) {
      console.error('Error fetching preferences:', preferencesError)
      throw preferencesError
    }

    if (!preferences) {
      console.log('No preferences found for user:', user_id);
      return new Response(
        JSON.stringify({ message: 'No preferences found for user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log('User preferences:', preferences);

    // Get all buildings
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')

    if (buildingsError) {
      console.error('Error fetching buildings:', buildingsError)
      throw buildingsError
    }

    console.log('Processing scores for buildings:', buildings.length);

    const scores = buildings
      .filter(building => {
        // Only process buildings with valid data
        return building.min_price && building.lifestyle_cohort;
      })
      .map(building => {
        console.log('Processing building:', building.id, building.name);
        
        // Location score calculation remains the same
        let locationScore = 0;
        if (preferences.preferred_localities?.length && building.latitude && building.longitude) {
          const locationDistances = preferences.preferred_localities.map(loc => 
            haversineDistance(
              (loc as any).latitude, 
              (loc as any).longitude, 
              building.latitude, 
              building.longitude
            )
          );
          locationScore = normalize(Math.min(...locationDistances), 0, 10);
        }

        // Budget score with conversion from lakhs to rupees
        const budgetScore = calculateBudgetScore(
          preferences.max_budget || 0,
          building.min_price || 0,
          building.max_price || building.min_price || 0
        ) * 100;

        // Lifestyle score using building cohort and user preferences
        const lifestyleScore = calculateLifestyleScore(
          building.lifestyle_cohort || 0,
          preferences.lifestyle_cohort || 0
        ) * 100;

        console.log('Scores for building:', building.id, {
          locationScore: locationScore / 100,
          budgetScore: budgetScore / 100,
          lifestyleScore: lifestyleScore / 100
        });

        // Final weighted score
        const overallScore = Math.min(1, Math.max(0,
          (locationScore / 100) * 0.3 +
          (budgetScore / 100) * 0.3 +
          (lifestyleScore / 100) * 0.4
        ));

        return {
          building_id: building.id,
          user_id,
          location_match_score: locationScore / 100,
          budget_match_score: budgetScore / 100,
          lifestyle_match_score: lifestyleScore / 100,
          overall_match_score: overallScore,
          calculated_at: new Date().toISOString()
        };
      })

    // Update scores in database
    const { error: upsertError } = await supabase
      .from('user_building_scores')
      .upsert(scores, {
        onConflict: 'user_id,building_id'
      })

    if (upsertError) {
      console.error('Error upserting scores:', upsertError)
      throw upsertError
    }

    console.log('Successfully updated scores for user:', user_id);

    return new Response(
      JSON.stringify({ 
        message: 'Building scores updated successfully',
        scoresCount: scores.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
