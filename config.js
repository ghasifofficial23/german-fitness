/**
 * German Fitness - Global Configuration
 */
const CONFIG = {
    SUPABASE_URL: 'https://kpgzuapbllzhatakkcts.supabase.co',
    SUPABASE_KEY: 'sb_publishable_fL8D4BepEkupdCNsnMaW1Q_E76Za12D',
    WHATSAPP_NUMBER: '923009692474',
    JAZZCASH_SANDBOX: true // Set to false for production
};

// Initialize Supabase if the script is loaded
if (typeof supabase !== 'undefined') {
    window.supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
}
