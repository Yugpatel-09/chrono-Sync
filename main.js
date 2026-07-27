
let team = [];
let globalBaseTime = new Date();
globalBaseTime.setHours(0, 0, 0, 0);


const DEFAULT_TEAM = [
  { id: '1', name: 'You (Local) 🤓', tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: '2', name: 'Tokyo 🍣', tz: 'Asia/Tokyo' },
  { id: '3', name: 'London 🌧️', tz: 'Europe/London' }
];

let settings = {
  use24hr: false
};

const globalSlider = document.getElementById('global-slider');
const globalTimeDisplay = document.getElementById('global-time-display');
const teamGrid = document.getElementById('team-grid');
const addModal = document.getElementById('add-modal');
const closeModalBtn = document.getElementById('close-modal');
const savePersonBtn = document.getElementById('save-person-btn');
const personNameInput = document.getElementById('person-name');
const personTimezoneSelect = document.getElementById('person-timezone');
const toast = document.getElementById('toast');
const chaosBtn = document.getElementById('btn-chaos');

const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');
const setting24hr = document.getElementById('setting-24hr');

const EMOJIS = ['🚀', '👽', '🍕', '🤠', '👻', '🤖', '👾', '🔥', '✨', '🦦'];

function init() {
  populateTimezones();
  loadStateFromURL();
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  globalSlider.value = currentMinutes;

  render();
  setupEventListeners();
}

function getRandomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function render() {
  const selectedMinutes = parseInt(globalSlider.value, 10);
  const selectedTime = new Date(globalBaseTime.getTime() + selectedMinutes * 60000);
  
  globalTimeDisplay.textContent = formatTime(selectedTime, Intl.DateTimeFormat().resolvedOptions().timeZone).timeStr;

  teamGrid.innerHTML = '';
  team.forEach((person) => {
    const card = document.createElement('div');
    const { timeStr, ampm, hour24, offsetStr } = formatTime(selectedTime, person.tz);
    
    // Figure out what color the card should be based on time of day
    // 8am-6pm = day (yellow), 6pm-11pm = evening (blue), otherwise night (gray)
    let statusClass = 'status-night';
    if (hour24 >= 8 && hour24 < 18) statusClass = 'status-day';
    else if (hour24 >= 18 && hour24 < 23) statusClass = 'status-evening';
    
    card.className = `person-card ${statusClass}`;
    const tzName = person.tz.split('/').pop().replace(/_/g, ' ');

    card.innerHTML = `
      <div class="person-header">
        <div class="person-info">
          <h3>${person.name}</h3>
          <p>🌎 ${tzName}</p>
        </div>
        <button class="delete-btn" onclick="removePerson('${person.id}')">X</button>
      </div>
      <div class="person-time">
        <span class="person-time-value">${timeStr}</span>
        ${!settings.use24hr ? `<span class="person-time-ampm">${ampm}</span>` : ''}
        <span class="person-time-diff">${offsetStr}</span>
      </div>
    `;
    teamGrid.appendChild(card);
  });

  // Save the current state to the URL so people can share it
  updateURLState();
}

// Handle all the timezone formatting complexity
function formatTime(date, timeZone) {
  try {
    const options = { timeZone, hour: 'numeric', minute: '2-digit', hour12: !settings.use24hr };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    
    let hour = parts.find(p => p.type === 'hour').value;
    let minute = parts.find(p => p.type === 'minute').value;
    let ampm = parts.find(p => p.type === 'dayPeriod')?.value || '';
    
    // Need 24-hour format for the color coding logic
    const options24 = { timeZone, hour: 'numeric', hour12: false };
    const hour24 = parseInt(new Intl.DateTimeFormat('en-US', options24).format(date), 10);

    // Get the timezone offset string (like GMT+5, GMT-8, etc)
    const localFormatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'shortOffset', timeZone });
    const localParts = localFormatter.formatToParts(new Date());
    const offsetStr = localParts.find(p => p.type === 'timeZoneName')?.value || '';

    return { timeStr: `${hour}:${minute}`, ampm, hour24, offsetStr };
  } catch (e) {
    // Fallback if something goes wrong with the timezone
    return { timeStr: '--:--', ampm: '', hour24: 12, offsetStr: '' };
  }
}

// Need this to be global so the onclick in the HTML works
window.removePerson = function(id) {
  team = team.filter(p => p.id !== id);
  render();
};

// Set up all the event listeners
function setupEventListeners() {
  // Update time display when slider moves
  globalSlider.addEventListener('input', render);
  
  // Open the add person modal
  document.querySelectorAll('.open-add-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      addModal.classList.remove('hidden');
      personNameInput.focus();
    });
  });
  
  // Close the modal
  closeModalBtn.addEventListener('click', () => {
    addModal.classList.add('hidden');
  });
  
  // Save the new person
  savePersonBtn.addEventListener('click', () => {
    let name = personNameInput.value.trim() || 'Hacker';
    // Check if they included an emoji, if not add a random one
    if (![...name].some(char => char.length > 1)) {
        name += ' ' + getRandomEmoji();
    }
    const tz = personTimezoneSelect.value;
    team.push({ id: Date.now().toString(), name, tz });
    personNameInput.value = '';
    addModal.classList.add('hidden');
    render();
  });

  // The chaos button - randomly jumps the slider around for fun
  if (chaosBtn) {
    chaosBtn.addEventListener('click', () => {
      let loops = 0;
      const chaosInterval = setInterval(() => {
        globalSlider.value = Math.floor(Math.random() * 1439);
        render();
        loops++;
        if (loops > 20) clearInterval(chaosInterval);
      }, 50);
    });
  }

  // Copy the current URL to clipboard
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
      });
    });
  });

  // Handle navigation between Dashboard and Settings
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      viewSections.forEach(v => {
        v.classList.remove('active');
        if (v.id === targetId) v.classList.add('active');
      });
    });
  });

  // Toggle 24-hour time format
  setting24hr.addEventListener('change', (e) => {
    settings.use24hr = e.target.checked;
    render();
  });
}

// Fill the timezone dropdown with all available timezones
function populateTimezones() {
  const commonZones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Africa/Lagos', 'Africa/Johannesburg', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok',
    'Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
  ];
  let allZones = commonZones;
  // Try to get all supported timezones from the browser, fall back to common ones if not supported
  try { allZones = Intl.supportedValuesOf('timeZone'); } catch (e) {}

  personTimezoneSelect.innerHTML = allZones
    .map(tz => `<option value="${tz}">${tz.replace(/_/g, ' ')}</option>`)
    .join('');
  personTimezoneSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Load team state from URL if someone shared a link
function loadStateFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const stateQuery = urlParams.get('state');
  if (stateQuery) {
    try {
      const decoded = JSON.parse(atob(stateQuery));
      if (Array.isArray(decoded) && decoded.length > 0) {
        team = decoded;
        return;
      }
    } catch (e) {}
  }
  team = [...DEFAULT_TEAM];
}

// Save current team state to URL
function updateURLState() {
  try {
    const encoded = btoa(JSON.stringify(team));
    const newUrl = `${window.location.pathname}?state=${encoded}`;
    window.history.replaceState({}, '', newUrl);
  } catch(e) {}
}

// Fire it up
init();
