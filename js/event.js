/* ==========================================================
   SUPABASE INITIALIZATION
   ========================================================== */
var SUPABASE_URL = "https://dpheuwopfkpdynfgjthm.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

// Initialize Supabase Client
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

var allEvents = [];
var currentTabFilter = 'all';

// APPLICATION INITIALIZATION
window.addEventListener('DOMContentLoaded', function () {
  loadEvents();
});

/* ==========================================================
   READ (FETCH EVENTS FROM SUPABASE)
   ========================================================== */
function loadEvents() {
  supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true })
    .then(function (response) {
      if (response.error) {
        console.error('Supabase fetch error:', response.error.message);
        // Fallback to LocalStorage if Supabase fails or keys are not yet configured
        loadFromLocalStorage();
        return;
      }

      if (response.data && response.data.length > 0) {
        allEvents = response.data;
      } else {
        allEvents = [];
      }
      applyFilters();
    })
    .catch(function (err) {
      console.error('Network or Supabase error:', err);
      loadFromLocalStorage();
    });
}

// FALLBACK LOCAL STORAGE FUNCTION
function loadFromLocalStorage() {
  var storedData = localStorage.getItem('campus_events_data');
  if (storedData) {
    allEvents = JSON.parse(storedData);
  } else {
    allEvents = [];
  }
  applyFilters();
}

function saveEventsToStorage() {
  localStorage.setItem('campus_events_data', JSON.stringify(allEvents));
}

/* ==========================================================
   HELPER FUNCTIONS FOR DATE & TIME FORMATTING
   ========================================================== */
function formatDate(dateString) {
  if (!dateString) return '';
  var parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  var year = parts[0];
  var month = parseInt(parts[1], 10) - 1;
  var day = parseInt(parts[2], 10);

  var dateObj = new Date(year, month, day);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[dateObj.getMonth()] + ' ' + day + ', ' + year;
}

function formatTime(timeString) {
  if (!timeString) return '';
  var parts = timeString.split(':');
  if (parts.length < 2) return timeString;

  var hours = parseInt(parts[0], 10);
  var minutes = parts[1];
  var ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12;
  var hoursStr = hours < 10 ? '0' + hours : hours;

  return hoursStr + ':' + minutes + ' ' + ampm;
}

/* ==========================================================
   FILTER & RENDER LOGIC
   ========================================================== */
function applyFilters() {
  var searchValue = document.getElementById('searchInput').value.toLowerCase().trim();
  var categoryValue = document.getElementById('categoryFilter').value;
  var today = new Date().toISOString().split('T')[0];

  var filteredList = allEvents.filter(function (eventItem) {
    var matchesSearch =
      eventItem.title.toLowerCase().includes(searchValue) ||
      eventItem.location.toLowerCase().includes(searchValue) ||
      eventItem.description.toLowerCase().includes(searchValue);

    var matchesCategory =
      categoryValue === 'all' || eventItem.category === categoryValue;

    var matchesTab = true;
    if (currentTabFilter === 'upcoming') {
      matchesTab = eventItem.date >= today;
    }

    return matchesSearch && matchesCategory && matchesTab;
  });

  renderGrid(filteredList);
}

function renderGrid(eventsList) {
  var container = document.getElementById('eventsContainer');

  if (eventsList.length === 0) {
    container.innerHTML = '<div class="empty-message">No matching events found.</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < eventsList.length; i++) {
    var item = eventsList[i];
    var displayDate = item.formatted_date || formatDate(item.date);
    var displayTime = item.formatted_time || formatTime(item.time);

    var actionButton = item.is_registered
      ? '<button class="btn-danger" onclick="toggleRegistration(' + item.id + ')"><i class="fa-solid fa-user-xmark icon-left"></i> Cancel Registration</button>'
      : '<button class="btn-outline" onclick="toggleRegistration(' + item.id + ')"><i class="fa-solid fa-user-plus icon-left"></i> Register</button>';

    html += '<article class="event-card">' +
      '<div class="card-image-wrapper">' +
        '<img src="' + item.image + '" class="card-image" alt="Event">' +
        '<span class="card-category-badge">' + item.category + '</span>' +
        '<button class="card-delete-btn" onclick="deleteEvent(' + item.id + ')" title="Delete Event"><i class="fa-solid fa-trash-can"></i></button>' +
      '</div>' +
      '<div class="card-body">' +
        '<h2 class="card-title">' + item.title + '</h2>' +
        '<p class="card-description">' + item.description + '</p>' +
        '<ul class="card-details-list">' +
          '<li><i class="fa-regular fa-calendar-days"></i> ' + displayDate + '</li>' +
          '<li><i class="fa-regular fa-clock"></i> ' + displayTime + '</li>' +
          '<li><i class="fa-solid fa-location-dot"></i> ' + item.location + '</li>' +
        '</ul>' +
        '<div class="card-footer">' +
          '<span class="registered-count"><i class="fa-solid fa-users icon-left"></i> ' + item.participants + ' Registered</span>' +
          actionButton +
        '</div>' +
      '</div>' +
    '</article>';
  }

  container.innerHTML = html;
}

