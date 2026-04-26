async function test() {
  try {
    const supabaseKey = 'sb_publishable_4kA9w9_JvgQttweibxOVPw_0IlX_bG1';
    const response = await fetch('https://xkupzhwboluapizzstwc.supabase.co/functions/v1/fetch-schools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ nama: 'sma', limit: 2 })
    });
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error);
  }
}
test();
