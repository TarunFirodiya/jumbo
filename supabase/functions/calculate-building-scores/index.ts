import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
}

interface UserPreferences {
  location_latitude: number | null;
  location_longitude: number | null;
  location_radius: number | null;
  max_budget: number | null;
  lifestyle_cohort: string | null;
}

interface PreferenceWeights {
  location_weight: number;
  budget_weight: number;
  lifestyle_weight: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user_id from request body
    const { user_id, building_ids } = await req.json()
    if (!user_id) {
      throw new Error('user_id is required')
    }

    // Check rate limiting
    const { data: lastCalc } = await supabaseClient
      .from('user_building_scores')
      .select('last_calculation_time')
      .eq('user_id', user_id)
      .order('last_calculation_time', { ascending: false })
      .limit(1)
      .single()

    if (lastCalc?.last_calculation_time) {
      const lastCalcTime = new Date(lastCalc.last_calculation_time)
      const timeSinceLastCalc = Date.now() - lastCalcTime.getTime()
      if (timeSinceLastCalc < 30000) { // 30 seconds rate limit
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait before recalculating.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        )
      }
    }

    // Get user preferences
    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (!preferences) {
      throw new Error('User preferences not found')
    }

    // Get preference weights
    const { data: weights } = await supabaseClient
      .from('user_preference_weights')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const preferenceWeights: PreferenceWeights = {
      location_weight: weights?.location_weight ?? 0.33,
      budget_weight: weights?.budget_weight ?? 0.33,
      lifestyle_weight: weights?.lifestyle_weight ?? 0.34,
    }

    // Get buildings to score
    let buildingQuery = supabaseClient
      .from('buildings')
      .select('id, latitude, longitude, min_price, max_price, amenities_cohort')

    if (building_ids && building_ids.length > 0) {
      buildingQuery = buildingQuery.in('id', building_ids)
    }

    const { data: buildings } = await buildingQuery

    if (!buildings) {
      throw new Error('No buildings found')
    }

    // Calculate scores for each building
    const buildingScores = buildings.map((building: BuildingData) => {
      // Calculate location score
      let locationScore = 0
      if (building.latitude && building.longitude && 
          preferences.location_latitude && preferences.location_longitude) {
        const distance = calculateDistance(
          preferences.location_latitude,
          preferences.location_longitude,
          building.latitude,
          building.longitude
        )
        const maxRadius = preferences.location_radius || 5 // Default 5km radius
        locationScore = Math.max(0, 1 - (distance / maxRadius))
      }

      // Calculate budget score
      let budgetScore = 0
      if (building.max_price && preferences.max_budget) {
        if (building.max_price <= preferences.max_budget) {
          budgetScore = 1
        } else {
          budgetScore = Math.max(0, 1 - ((building.max_price - preferences.max_budget) / preferences.max_budget))
        }
      }

      // Calculate lifestyle score
      let lifestyleScore = 0
      if (building.amenities_cohort !== null && preferences.lifestyle_cohort) {
        const buildingCohort = building.amenities_cohort
        const userCohort = parseInt(preferences.lifestyle_cohort)
        const cohortDiff = Math.abs(buildingCohort - userCohort)
        
        if (cohortDiff === 0) lifestyleScore = 1
        else if (cohortDiff === 1) lifestyleScore = 0.7
        else if (cohortDiff === 2) lifestyleScore = 0.4
        else lifestyleScore = 0.2
      }

      // Calculate overall score
      const overallScore = (
        locationScore * preferenceWeights.location_weight +
        budgetScore * preferenceWeights.budget_weight +
        lifestyleScore * preferenceWeights.lifestyle_weight
      )

      return {
        building_id: building.id,
        user_id,
        location_match_score: locationScore,
        budget_match_score: budgetScore,
        lifestyle_match_score: lifestyleScore,
        overall_match_score: overallScore,
        last_calculation_time: new Date().toISOString()
      }
    })

    // Update scores in database
    const { error: upsertError } = await supabaseClient
      .from('user_building_scores')
      .upsert(buildingScores, {
        onConflict: 'building_id,user_id'
      })

    if (upsertError) {
      throw upsertError
    }

    return new Response(
      JSON.stringify({ success: true, scores: buildingScores }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error calculating building scores:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}