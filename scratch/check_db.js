import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urszeuwfsvsvkznkerdd.supabase.co'
const supabaseAnonKey = 'sb_publishable_7eXN5-faDenwkNDw1ArVXQ_Uo-j9LC2'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkVehicleColumns() {
  const columns = ['brand', 'daily_price', 'image_url', 'owner_id', 'created_at']
  for (const col of columns) {
    const { error } = await supabase.from('vehicles').select(col).limit(1)
    if (error) {
      console.log(`Column vehicles.${col}: MISSING (${error.message})`)
    } else {
      console.log(`Column vehicles.${col}: EXISTS`)
    }
  }
}

checkVehicleColumns()
