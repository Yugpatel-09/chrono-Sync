// State
let team = [];
let globalBaseTime = new Date();
globalBaseTime.setHours(0, 0, 0, 0);

const DEFAULT_TEAM = [
  { id: '1', name: 'You (Local)', tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  { id: '2', name: 'Tokyo Office', tz: 'Asia/Tokyo' },
  { id: '3', name: 'London Office', tz: 'Europe/London' }
];

let settings = {
  use24hr: false,
  enable3D: true,
  enableStars: true
};

// DOM Elements
const globalSlider = document.getElementById('global-slider');
const sliderFill = document.getElementById('slider-fill');
const globalTimeDisplay = document.getElementById('global-time-display');
const teamGrid = document.getElementById('team-grid');
const addModal = document.getElementById('add-modal');
const closeModalBtn = document.getElementById('close-modal');
const savePersonBtn = document.getElementById('save-person-btn');
const personNameInput = document.getElementById('person-name');
const personTimezoneSelect = document.getElementById('person-timezone');
const toast = document.getElementById('toast');
const resetBtn = document.querySelector('.reset-time-btn');

// View Elements
const navItems = document.querySelectorAll('.nav-item');
const viewSections = document.querySelectorAll('.view-section');
const teamTableBody = document.getElementById('team-table-body');
const starContainers = [document.getElementById('stars'), document.getElementById('stars2'), document.getElementById('stars3')];

// Settings Elements
const setting24hr = document.getElementById('setting-24hr');
const setting3d = document.getElementById('setting-3d');
const settingStars = document.getElementById('setting-stars');

// Initialize
function init() {
  populateTimezones();
  loadStateFromURL();
  generateStars();
  applySettings();
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  globalSlider.value = currentMinutes;

  render();
  setupEventListeners();
}

// Render Core
function render() {
  const selectedMinutes = parseInt(globalSlider.value, 10);
  
  // Update Slider Visual
  const percentage = (selectedMinutes / 1439) * 100;
  sliderFill.style.width = `${percentage}%`;

  const selectedTime = new Date(globalBaseTime.getTime() + selectedMinutes * 60000);
  globalTimeDisplay.textContent = formatTime(selectedTime, Intl.DateTimeFormat().resolvedOptions().timeZone).timeStr;

  // Render Dashboard Grid
  teamGrid.innerHTML = '';
  team.forEach((person, index) => {
    const card = createPersonCard(person, selectedTime);
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('animate-fade-in-up');
    teamGrid.appendChild(card);
    if (settings.enable3D) setupTiltEffect(card);
  });

  // Render Team Table
  teamTableBody.innerHTML = '';
  team.forEach((person) => {
    teamTableBody.appendChild(createTableRow(person));
  });

  updateURLState();
}

function createPersonCard(person, selectedTime) {
  const { timeStr, ampm, hour24, offsetStr } = formatTime(selectedTime, person.tz);
  
  const card = document.createElement('div');
  card.className = `person-card ${getStatusClass(hour24)}`;
  const tzName = person.tz.split('/').pop().replace(/_/g, ' ');

  card.innerHTML = `
    <div class="person-header">
      <div class="person-info">
        <h3>${person.name}</h3>
        <p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${tzName}
        </p>
      </div>
      <button class="delete-btn" onclick="removePerson('${person.id}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="person-time">
      <span class="person-time-value">${timeStr}</span>
      ${!settings.use24hr ? `<span class="person-time-ampm">${ampm}</span>` : ''}
      <span class="person-time-diff">${offsetStr}</span>
    </div>
  `;
  return card;
}

function createTableRow(person) {
  const row = document.createElement('tr');
  
  // Calculate offset relative to local
  const localFormatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'longOffset', timeZone: person.tz });
  const offsetFull = localFormatter.formatToParts(new Date()).find(p => p.type === 'timeZoneName')?.value || '';

  row.innerHTML = `
    <td>
      <div class="td-name">${person.name}</div>
    </td>
    <td>
      <div class="td-tz">${person.tz}</div>
    </td>
    <td>
      <span class="td-offset">${offsetFull}</span>
    </td>
    <td class="td-actions">
      <button class="btn delete-btn" onclick="removePerson('${person.id}')">Remove</button>
    </td>
  `;
  return row;
}