/* ==========================================================
   UPDATE (TOGGLE REGISTRATION)
   ========================================================== */
function toggleRegistration(id) {
  var targetEvent = null;

  for (var i = 0; i < allEvents.length; i++) {
    if (allEvents[i].id === id) {
      targetEvent = allEvents[i];
      break;
    }
  }

  if (!targetEvent) return;

  var updatedStatus = !targetEvent.is_registered;
  var updatedCount = updatedStatus
    ? targetEvent.participants + 1
    : Math.max(0, targetEvent.participants - 1);

  // Optimistic UI Update
  targetEvent.is_registered = updatedStatus;
  targetEvent.participants = updatedCount;
  applyFilters();
  saveEventsToStorage();

  // Supabase DB Update
  supabase
    .from('events')
    .update({
      participants: updatedCount,
      is_registered: updatedStatus
    })
    .eq('id', id)
    .then(function (res) {
      if (res.error) {
        console.error('Registration update error:', res.error.message);
      }
    });
}

/* ==========================================================
   DELETE (REMOVE EVENT)
   ========================================================== */
function deleteEvent(id) {
  var confirmAction = confirm("Are you sure you want to delete this event?");
  if (!confirmAction) return;

  // Optimistic UI Update
  var updatedList = [];
  for (var i = 0; i < allEvents.length; i++) {
    if (allEvents[i].id !== id) {
      updatedList.push(allEvents[i]);
    }
  }

  allEvents = updatedList;
  applyFilters();
  saveEventsToStorage();

  // Supabase DB Delete
  supabase
    .from('events')
    .delete()
    .eq('id', id)
    .then(function (res) {
      if (res.error) {
        console.error('Delete event error:', res.error.message);
      }
    });
}

/* ==========================================================
   CREATE (INSERT EVENT)
   ========================================================== */
function handleCreateEvent(e) {
  e.preventDefault();

  var submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Posting...';

  var rawDate = document.getElementById('eventDate').value;
  var rawTime = document.getElementById('eventTime').value;

  if (!rawDate || !rawTime) {
    alert("Please select both Date and Time.");
    submitBtn.disabled = false;
    submitBtn.innerText = 'Post Event';
    return;
  }

  var newEvent = {
    title: document.getElementById('eventTitle').value,
    description: document.getElementById('eventDesc').value,
    date: rawDate,
    formatted_date: formatDate(rawDate),
    time: rawTime,
    formatted_time: formatTime(rawTime),
    location: document.getElementById('eventLocation').value,
    category: document.getElementById('eventCategory').value,
    image: document.getElementById('eventImage').value,
    participants: 0,
    is_registered: false
  };

  // Supabase DB Insert
  supabase
    .from('events')
    .insert([newEvent])
    .select()
    .then(function (res) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Post Event';

      if (res.error) {
        console.error('Insert event error:', res.error.message);
        alert('Failed to save event to database: ' + res.error.message);
        return;
      }

      if (res.data && res.data.length > 0) {
        allEvents.unshift(res.data[0]);
      } else {
        // Local fallback in case select fails
        newEvent.id = Date.now();
        allEvents.unshift(newEvent);
      }

      saveEventsToStorage();
      document.getElementById('createEventForm').reset();
      closeCreateModal();
      applyFilters();
    });
}

/* ==========================================================
   MODAL & TAB CONTROLS
   ========================================================== */
function setTabFilter(filterType) {
  currentTabFilter = filterType;
  document.getElementById('filterAllBtn').className = filterType === 'all' ? 'tab-btn active' : 'tab-btn';
  document.getElementById('filterUpcomingBtn').className = filterType === 'upcoming' ? 'tab-btn active' : 'tab-btn';
  applyFilters();
}

var modal = document.getElementById('createEventModal');

function openCreateModal() {
  modal.classList.add('active');
}

function closeCreateModal() {
  modal.classList.remove('active');
}

window.onclick = function (event) {
  if (event.target === modal) {
    closeCreateModal();
  }
};