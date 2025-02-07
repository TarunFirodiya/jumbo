
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
  
  maxPrice = maxPrice || minPrice;
  
  if (maxPrice < userBudget * 0.8 || minPrice > userBudget * 1.2) {
    return 0 // Out of range
  }

  const overlap = Math.max(0, Math.min(maxPrice, userBudget) - Math.max(minPrice, userBudget * 0.8))
  return normalize(overlap, 0, userBudget * 0.4)
}

function calculateGoogleRatingScore(rating: number | null): number {
  if (!rating) return 0;
  
  if (rating >= 4.5) return 90 + (rating - 4.5) * 10
  if (rating >= 3.5) return normalize(rating, 3.5, 4.5) * 60
  if (rating >= 2.5) return normalize(rating, 2.5, 3.5) * 50
  return 0
}

function calculateLifestyleScore(buildingCohort: number | null, age: number | null): number {
  if (!buildingCohort || !age) return 0;
  return normalize(buildingCohort - age * 2, 0, 20) // Penalizing older buildings
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
      .single()

    if (preferencesError) {
      console.error('Error fetching preferences:', preferencesError)
      throw preferencesError
    }

    // Get shortlisted buildings
    const { data: shortlistedData, error: shortlistedError } = await supabase
      .from('user_shortlisted_buildings')
      .select('shortlisted_building_ids')
      .eq('user_id', user_id)
      .single()

    if (shortlistedError && shortlistedError.code !== 'PGRST116') { // Ignore not found error
      console.error('Error fetching shortlisted buildings:', shortlistedError)
      throw shortlistedError
    }

    const shortlistedBuildingIds = shortlistedData?.shortlisted_building_ids || []

    // Get all buildings
    const { data: buildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('*')

    if (buildingsError) {
      console.error('Error fetching buildings:', buildingsError)
      throw buildingsError
    }

    console.log('Processing scores for user preferences:', preferences)

    const scores = buildings
      .filter(building => {
        // Filter by BHK if preferences exist
        if (preferences.bhk_preferences?.length) {
          return preferences.bhk_preferences.some(bhk => 
            building.bhk_types?.includes(bhk)
          )
        }
        return true
      })
      .map(building => {
        // Location score (Haversine distance from nearest preferred locality)
        let locationScore = 0
        if (preferences.preferred_localities?.length && building.latitude && building.longitude) {
          const locationDistances = preferences.preferred_localities.map(loc => 
            haversineDistance(
              (loc as any).latitude, 
              (loc as any).longitude, 
              building.latitude, 
              building.longitude
            )
          )
          locationScore = normalize(Math.min(...locationDistances), 0, 10)
        }

        // Budget score
        const budgetScore = calculateBudgetScore(
          preferences.max_budget,
          building.min_price,
          building.max_price
        )

        // Lifestyle score using lifestyle_cohort
        const lifestyleScore = calculateLifestyleScore(
          building.lifestyle_cohort,
          building.age
        )

        // Feature matching using home_features
        const featureScore = jaccardSimilarity(
          preferences.home_features || [],
          (building.features as string[]) || []
        )

        // Google rating score
        const googleRatingScore = calculateGoogleRatingScore(building.google_rating)

        // Apply deal-breaker penalty
        if (preferences.deal_breakers?.some(db => 
          building.features && (building.features as string[]).includes(db)
        )) {
          return {
            building_id: building.id,
            user_id,
            location_match_score: 0,
            budget_match_score: 0,
            lifestyle_match_score: 0,
            overall_match_score: 0,
            amenities_match_score: featureScore,
            bhk_match_score: preferences.bhk_preferences?.some(bhk => building.bhk_types?.includes(bhk)) ? 100 : 0,
            calculated_at: new Date().toISOString(),
            top_callout_1: `${Math.round(locationScore)}% location match`,
            top_callout_2: `${Math.round(budgetScore)}% budget match`
          }
        }

        // Learning from shortlisting behavior
        let shortlistBoost = 0
        if (shortlistedBuildingIds.includes(building.id)) {
          shortlistBoost = 10 // Direct boost for a shortlisted building
        } else {
          // Find similarity with shortlisted buildings
          const similarShortlisted = buildings.filter(b =>
            shortlistedBuildingIds.includes(b.id) &&
            b.latitude && b.longitude && building.latitude && building.longitude &&
            haversineDistance(b.latitude, b.longitude, building.latitude, building.longitude) < 2 &&
            calculateBudgetScore(preferences.max_budget, b.min_price, b.max_price) > 50
          )
          if (similarShortlisted.length > 0) {
            shortlistBoost = 5 // Boost similar buildings
          }
        }

        // Final weighted score
        const overallScore =
          locationScore * 0.3 +
          budgetScore * 0.2 +
          lifestyleScore * 0.1 +
          featureScore * 0.1 +
          googleRatingScore * 0.1 +
          shortlistBoost

        return {
          building_id: building.id,
          user_id,
          location_match_score: locationScore,
          budget_match_score: budgetScore,
          lifestyle_match_score: lifestyleScore,
          overall_match_score: overallScore / 100,
          amenities_match_score: featureScore,
          bhk_match_score: preferences.bhk_preferences?.some(bhk => building.bhk_types?.includes(bhk)) ? 100 : 0,
          calculated_at: new Date().toISOString(),
          top_callout_1: `${Math.round(locationScore)}% location match`,
          top_callout_2: `${Math.round(budgetScore)}% budget match`
        }
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

    return new Response(
      JSON.stringify({ 
        message: 'Building scores updated successfully',
        scores 
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
