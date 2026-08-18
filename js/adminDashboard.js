import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const service_role =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaGV1d29wZmtwZHluZmdqdGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMjM5OSwiZXhwIjoyMDk4NDk4Mzk5fQ.yvmgW9-bzNBspiaqHMKtXf-GlfJaeMrgJxTH40_-gRw";
var supabase = createClient(supbaseUrl, supbaseKey);
const supabaseAdmin = createClient(supbaseUrl, service_role);
// Function to fetch counts from Supabase tables
async function fetchAdminDashboardStats() {
  try {
    // 1. Fetch Total Users (Assuming 'profiles' table exists, otherwise checks auth/users via profiles)
 const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    // 2. Fetch Total Posts (postApp)
    const { count: postsCount, error: postsErr } = await supabase
      .from('postApp')
      .select('*', { count: 'exact', head: true });

    // 3. Fetch Total Events (events)
    const { count: eventsCount, error: eventsErr } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    // 4. Fetch Study Partners Requests (study_partners)
    const { count: studyCount, error: studyErr } = await supabase
      .from('study_partners')
      .select('*', { count: 'exact', head: true });

    // 5. Fetch Total Comments (commentsApp)
    const { count: commentsCount, error: commentsErr } = await supabase
      .from('commentsApp')
      .select('*', { count: 'exact', head: true });

    // 6. Fetch Total Likes (likesapp)
    const { count: likesCount, error: likesErr } = await supabase
      .from('likesApp')
      .select('*', { count: 'exact', head: true });

    // --- DOM Update ---
    document.getElementById('totalUsersCount').innerText =  `${users.length}` || 0;
    document.getElementById('totalPostsCount').innerText = postsCount || 0;
    document.getElementById('totalEventsCount').innerText = eventsCount || 0;
    document.getElementById('studyPartnersCount').innerText = studyCount || 0;
    document.getElementById('totalCommentsCount').innerText = commentsCount || 0;
    document.getElementById('totalLikesCount').innerText = likesCount || 0;

  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error.message);
  }
}

// Page load hone par runs automatically
document.addEventListener('DOMContentLoaded', () => {
  fetchAdminDashboardStats();
});