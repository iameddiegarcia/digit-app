import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { child_id, trait, amount } = await request.json()

    const { error } = await supabase.rpc('increment_trait_score', {
      p_child_id: child_id,
      p_trait: trait,
      p_amount: amount,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
