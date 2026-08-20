// // 1. SUPABASE CLIENT INITIALIZATION (CDN)
// const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
// const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

// const { createClient } = window.supabase;
// const _supabase = createClient(supbaseUrl, supbaseKey);

// console.log("Supabase Connected Successfully!", _supabase);

// // Current Logged-in User (Auth integrate hone par supabase.auth.getUser() se ayega)
// const currentUserId = "user_123";

// // Local State
// let polls = [];

// // 2. INITIAL LOAD
// document.addEventListener("DOMContentLoaded", () => {
//   fetchPollsFromSupabase();
// });

// // 3. FETCH POLLS FROM SUPABASE (Relational Fetch)
// async function fetchPollsFromSupabase() {
//   try {
//     const { data: pollsData, error } = await _supabase
//       .from('polls')
//       .select(`
//         id,
//         question,
//         created_at,
//         poll_options ( id, option_text ),
//         poll_votes ( option_id, user_id )
//       `)
//       .order('created_at', { ascending: false });

//     if (error) throw error;

//     if (pollsData && pollsData.length > 0) {
//       // Supabase Relational Data ko UI Structure mein map karein
//       polls = pollsData.map(poll => {
//         const votes = poll.poll_votes || [];
//         const votedUsers = [...new Set(votes.map(v => v.user_id))];

//         const options = (poll.poll_options || []).map(opt => {
//           const count = votes.filter(v => v.option_id === opt.id).length;
//           return { id: opt.id, text: opt.option_text, votes: count };
//         });

//         return {
//           id: poll.id,
//           question: poll.question,
//           options: options,
//           votedUsers: votedUsers
//         };
//       });
//     } else {
//       // Fallback Data (Agar DB abhi khali ho)
//       polls = [
//         {
//           id: "p1",
//           question: "Which technology should we learn next?",
//           options: [
//             { id: 1, text: "React", votes: 45 },
//             { id: 2, text: "Node.js", votes: 30 },
//             { id: 3, text: "Next.js", votes: 15 },
//             { id: 4, text: "Python", votes: 10 }
//           ],
//           votedUsers: []
//         }
//       ];
//     }

//     renderPolls();
//   } catch (err) {
//     console.warn("Supabase Fetch Warning (using fallback state):", err.message);
//     renderPolls();
//   }
// }

// // 4. RENDER POLLS TO DOM
// function renderPolls() {
//   const container = document.getElementById("polls-list");
//   if (!container) return;

//   container.innerHTML = "";

//   polls.forEach(poll => {
//     const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
//     const hasVoted = poll.votedUsers.includes(currentUserId);

//     let optionsHTML = poll.options.map(opt => {
//       const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
//       return `
//         <button class="poll-option-btn" ${hasVoted ? 'disabled style="cursor:default;"' : ''} onclick="castVote('${poll.id}', '${opt.id}')">
//           <div class="progress-bar-fill" style="width: ${hasVoted ? percentage + '%' : '0%'}"></div>
//           <div class="option-content">
//             <span>${opt.text}</span>
//             <b>${hasVoted ? percentage + '%' : ''}</b>
//           </div>
//         </button>
//       `;
//     }).join("");

//     const card = document.createElement("div");
//     card.className = "glass-card poll-card";
//     card.innerHTML = `
//       <h3 class="text-accent mb-2">${poll.question}</h3>
//       <p style="font-size:13px; color:var(--text-muted); margin-bottom: 15px;">Total Votes: ${totalVotes}</p>
//       <div>${optionsHTML}</div>
//       ${hasVoted ? '<div class="voted-badge"><i class="bi bi-check-circle-fill"></i> You have voted on this poll</div>' : ''}
//     `;

//     container.appendChild(card);
//   });

//   if (typeof animatePollCards === "function") animatePollCards();
// }

// // 5. CAST VOTE TO SUPABASE (Single Vote Lock)
// async function castVote(pollId, optionId) {
//   const poll = polls.find(p => p.id === pollId);
//   if (!poll || poll.votedUsers.includes(currentUserId)) {
//     alert("You can vote only once per poll!");
//     return;
//   }

//   // Optimistic UI Update (Immediate UI response)
//   const option = poll.options.find(o => o.id == optionId);
//   if (option) {
//     option.votes++;
//     poll.votedUsers.push(currentUserId);
//     renderPolls();
//   }

