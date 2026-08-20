import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    supabaseAnonKey !== "your-anon-key-here"
  );
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
};

/**
 * Upload an attachment (resume, offer letter, etc.) to the job-attachments bucket
 */
export async function uploadJobAttachment(
  userId: string,
  file: File
): Promise<{ publicUrl: string; fileName: string } | { error: string }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Supabase is not configured" };
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${userId}/${Date.now()}_${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("job-attachments")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (uploadError) {
    console.error("Supabase Storage Upload Error:", uploadError);
    return { error: uploadError.message };
  }

  const { data } = supabase.storage.from("job-attachments").getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    fileName: file.name,
  };
}

/**
 * Delete an attachment from the job-attachments bucket
 */
export async function deleteJobAttachment(filePath: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.storage.from("job-attachments").remove([filePath]);
  if (error) {
    console.error("Supabase Storage Delete Error:", error);
    return false;
  }
  return true;
}