function formatTime(date, timeZone) {
  try {
    const options = { 
      timeZone, 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: !settings.use24hr 
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    
    let hour = parts.find(p => p.type === 'hour').value;
    let minute = parts.find(p => p.type === 'minute').value;
    let ampm = parts.find(p => p.type === 'dayPeriod')?.value || '';
    
    const options24 = { timeZone, hour: 'numeric', hour12: false };
    const hour24 = parseInt(new Intl.DateTimeFormat('en-US', options24).format(date), 10);

    const localFormatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'shortOffset', timeZone });
    const localParts = localFormatter.formatToParts(new Date());
    const offsetStr = localParts.find(p => p.type === 'timeZoneName')?.value || '';

    return { timeStr: `${hour}:${minute}`, ampm, hour24, offsetStr };
  } catch (e) {
    return { timeStr: '--:--', ampm: '', hour24: 12, offsetStr: '' };
  }
}

function getStatusClass(hour24) {
  if (hour24 >= 8 && hour24 < 18) return 'status-day';    
  if (hour24 >= 18 && hour24 < 23) return 'status-evening'; 
  return 'status-night';                                   
}

// Global Actions
window.removePerson = function(id) {
  team = team.filter(p => p.id !== id);
  render();
};

function setupEventListeners() {
  globalSlider.addEventListener('input', render);
  
  document.querySelectorAll('.open-add-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      addModal.classList.remove('hidden');
      personNameInput.focus();
    });
  });
  
  closeModalBtn.addEventListener('click', () => {
    addModal.classList.add('hidden');
  });
  
  savePersonBtn.addEventListener('click', () => {
    const name = personNameInput.value.trim() || 'Team Member';
    const tz = personTimezoneSelect.value;
    team.push({ id: Date.now().toString(), name, tz });
    personNameInput.value = '';
    addModal.classList.add('hidden');
    render();
  });

  if(resetBtn) {
    resetBtn.addEventListener('click', () => {
      const now = new Date();
      globalSlider.value = now.getHours() * 60 + now.getMinutes();
      render();
    });
  }

  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
      });
    });
  });

  // SPA Navigation
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      
      // Update Active Nav
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update Active View
      viewSections.forEach(v => {
        v.classList.remove('active');
        if (v.id === targetId) {
          v.classList.add('active');
        }
      });
    });
  });

  // Settings Toggles
  setting24hr.addEventListener('change', (e) => {
    settings.use24hr = e.target.checked;
    render();
  });
  setting3d.addEventListener('change', (e) => {
    settings.enable3D = e.target.checked;
    render();
  });
  settingStars.addEventListener('change', (e) => {
    settings.enableStars = e.target.checked;
    applySettings();
  });
}


// Visuals
function setupTiltEffect(element) {
  element.addEventListener('mousemove', (e) => {
    if (!settings.enable3D) return;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  
  element.addEventListener('mouseleave', () => {
    element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
}

function generateStars() {
  const createStars = (count) => {
    let value = `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    for(let i = 2; i <= count; i++) {
      value += `, ${Math.random() * 2000}px ${Math.random() * 2000}px #FFF`;
    }
    return value;
  };
  
  const style = document.createElement('style');
  style.id = 'star-styles';
  style.innerHTML = `
    #stars { width: 1px; height: 1px; background: transparent; box-shadow: ${createStars(700)}; animation: animStar 50s linear infinite; }
    #stars::after { content: " "; position: absolute; top: 2000px; width: 1px; height: 1px; background: transparent; box-shadow: ${createStars(700)}; }
    #stars2 { width: 2px; height: 2px; background: transparent; box-shadow: ${createStars(200)}; animation: animStar 100s linear infinite; }
    #stars3 { width: 3px; height: 3px; background: transparent; box-shadow: ${createStars(100)}; animation: animStar 150s linear infinite; }
  `;
  document.head.appendChild(style);
}

function applySettings() {
  if (settings.enableStars) {
    starContainers.forEach(c => c.style.display = 'block');
  } else {
    starContainers.forEach(c => c.style.display = 'none');
  }
}

// Helpers
function populateTimezones() {
  const commonZones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Toronto', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Africa/Lagos', 'Africa/Johannesburg', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok',
    'Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'
  ];
  
  let allZones = commonZones;
  try { allZones = Intl.supportedValuesOf('timeZone'); } catch (e) {}

  personTimezoneSelect.innerHTML = allZones
    .map(tz => `<option value="${tz}">${tz.replace(/_/g, ' ')}</option>`)
    .join('');
    
  personTimezoneSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
}

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

function updateURLState() {
  try {
    const encoded = btoa(JSON.stringify(team));
    const newUrl = `${window.location.pathname}?state=${encoded}`;
    window.history.replaceState({}, '', newUrl);
  } catch(e) {}
}

init();
