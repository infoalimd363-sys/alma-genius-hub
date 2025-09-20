import { supabase } from "@/integrations/supabase/client";

export const settingsService = {
  // Get user settings
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update user settings
  async upsertSettings(userId: string, settings: {
    notification_preference?: 'email' | 'sms' | 'push';
    theme?: 'light' | 'dark';
    language?: string;
    privacy_controls?: any;
  }) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update specific setting
  async updateSetting(userId: string, settingKey: string, value: any) {
    const { data, error } = await supabase
      .from('settings')
      .update({
        [settingKey]: value,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Apply theme
  async applyTheme(theme: 'light' | 'dark') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  },

  // Get theme from storage or system preference
  getStoredTheme(): 'light' | 'dark' {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
};