//   try {
//     const { error } = await _supabase
//       .from('poll_votes')
//       .insert([{ poll_id: pollId, option_id: optionId, user_id: currentUserId }]);

//     if (error) {
//       console.error("Error inserting vote:", error.message);
//       fetchPollsFromSupabase(); // Revert on failure
//     } else {
//       fetchPollsFromSupabase(); // Sync with real DB counts
//     }
//   } catch (err) {
//     console.error("Supabase Vote Error:", err.message);
//   }
// }

// // 6. CREATE NEW POLL IN SUPABASE
// document.getElementById("poll-form").addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const questionInput = document.getElementById("poll-question");
//   const question = questionInput.value.trim();
//   const optionInputs = document.querySelectorAll(".option-input");

//   const optionTexts = [];
//   optionInputs.forEach((input) => {
//     if (input.value.trim() !== "") {
//       optionTexts.push(input.value.trim());
//     }
//   });

//   if (optionTexts.length < 2) {
//     alert("Please enter at least 2 options for the poll!");
//     return;
//   }

//   try {
//     // A. Poll Create Karein
//     const { data: newPoll, error: pollErr } = await _supabase
//       .from('polls')
//       .insert([{ question: question, created_by: currentUserId }])
//       .select()
//       .single();

//     if (pollErr) throw pollErr;

//     // B. Poll Options Insert Karein
//     const optionsToInsert = optionTexts.map(text => ({
//       poll_id: newPoll.id,
//       option_text: text
//     }));

//     const { error: optErr } = await _supabase
//       .from('poll_options')
//       .insert(optionsToInsert);

//     if (optErr) throw optErr;

//     // C. Reset Form & UI Reload
//     document.getElementById("poll-form").reset();
//     closePollModal();
//     fetchPollsFromSupabase();

//   } catch (err) {
//     console.error("Error creating poll in Supabase:", err.message);
//     alert("Failed to create poll. Please try again.");
//   }
// });

// // MODAL HELPERS
// function openPollModal() {
//   document.getElementById("createPollModal").classList.add("open");
//   if (typeof animateModalOpen === "function") animateModalOpen();
// }

// function closePollModal() {
//   document.getElementById("createPollModal").classList.remove("open");
// }

// function addOptionInput() {
//   const group = document.getElementById("options-group");
//   const count = group.querySelectorAll("input").length + 1;
//   const input = document.createElement("input");
//   input.type = "text";
//   input.className = "form-control option-input mb-2";
//   input.placeholder = `Option ${count}`;
//   group.appendChild(input);
// }

// =========================================================
// poll.js
// Polls + Supabase
// =========================================================

// 1. SUPABASE CLIENT INITIALIZATION
const pollSupabaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";

const pollSupabaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

// IMPORTANT:
// Direct window.supabase use kar rahe hain taake
// createClient naam kisi doosri JS file se conflict na kare.
const pollSupabase = window.supabase.createClient(
  pollSupabaseUrl,
  pollSupabaseKey,
);

console.log("Poll Supabase Connected Successfully!");

// =========================================================
// 2. POLL STATE
// =========================================================

// IMPORTANT:
// currentUserId naam use nahi kar rahe,
// kyun ke communitypost.js mein ye already موجود hai.
let pollCurrentUserId = null;

let polls = [];

// =========================================================
// 3. INITIAL LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Get logged-in Supabase user
    const {
      data: { user },
      error,
    } = await pollSupabase.auth.getUser();

    if (error) {
      console.error("Poll Auth Error:", error.message);
      return;
    }

    if (!user) {
      console.log("No logged-in user found.");
      return;
    }

    // Save current user's ID
    pollCurrentUserId = user.id;

    // Load polls
    await fetchPollsFromSupabase();
  } catch (err) {
    console.error("Poll Initialization Error:", err);
  }
});

// =========================================================
// 4. FETCH POLLS FROM SUPABASE
// =========================================================

