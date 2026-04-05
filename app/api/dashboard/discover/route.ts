import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'
import { DISCOVERY_QUERIES, searchFirecrawl, classifyActivity } from '@/lib/activity-discovery'
import { createHash } from 'crypto'

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', user.id)
    .single()

  if (!profile?.family_id) return NextResponse.json({ error: 'No family' }, { status: 400 })

  // Create discovery job
  const { data: job, error: jobError } = await supabase
    .from('discovery_jobs')
    .insert({
      family_id: profile.family_id,
      status: 'running',
      queries_total: DISCOVERY_QUERIES.length,
      queries_completed: 0,
      activities_found: 0,
    })
    .select()
    .single()

  if (jobError || !job) return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })

  // Run discovery in background (non-blocking response)
  runDiscovery(job.id, profile.family_id, supabase).catch(() => {})

  return NextResponse.json({ jobId: job.id }, { status: 202 })
}

async function runDiscovery(
  jobId: string,
  familyId: string,
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  let totalFound = 0

  for (let i = 0; i < DISCOVERY_QUERIES.length; i++) {
    const query = DISCOVERY_QUERIES[i]

    try {
      const results = await searchFirecrawl(query)

      for (const result of results) {
        if (!result.url) continue

        const urlHash = createHash('md5').update(result.url).digest('hex')

        // Skip duplicates
        const { data: existing } = await supabase
          .from('local_activities')
          .select('id')
          .eq('url_hash', urlHash)
          .limit(1)

        if (existing && existing.length > 0) continue

        // Classify with Haiku
        const classification = await classifyActivity(result.title, result.description)

        await supabase.from('local_activities').insert({
          family_id: familyId,
          title: result.title,
          description: result.description,
          url: result.url,
          url_hash: urlHash,
          source: query,
          location: classification?.location ?? null,
          cost: classification?.cost ?? 'free',
          age_min: classification?.age_min ?? null,
          age_max: classification?.age_max ?? null,
          primary_trait: classification?.primary_trait ?? null,
          traits: classification?.traits ?? [],
          tags: classification?.tags ?? [],
          event_date: classification?.event_date ?? null,
          classified_at: classification ? new Date().toISOString() : null,
          raw_snippet: result.description?.slice(0, 500) ?? null,
        })

        totalFound++
      }
    } catch {
      // Continue with next query on failure
    }

    // Update job progress
    await supabase
      .from('discovery_jobs')
      .update({ queries_completed: i + 1, activities_found: totalFound })
      .eq('id', jobId)
  }

  // Mark complete
  await supabase
    .from('discovery_jobs')
    .update({
      status: 'completed',
      queries_completed: DISCOVERY_QUERIES.length,
      activities_found: totalFound,
      completed_at: new Date().toISOString(),
    })
    .eq('id', jobId)
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = request.nextUrl.searchParams.get('jobId')
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const { data: job, error } = await supabase
    .from('discovery_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ job })
}
