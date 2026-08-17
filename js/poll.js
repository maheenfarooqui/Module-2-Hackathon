// 1. SUPABASE CLIENT INITIALIZATION (CDN)
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

const { createClient } = window.supabase;
const _supabase = createClient(supbaseUrl, supbaseKey);

console.log("Supabase Connected Successfully!", _supabase);

// Current Logged-in User (Auth integrate hone par supabase.auth.getUser() se ayega)
const currentUserId = "user_123";

// Local State
let polls = [];

// 2. INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
  fetchPollsFromSupabase();
});

// 3. FETCH POLLS FROM SUPABASE (Relational Fetch)
async function fetchPollsFromSupabase() {
  try {
    const { data: pollsData, error } = await _supabase
      .from('polls')
      .select(`
        id,
        question,
        created_at,
        poll_options ( id, option_text ),
        poll_votes ( option_id, user_id )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (pollsData && pollsData.length > 0) {
      // Supabase Relational Data ko UI Structure mein map karein
      polls = pollsData.map(poll => {
        const votes = poll.poll_votes || [];
        const votedUsers = [...new Set(votes.map(v => v.user_id))];

        const options = (poll.poll_options || []).map(opt => {
          const count = votes.filter(v => v.option_id === opt.id).length;
          return { id: opt.id, text: opt.option_text, votes: count };
        });

        return {
          id: poll.id,
          question: poll.question,
          options: options,
          votedUsers: votedUsers
        };
      });
    } else {
      // Fallback Data (Agar DB abhi khali ho)
      polls = [
        {
          id: "p1",
          question: "Which technology should we learn next?",
          options: [
            { id: 1, text: "React", votes: 45 },
            { id: 2, text: "Node.js", votes: 30 },
            { id: 3, text: "Next.js", votes: 15 },
            { id: 4, text: "Python", votes: 10 }
          ],
          votedUsers: []
        }
      ];
    }

    renderPolls();
  } catch (err) {
    console.warn("Supabase Fetch Warning (using fallback state):", err.message);
    renderPolls();
  }
}

// 4. RENDER POLLS TO DOM
function renderPolls() {
  const container = document.getElementById("polls-list");
  if (!container) return;

  container.innerHTML = "";

  polls.forEach(poll => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const hasVoted = poll.votedUsers.includes(currentUserId);

    let optionsHTML = poll.options.map(opt => {
      const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
      return `
        <button class="poll-option-btn" ${hasVoted ? 'disabled style="cursor:default;"' : ''} onclick="castVote('${poll.id}', '${opt.id}')">
          <div class="progress-bar-fill" style="width: ${hasVoted ? percentage + '%' : '0%'}"></div>
          <div class="option-content">
            <span>${opt.text}</span>
            <b>${hasVoted ? percentage + '%' : ''}</b>
          </div>
        </button>
      `;
    }).join("");

    const card = document.createElement("div");
    card.className = "glass-card poll-card";
    card.innerHTML = `
      <h3 class="text-accent mb-2">${poll.question}</h3>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom: 15px;">Total Votes: ${totalVotes}</p>
      <div>${optionsHTML}</div>
      ${hasVoted ? '<div class="voted-badge"><i class="bi bi-check-circle-fill"></i> You have voted on this poll</div>' : ''}
    `;

    container.appendChild(card);
  });

  if (typeof animatePollCards === "function") animatePollCards();
}

// 5. CAST VOTE TO SUPABASE (Single Vote Lock)
async function castVote(pollId, optionId) {
  const poll = polls.find(p => p.id === pollId);
  if (!poll || poll.votedUsers.includes(currentUserId)) {
    alert("You can vote only once per poll!");
    return;
  }

  // Optimistic UI Update (Immediate UI response)
  const option = poll.options.find(o => o.id == optionId);
  if (option) {
    option.votes++;
    poll.votedUsers.push(currentUserId);
    renderPolls();
  }

  try {
    const { error } = await _supabase
      .from('poll_votes')
      .insert([{ poll_id: pollId, option_id: optionId, user_id: currentUserId }]);

    if (error) {
      console.error("Error inserting vote:", error.message);
      fetchPollsFromSupabase(); // Revert on failure
    } else {
      fetchPollsFromSupabase(); // Sync with real DB counts
    }
  } catch (err) {
    console.error("Supabase Vote Error:", err.message);
  }
}

// 6. CREATE NEW POLL IN SUPABASE
document.getElementById("poll-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const questionInput = document.getElementById("poll-question");
  const question = questionInput.value.trim();
  const optionInputs = document.querySelectorAll(".option-input");
  
  const optionTexts = [];
  optionInputs.forEach((input) => {
    if (input.value.trim() !== "") {
      optionTexts.push(input.value.trim());
    }
  });

  if (optionTexts.length < 2) {
    alert("Please enter at least 2 options for the poll!");
    return;
  }

  try {
    // A. Poll Create Karein
    const { data: newPoll, error: pollErr } = await _supabase
      .from('polls')
      .insert([{ question: question, created_by: currentUserId }])
      .select()
      .single();

    if (pollErr) throw pollErr;

    // B. Poll Options Insert Karein
    const optionsToInsert = optionTexts.map(text => ({
      poll_id: newPoll.id,
      option_text: text
    }));

    const { error: optErr } = await _supabase
      .from('poll_options')
      .insert(optionsToInsert);

    if (optErr) throw optErr;

    // C. Reset Form & UI Reload
    document.getElementById("poll-form").reset();
    closePollModal();
    fetchPollsFromSupabase();

  } catch (err) {
    console.error("Error creating poll in Supabase:", err.message);
    alert("Failed to create poll. Please try again.");
  }
});

// MODAL HELPERS
function openPollModal() {
  document.getElementById("createPollModal").classList.add("open");
  if (typeof animateModalOpen === "function") animateModalOpen();
}

function closePollModal() {
  document.getElementById("createPollModal").classList.remove("open");
}

function addOptionInput() {
  const group = document.getElementById("options-group");
  const count = group.querySelectorAll("input").length + 1;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control option-input mb-2";
  input.placeholder = `Option ${count}`;
  group.appendChild(input);
}