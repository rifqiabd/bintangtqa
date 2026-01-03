import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxkwhubzuwhrxkbnxnug.supabase.co';
const supabaseKey = 'sb_publishable_4kA9w9_JvgQttweibxOVPw_0IlX_bG1';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('=== Checking user_roles ===');
  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('*');
  
  if (rolesError) console.error('Error:', rolesError);
  else console.log('Roles:', roles);

  console.log('\n=== Checking profiles ===');
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, phone, email');
  
  if (profilesError) console.error('Error:', profilesError);
  else console.log('Profiles:', profiles);
}

checkData();
