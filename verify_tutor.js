import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxkwhubzuwhrxkbnxnug.supabase.co';
const supabaseKey = 'sb_publishable_4kA9w9_JvgQttweibxOVPw_0IlX_bG1';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log('=== Verifying Tutor Data ===\n');
  
  const { data: tutorRoles } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'tutor');
  
  console.log('Tutor roles:', tutorRoles);
  
  if (tutorRoles && tutorRoles.length > 0) {
    const tutorIds = tutorRoles.map(r => r.user_id);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', tutorIds);
    
    console.log('\nTutor profiles:', profiles);
    
    const { data: tutorDetails } = await supabase
      .from('tutor_details')
      .select('*')
      .in('tutor_id', tutorIds);
    
    console.log('\nTutor details:', tutorDetails);
  }
}

verify();