async function fetchPollsFromSupabase() {
  try {
    const { data: pollsData, error } = await pollSupabase
      .from("polls")
      .select(
        `
        id,
        question,
        created_at,
        poll_options (
          id,
          option_text
        ),
        poll_votes (
          option_id,
          user_id
        )
      `,
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    // -----------------------------------------
    // If polls exist
    // -----------------------------------------

    if (pollsData && pollsData.length > 0) {
      polls = pollsData.map((poll) => {
        const votes = poll.poll_votes || [];

        // Users who already voted on this poll
        const votedUsers = [...new Set(votes.map((vote) => vote.user_id))];

        // Poll options with vote counts
        const options = (poll.poll_options || []).map((option) => {
          const count = votes.filter(
            (vote) => vote.option_id === option.id,
          ).length;

          return {
            id: option.id,
            text: option.option_text,
            votes: count,
          };
        });

        return {
          id: poll.id,
          question: poll.question,
          created_at: poll.created_at,
          options: options,
          votedUsers: votedUsers,
        };
      });
    }

    // -----------------------------------------
    // If database has no polls
    // -----------------------------------------
    else {
      polls = [];
    }

    renderPolls();
  } catch (err) {
    console.error("Supabase Poll Fetch Error:", err.message);

    // Don't break UI if database fails
    polls = [];

    renderPolls();
  }
}

// =========================================================
// 5. RENDER POLLS
// =========================================================

function renderPolls() {
  const container = document.getElementById("polls-list");

  // Agar current page par polls container nahi hai
  // to error nahi ayega.
  if (!container) return;

  container.innerHTML = "";

  // No polls
  if (polls.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted py-4">
        No polls available.
      </div>
    `;

    return;
  }

  // Render every poll
  polls.forEach((poll) => {
    const totalVotes = poll.options.reduce(
      (sum, option) => sum + option.votes,
      0,
    );

    const hasVoted = poll.votedUsers.includes(pollCurrentUserId);

    // -----------------------------------------
    // Options
    // -----------------------------------------

    const optionsHTML = poll.options
      .map((option) => {
        const percentage =
          totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

        return `
          <button
            type="button"
            class="poll-option-btn"
            ${hasVoted ? 'disabled style="cursor: default;"' : ""}
            onclick="castPollVote(
              '${poll.id}',
              '${option.id}'
            )"
          >

            <div
              class="progress-bar-fill"
              style="
                width: ${hasVoted ? percentage + "%" : "0%"};
              "
            ></div>

            <div class="option-content">

              <span>
                ${option.text}
              </span>

              <b>
                ${hasVoted ? percentage + "%" : ""}
              </b>

            </div>

          </button>
        `;
      })
      .join("");

    // -----------------------------------------
    // Poll Card
    // -----------------------------------------

    const card = document.createElement("div");

    card.className = "glass-card poll-card";

    card.innerHTML = `
      <h3 class="text-accent mb-2">
        ${poll.question}
      </h3>

      <p
        style="
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 15px;
        "
      >
        Total Votes: ${totalVotes}
      </p>

      <div>
        ${optionsHTML}
      </div>

      ${
        hasVoted
          ? `
            <div class="voted-badge">
              <i class="bi bi-check-circle-fill"></i>
              You have voted on this poll
            </div>
          `
          : ""
      }
    `;

    container.appendChild(card);
  });

  // GSAP animation agar available ho
  if (typeof animatePollCards === "function") {
    animatePollCards();
  }
}

// =========================================================
// 6. CAST VOTE
// =========================================================

// async function castPollVote(pollId, optionId) {
//   // User login check
//   if (!pollCurrentUserId) {
//     alert("Please login before voting.");

//     return;
//   }

//   // Find poll
//   const poll = polls.find((item) => String(item.id) === String(pollId));

//   if (!poll) {
//     console.error("Poll not found:", pollId);

//     return;
//   }

//   // Already voted?
//   if (poll.votedUsers.includes(pollCurrentUserId)) {
//     alert("You can vote only once per poll!");

//     return;
//   }

//   // Find selected option
//   const option = poll.options.find(
//     (item) => String(item.id) === String(optionId),
//   );

//   if (!option) {
//     console.error("Poll option not found:", optionId);

//     return;
//   }

//   // -----------------------------------------
//   // Optimistic UI
//   // -----------------------------------------

//   option.votes++;

//   poll.votedUsers.push(pollCurrentUserId);

//   renderPolls();

//   // -----------------------------------------
//   // Save vote to Supabase
//   // -----------------------------------------

//   try {
//     const { error } = await pollSupabase.from("poll_votes").insert([
//       {
//         poll_id: pollId,
//         option_id: optionId,
//         user_id: pollCurrentUserId,
//       },
//     ]);

//     if (error) {
//       console.error("Vote Insert Error:", error.message);

//       // Reload from database
//       // so UI gets correct state
//       await fetchPollsFromSupabase();

//       return;
//     }

//     // Sync with database
//     await fetchPollsFromSupabase();
//     const { data: pollData } = await pollSupabase
//       .from("polls")
//       .select("created_by, question")
//       .eq("id", pollId)
//       .single();

//     // Apni hi poll par vote karne par notification skip karein
//     if (
//       pollData &&
//       pollData.created_by &&
//       pollData.created_by !== pollCurrentUserId
//     ) {
//       // Current user ka name (agar available ho global variable se)
//       const voterName =
//         typeof currentUserFname !== "undefined" && currentUserFname
//           ? `${currentUserFname} ${currentUserLname || ""}`.trim()
//           : "Someone";

//       await pollSupabase.from("notifications").insert([
//         {
//           user_id: pollData.created_by, // Poll creator ki ID
//           type: "event", // ya 'poll'
//           text: `📊 <b>${voterName}</b> voted on your poll: "${pollData.question}"`,
//           is_read: false,
//         },
//       ]);
//     }
//   } catch (err) {
//     console.error("Supabase Vote Error:", err.message);

//     await fetchPollsFromSupabase();
//   }
// }
// =========================================================
// 6. CAST VOTE WITH NOTIFICATION
// =========================================================

// =========================================================
// 6. CAST VOTE WITH NOTIFICATION (FIXED)
// =========================================================

// =========================================================
// 6. CAST VOTE (WITH CREATOR NOTIFICATION)
// =========================================================

async function castPollVote(pollId, optionId) {
  if (!pollCurrentUserId) {
    alert("Please login before voting.");
    return;
  }

  const poll = polls.find((item) => String(item.id) === String(pollId));
  if (!poll) return;

  if (poll.votedUsers.includes(pollCurrentUserId)) {
    alert("You can vote only once per poll!");
    return;
  }

  const option = poll.options.find(
    (item) => String(item.id) === String(optionId),
  );
  if (!option) return;

  // Optimistic UI update
  option.votes++;
  poll.votedUsers.push(pollCurrentUserId);
  renderPolls();

  try {
    // 1. Vote Database Mein Save Karein
    const { error: voteErr } = await pollSupabase.from("poll_votes").insert([
      {
        poll_id: pollId,
        option_id: optionId,
        user_id: pollCurrentUserId,
      },
    ]);

    if (voteErr) {
      console.error("Vote Error:", voteErr.message);
      await fetchPollsFromSupabase();
      return;
    }

    // 2. Poll ke owner/creator ki details dhoonden
    const { data: pollData } = await pollSupabase
      .from("polls")
      .select("created_by, question")
      .eq("id", pollId)
      .maybeSingle();

    // -------------------------------------------------------------
    // 2. NOTIFICATION: JAB KOI VOTE KARE (Only to Poll Creator)
    // -------------------------------------------------------------
    if (
      pollData &&
      pollData.created_by &&
      String(pollData.created_by) !== String(pollCurrentUserId)
    ) {
      const voterName =
        typeof currentUserFname !== "undefined" && currentUserFname
          ? `${currentUserFname} ${currentUserLname || ""}`.trim()
          : "Someone";

      await pollSupabase.from("notifications").insert([
        {
          user_id: pollData.created_by, // Creator ke liye specific ID
          type: "poll",
          text: `🗳️ <b>${voterName}</b> voted on your poll: "${pollData.question}"`,
          is_read: false,
        },
      ]);
    }
    // -------------------------------------------------------------

    await fetchPollsFromSupabase();
  } catch (err) {
    console.error("Supabase Vote Catch Error:", err);
    await fetchPollsFromSupabase();
  }
}

// =========================================================
// 7. CREATE NEW POLL
// =========================================================

// if (pollForm) {
//   pollForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     // Login check
//     if (!pollCurrentUserId) {
//       alert("Please login before creating a poll.");

//       return;
//     }

//     const questionInput = document.getElementById("poll-question");

//     const optionInputs = document.querySelectorAll(".option-input");

//     if (!questionInput) {
//       console.error("poll-question input not found.");

//       return;
//     }

//     const question = questionInput.value.trim();

//     // -----------------------------------------
//     // Question validation
//     // -----------------------------------------

//     if (!question) {
//       alert("Please enter a poll question.");

//       return;
//     }

//     // -----------------------------------------
//     // Collect options
//     // -----------------------------------------

//     const optionTexts = [];

//     optionInputs.forEach((input) => {
//       const value = input.value.trim();

//       if (value !== "") {
//         optionTexts.push(value);
//       }
//     });

//     // At least 2 options
//     if (optionTexts.length < 2) {
//       alert("Please enter at least 2 options for the poll!");

//       return;
//     }

//     try {
//       // -----------------------------------------
//       // A. Create Poll
//       // -----------------------------------------

//       const { data: newPoll, error: pollError } = await pollSupabase
//         .from("polls")
//         .insert([
//           {
//             question: question,
//             created_by: pollCurrentUserId,
//           },
//         ])
//         .select()
//         .single();

//       if (pollError) {
//         throw pollError;
//       }

//       // -----------------------------------------
//       // B. Create Poll Options
//       // -----------------------------------------

//       const optionsToInsert = optionTexts.map((text) => ({
//         poll_id: newPoll.id,
//         option_text: text,
//       }));

//       const { error: optionError } = await pollSupabase
//         .from("poll_options")
//         .insert(optionsToInsert);

//       if (optionError) {
//         throw optionError;
//       }

//       // -----------------------------------------
//       // C. Reset Form
//       // -----------------------------------------

//       pollForm.reset();

//       closePollModal();

//       // Reload polls
//       await fetchPollsFromSupabase();
//     } catch (err) {
//       console.error("Error creating poll:", err.message);

//       alert("Failed to create poll. Please try again.");
//     }
//   });
// }

// =========================================================
// 8. OPEN POLL MODAL
// =========================================================
// =========================================================
// 7. CREATE NEW POLL (WITH BROADCAST NOTIFICATION)
// =========================================================

const pollForm = document.getElementById("poll-form");

if (pollForm) {
  pollForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!pollCurrentUserId) {
      alert("Please login before creating a poll.");
      return;
    }

    const questionInput = document.getElementById("poll-question");
    const optionInputs = document.querySelectorAll(".option-input");

    if (!questionInput) return;
    const question = questionInput.value.trim();

    if (!question) {
      alert("Please enter a poll question.");
      return;
    }

    const optionTexts = [];
    optionInputs.forEach((input) => {
      const value = input.value.trim();
      if (value !== "") optionTexts.push(value);
    });

    if (optionTexts.length < 2) {
      alert("Please enter at least 2 options for the poll!");
      return;
    }

    try {
      // A. Create Poll
      const { data: newPoll, error: pollError } = await pollSupabase
        .from("polls")
        .insert([
          {
            question: question,
            created_by: pollCurrentUserId,
          },
        ])
        .select()
        .single();

      if (pollError) throw pollError;

      // B. Create Poll Options
      const optionsToInsert = optionTexts.map((text) => ({
        poll_id: newPoll.id,
        option_text: text,
      }));

      const { error: optionError } = await pollSupabase
        .from("poll_options")
        .insert(optionsToInsert);

      if (optionError) throw optionError;

      // -------------------------------------------------------------
      // 1. NOTIFICATION: NAYA POLL BANA (Broadcast to ALL Users)
      // -------------------------------------------------------------
      const creatorName =
        typeof currentUserFname !== "undefined" && currentUserFname
          ? `${currentUserFname} ${currentUserLname || ""}`.trim()
          : "Someone";

      await pollSupabase.from("notifications").insert([
        {
          user_id: null, // NULL ka matlab sub users ke liye broadcast
          type: "poll",
          text: `📊 <b>${creatorName}</b> created a new poll: "${question}"`,
          is_read: false,
        },
      ]);
      // -------------------------------------------------------------

      pollForm.reset();
      closePollModal();
      await fetchPollsFromSupabase();
    } catch (err) {
      console.error("Error creating poll:", err.message);
      alert("Failed to create poll. Please try again.");
    }
  });
}
function openPollModal() {
  const modal = document.getElementById("createPollModal");

  if (!modal) return;

  modal.classList.add("open");

  if (typeof animateModalOpen === "function") {
    animateModalOpen();
  }
}

// =========================================================
// 9. CLOSE POLL MODAL
// =========================================================

function closePollModal() {
  const modal = document.getElementById("createPollModal");

  if (!modal) return;

  modal.classList.remove("open");
}

// =========================================================
// 10. ADD OPTION INPUT
// =========================================================

function addOptionInput() {
  const group = document.getElementById("options-group");

  if (!group) return;

  const count = group.querySelectorAll("input").length + 1;

  const input = document.createElement("input");

  input.type = "text";

  input.className = "form-control option-input mb-2";

  input.placeholder = `Option ${count}`;

  group.appendChild(input);
}
