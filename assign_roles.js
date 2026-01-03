import { createClient } from '@supabase/supabase-js';
import readline from 'readline';

const supabaseUrl = 'https://oxkwhubzuwhrxkbnxnug.supabase.co';
const supabaseKey = 'sb_publishable_4kA9w9_JvgQttweibxOVPw_0IlX_bG1';
const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function assignRoles() {
  console.log('=== Assign Roles to Existing Users ===\n');
  
  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email');
  
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('No profiles found.');
    return;
  }

  console.log('Users found:');
  profiles.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.full_name} (${p.email})`);
  });

  rl.question('\nPilih user (nomor): ', async (userIdx) => {
    const idx = parseInt(userIdx) - 1;
    if (idx < 0 || idx >= profiles.length) {
      console.log('Invalid selection');
      rl.close();
      return;
    }

    const selectedUser = profiles[idx];
    
    rl.question('Pilih role (1=student, 2=tutor, 3=admin): ', async (roleChoice) => {
      let role = 'student';
      if (roleChoice === '2') role = 'tutor';
      else if (roleChoice === '3') role = 'admin';
      
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', selectedUser.id)
        .single();

      if (existingRole) {
        console.log(`\nUser already has role: ${existingRole.role}`);
        rl.question('Update role? (y/n): ', async (confirm) => {
          if (confirm.toLowerCase() === 'y') {
            const { error: updateError } = await supabase
              .from('user_roles')
              .update({ role })
              .eq('user_id', selectedUser.id);
            
            if (updateError) {
              console.error('Error updating role:', updateError);
            } else {
              console.log(`✓ Role updated to: ${role}`);
            }
          }
          rl.close();
        });
      } else {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUser.id, role });
        
        if (insertError) {
          console.error('Error inserting role:', insertError);
        } else {
          console.log(`✓ Role assigned: ${role}`);
          
          // If tutor, create tutor_details
          if (role === 'tutor') {
            const { error: tutorError } = await supabase
              .from('tutor_details')
              .insert({
                tutor_id: selectedUser.id,
                subjects: ['matematika'],
                experience: 'Pengalaman mengajar'
              });
            
            if (tutorError) {
              console.error('Error creating tutor details:', tutorError);
            } else {
              console.log('✓ Tutor details created');
            }
          }
        }
        rl.close();
      }
    });
  });
}

assignRoles();
