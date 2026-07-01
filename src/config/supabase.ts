import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const KYC_BUCKET = 'Tems_bucket';

export async function uploadKycFile(
  userId: string,
  file: File,
  folder: 'documents' | 'selfies'
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin';
  const path = `kyc/${folder}/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(KYC_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(KYC_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
