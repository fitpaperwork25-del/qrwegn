import { supabase } from "./supabase";

const BIZ_KEY = "qrs_staff_biz";

export interface StaffProfile {
  bizId: string;
  bizName: string;
}

// Calls the staff-login Edge Function (slug + PIN → real JWT for the
// per-business synthetic auth user). Sets the Supabase session so all
// subsequent queries carry a valid JWT and RLS policies can evaluate
// auth.uid().
export async function staffLogin(
  restaurant: string,
  pin: string
): Promise<{ error: string | null }> {
  const supabaseUrl    = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  let data: any;
  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/staff-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseAnonKey,
      },
      body: JSON.stringify({ restaurant: restaurant.trim().toLowerCase(), pin: String(pin) }),
    });
    data = await resp.json();
    if (!resp.ok) return { error: data.error || `Login failed (${resp.status})` };
  } catch (e: any) {
    return { error: `Network error: ${e?.message ?? e}` };
  }

  const { error: sessionErr } = await supabase.auth.setSession({
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
  });
  if (sessionErr) return { error: sessionErr.message };

  sessionStorage.setItem(BIZ_KEY, JSON.stringify({
    bizId:   data.business_id,
    bizName: data.name || "Staff Dashboard",
  } satisfies StaffProfile));

  return { error: null };
}

// Checks that a real Supabase session is active and returns the
// stored business profile. Returns null if the session has expired
// or the profile key is missing (triggers redirect to login).
export async function getStaffProfile(): Promise<StaffProfile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const raw = sessionStorage.getItem(BIZ_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StaffProfile;
  } catch {
    return null;
  }
}

export async function signOutStaff(): Promise<void> {
  sessionStorage.removeItem(BIZ_KEY);
  await supabase.auth.signOut();
}

// ── Legacy stubs (kept so any lingering import sites compile) ──
export function getStaffSession() { return null; }
export function clearStaffSession() { void signOutStaff(); }
export interface StaffSession { bizId: string; bizName: string; bizSlug: string }
