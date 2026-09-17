document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const header = document.getElementById('main-header');
  const screenSetup = document.getElementById('screen-setup');
  const screenMain = document.getElementById('screen-main');
  const shortLeaveInputArea = document.getElementById('short-leave-input-area');
  const resultArea = document.getElementById('result-area');
  const actionSection = document.querySelector('.action-section');
  
  const resetModal = document.getElementById('reset-modal');
  const btnShowReset = document.getElementById('btn-show-reset');
  const btnCancelReset = document.getElementById('btn-cancel-reset');
  const btnConfirmReset = document.getElementById('btn-confirm-reset');
  
  const segments = document.querySelectorAll('.segment');
  
  const devSelect = document.getElementById('dev-state-select');

  // Time Utilities
  function getFirstClockIn(str) {
    if (!str) return null;
    const regex = /\d{1,2}\s+[A-Za-z]{3}\s+(\d{1,2}:\d{2})\s+-/g;
    const m = regex.exec(str);
    if (!m) return null;
    return colonToMins(m[1]);
  }

  function calculateBreakTime(str) {
    if (!str) return "0:00";
    const regex = /(\d{1,2}\s+[A-Za-z]{3}\s+)(\d{1,2}:\d{2})\s+-\s+(\d{1,2}\s+[A-Za-z]{3}\s+\d{1,2}:\d{2}|\d{2}:\d{2})/g;
    const entries = [];
    let m;
    while ((m = regex.exec(str)) !== null) {
      entries.push({ inTime: m[2], outTime: m[3] });
    }
    if (entries.length < 2) return "0:00";
    let total = 0;
    for (let i = 0; i < entries.length - 1; i++) {
      const out = extractMins(entries[i].outTime);
      const next = colonToMins(entries[i + 1].inTime);
      if (out !== null && next !== null && next > out) {
        total += next - out;
      }
    }
    return formatMins(total);
  }

  function extractMins(s) {
    if (!s) return null;
    const m = s.match(/(\d{1,2}:\d{2})$/);
    return m ? colonToMins(m[1]) : null;
  }

  function colonToMins(t) {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return isNaN(h) || isNaN(m) ? null : h * 60 + m;
  }

  function parseHMToMins(hm) {
    if (!hm || hm === "-" || hm === "--") return 0;
    const [h, m] = hm.split(":").map(Number);
    return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
  }

  function formatMins(total) {
    if (total <= 0) return "0:00";
    const h = Math.floor(total / 60);
    const m = Math.round(total % 60);
    return `${h}:${String(m).padStart(2, "0")}`;
  }

  function minsToTimeStr(total) {
    const h = Math.floor(total / 60) % 24;
    const m = Math.round(total % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const FULL_REQUIRED = 8.5 * 60;
  const HALF_REQUIRED = 4.5 * 60;

  function getRequiredMins(activeSeg) {
    if (activeSeg === 'half-day') return HALF_REQUIRED;
    if (activeSeg === 'short-leave') {
      const h = parseInt(document.getElementById('sl-hours').value) || 0;
      const m = parseInt(document.getElementById('sl-mins').value) || 0;
      return Math.max(0, FULL_REQUIRED - (h * 60 + m));
    }
    return FULL_REQUIRED;
  }

  // Switcher Logic for Demo
  function setUIState(state) {
    // Reset everything
    header.style.display = 'none';
    screenSetup.style.display = 'none';
    screenMain.style.display = 'none';
    shortLeaveInputArea.style.display = 'none';
    resultArea.style.display = 'none';
    resultArea.innerHTML = '';
    actionSection.style.display = 'flex'; // changed to flex
    const emptyBox = document.getElementById('empty-state-box');
    if (emptyBox) emptyBox.style.display = 'flex';
    const fetchErrorBox = document.getElementById('fetch-error-box');
    if (fetchErrorBox) fetchErrorBox.style.display = 'none';
    const btnCalc = document.getElementById('btn-calculate');
    if (btnCalc) btnCalc.textContent = 'Calculate Leaving Time';
    
    // Update select if triggered programmatically
    if (devSelect) {
      devSelect.value = state;
    }

    switch(state) {
      case 'setup':
        screenSetup.style.display = 'flex';
        break;
      case 'default':
        header.style.display = 'flex';
        screenMain.style.display = 'flex';
        setActiveSegment('full-day');
        break;
      case 'full-day-result':
        header.style.display = 'flex';
        screenMain.style.display = 'flex';
        setActiveSegment('full-day');
        if (document.getElementById('empty-state-box')) document.getElementById('empty-state-box').style.display = 'none';
        if (btnCalc) btnCalc.textContent = 'Recalculate Leaving Time';
        resultArea.innerHTML = templates.fullDayResult;
        resultArea.style.display = 'block';
        animateProgress(72);
        break;
      case 'half-day-completed':
        header.style.display = 'flex';
        screenMain.style.display = 'flex';
        setActiveSegment('half-day');
        if (document.getElementById('empty-state-box')) document.getElementById('empty-state-box').style.display = 'none';
        if (btnCalc) btnCalc.textContent = 'Recalculate Leaving Time';
        resultArea.innerHTML = templates.halfDaySuccess;
        resultArea.style.display = 'block';
        fireConfetti();
        break;
      case 'short-leave-input':
        header.style.display = 'flex';
        screenMain.style.display = 'flex';
        setActiveSegment('short-leave');
        shortLeaveInputArea.style.display = 'block';
        break;
      case 'short-leave-result':
        header.style.display = 'flex';
        screenMain.style.display = 'flex';
        setActiveSegment('short-leave');
        shortLeaveInputArea.style.display = 'block';
        if (document.getElementById('empty-state-box')) document.getElementById('empty-state-box').style.display = 'none';
        if (btnCalc) btnCalc.textContent = 'Recalculate Leaving Time';
        resultArea.innerHTML = templates.shortLeaveResult;
        resultArea.style.display = 'block';
        animateProgress(82);
        break;
    }
  }

  function setActiveSegment(value) {
    segments.forEach(seg => {
      if(seg.dataset.value === value) {
        seg.classList.add('active');
      } else {
        seg.classList.remove('active');
      }
    });
  }

  function renderResultState(activeSeg, leaveAt, worked, remaining, breakTime, pct, requiredMins) {
    document.getElementById('empty-state-box').style.display = 'none';
    document.getElementById('fetch-error-box').style.display = 'none';
    
    if (pct >= 100) {
      // Completed!
      resultArea.innerHTML = `
        <div class="success-card">
          <h3 class="success-title">Your time is completed!</h3>
          <p class="success-desc">You're free to go — RUN!!</p>
          
          <div class="metrics-grid two-cols mt-4">
            <div class="metric">
              <span class="metric-label">Worked</span>
              <span class="metric-value">${worked}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Break</span>
              <span class="metric-value">${breakTime}</span>
            </div>
          </div>
        </div>
      `;
      resultArea.style.display = 'block';
      fireConfetti();
      return;
    }

    // Still working
    const h = activeSeg === 'short-leave' ? parseInt(document.getElementById('sl-hours').value) || 0 : 0;
    const m = activeSeg === 'short-leave' ? parseInt(document.getElementById('sl-mins').value) || 0 : 0;
    const badgeHTML = activeSeg === 'short-leave' 
      ? `<div class="deduction-badge" style="margin-bottom: 16px;">SHORT LEAVE · ${h}h ${m}m DEDUCTED</div>` 
      : (activeSeg === 'half-day' ? `<div class="deduction-badge" style="margin-bottom: 16px; background-color: var(--c-warning); color: #fff;">HALF DAY · 4h 30m REQUIRED</div>` : '');

    const breakMins = parseHMToMins(breakTime);
    const breakPct = Math.min(100, (breakMins / 60) * 100);

    resultArea.innerHTML = `
      <div class="result-card" style="padding-top: 48px; position: relative;">
        <div class="arc-top-stat" style="left: 20px; text-align: start;">
          <div class="arc-stat-val">${worked.replace(':', 'h ')}m</div>
          <div class="arc-stat-label">Worked</div>
        </div>
        <div class="arc-top-stat" style="right: 20px; text-align: right;">
          <div class="arc-stat-val">${remaining.replace(':', 'h ')}m</div>
          <div class="arc-stat-label">Left</div>
        </div>

        <div class="arc-progress-wrapper">
          <svg viewBox="0 0 100 55" class="arc-svg">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--c-border)" stroke-width="8" stroke-linecap="round"/>
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#arcGradientDynamic)" stroke-width="8" stroke-linecap="round" stroke-dasharray="125.6" stroke-dashoffset="125.6" id="anim-progress-arc-dynamic"/>
            <defs>
              <linearGradient id="arcGradientDynamic" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--c-arc-1)" />
                <stop offset="50%" stop-color="var(--c-arc-2)" />
                <stop offset="100%" stop-color="var(--c-arc-3)" />
              </linearGradient>
            </defs>
          </svg>
          <div class="arc-text-center">
            <div class="result-time">${leaveAt}</div>
            <div class="result-label" style="margin-bottom: 0;">LEAVING TIME</div>
          </div>
        </div>
        
        ${badgeHTML}
        
        <div class="metrics-cards-single">
          <div class="metric-card-new">
            <div class="mc-header">
              <span class="mc-icon">☕</span> <span class="mc-title">Break Time</span>
            </div>
            <div class="mc-body">
              <div class="mc-data">
                <div class="mc-value" style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="font-size: 20px; color: var(--c-text-main);">${breakMins}m</span>
                  <span style="font-size: 13px; font-weight: 500; color: var(--c-text-secondary);">/ 60m</span>
                </div>
              </div>
              <div class="mc-ring">
                <svg viewBox="0 0 36 36" class="circular-chart-small">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle" stroke="var(--c-arc-3)" stroke-dasharray="0, 100" data-target="${breakPct}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" id="anim-ring-break-dynamic" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    resultArea.style.display = 'block';
    
    // Animate
    setTimeout(() => {
      const total = 125.6;
      const offset = total - (total * (pct / 100));
      const arcDynamic = document.getElementById('anim-progress-arc-dynamic');
      if (arcDynamic) arcDynamic.style.strokeDashoffset = offset;
      
      const breakRing = document.getElementById('anim-ring-break-dynamic');
      if (breakRing) {
        breakRing.setAttribute('stroke-dasharray', breakPct + ', 100');
      }
    }, 50);
  }

  function fireConfetti() {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#1E293B', '#FDE68A']; // Bean colors
    const successCard = document.querySelector('.success-card');
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti-piece');
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
      confetti.style.animationDelay = (Math.random() * 0.5) + 's';
      if (successCard) {
        successCard.appendChild(confetti);
      }

      // Clean up DOM after animation
      setTimeout(() => {
        if (confetti && confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 4000);
    }
  }

  // Event Listeners
  if (devSelect) {
    devSelect.addEventListener('change', (e) => {
      setUIState(e.target.value);
    });
  }

  // Clear errors on input
  document.querySelectorAll('.input-field, .time-input').forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.classList.remove('input-error');
    });
  });

  segments.forEach(seg => {
    seg.addEventListener('click', (e) => {
      const val = e.target.dataset.value;
      setActiveSegment(val);
      
      if (val === 'short-leave') {
        shortLeaveInputArea.style.display = 'block';
      } else {
        shortLeaveInputArea.style.display = 'none';
      }
      
      resultArea.style.display = 'none';
      const emptyBox = document.getElementById('empty-state-box');
      if (emptyBox) emptyBox.style.display = 'flex';
      const fetchErrorBox = document.getElementById('fetch-error-box');
      if (fetchErrorBox) fetchErrorBox.style.display = 'none';
    });
  });

  // Date Picker Logic
  let selectedDate = new Date();
  selectedDate.setHours(0, 0, 0, 0);
  
  const datePickerScroll = document.querySelector('.date-picker-scroll');

  function renderDatePills(centerDate) {
    if (!datePickerScroll) return;
    datePickerScroll.innerHTML = '';
    
    // Generate 5 days (2 days before, 1 today, 2 days after)
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (let i = -2; i <= 2; i++) {
      const d = new Date(centerDate);
      d.setDate(d.getDate() + i);
      
      const isSelected = d.getTime() === selectedDate.getTime();
      const isToday = d.toDateString() === new Date().toDateString();
      
      const btn = document.createElement('button');
      btn.className = 'date-pill' + (isSelected ? ' active' : '') + (isToday ? ' today' : '');
      btn.innerHTML = `
        <span class="date-day">${days[d.getDay()]}</span>
        <span class="date-num">${d.getDate()}</span>
      `;
      
      btn.addEventListener('click', () => {
        selectedDate = new Date(d);
        renderDatePills(selectedDate);
        // Automatically hide result area when date changes
        resultArea.style.display = 'none';
        document.getElementById('empty-state-box').style.display = 'flex';
        document.getElementById('fetch-error-box').style.display = 'none';
      });
      
      datePickerScroll.appendChild(btn);
    }
  }

  // Custom Calendar Popup Logic
  const btnOpenCalendar = document.getElementById('btn-open-calendar');
  const calendarPopup = document.getElementById('custom-calendar-popup');
  const calMonthYear = document.getElementById('cal-month-year');
  const calGrid = document.querySelector('.calendar-grid');
  
  let currentCalMonth = selectedDate.getMonth();
  let currentCalYear = selectedDate.getFullYear();

  function renderCalendar(month, year) {
    if (!calGrid) return;
    
    // Clear old dates (keep the day names)
    const dayNames = Array.from(calGrid.querySelectorAll('.cal-day-name'));
    calGrid.innerHTML = '';
    dayNames.forEach(n => calGrid.appendChild(n));

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (calMonthYear) {
      calMonthYear.textContent = `${monthNames[month]} ${year}`;
    }

    // Empty spots
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-date empty';
      calGrid.appendChild(empty);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'cal-date';
      dayEl.textContent = i;
      
      if (year === new Date().getFullYear() && month === new Date().getMonth() && i === new Date().getDate()) {
        dayEl.classList.add('today');
      }
      if (year === selectedDate.getFullYear() && month === selectedDate.getMonth() && i === selectedDate.getDate()) {
        dayEl.classList.add('active');
      }

      dayEl.addEventListener('click', (e) => {
        e.stopPropagation();
        selectedDate = new Date(year, month, i);
        selectedDate.setHours(0, 0, 0, 0);
        renderDatePills(selectedDate);
        resultArea.style.display = 'none';
        document.getElementById('empty-state-box').style.display = 'flex';
        document.getElementById('fetch-error-box').style.display = 'none';
        calendarPopup.style.display = 'none';
      });
      calGrid.appendChild(dayEl);
    }
  }

  if (btnOpenCalendar && calendarPopup) {
    btnOpenCalendar.addEventListener('click', (e) => {
      e.stopPropagation();
      const isShowing = calendarPopup.style.display === 'block';
      if (!isShowing) {
        currentCalMonth = selectedDate.getMonth();
        currentCalYear = selectedDate.getFullYear();
        renderCalendar(currentCalMonth, currentCalYear);
        calendarPopup.style.display = 'block';
      } else {
        calendarPopup.style.display = 'none';
      }
    });

    document.getElementById('cal-prev-month').addEventListener('click', (e) => {
      e.stopPropagation();
      currentCalMonth--;
      if (currentCalMonth < 0) { currentCalMonth = 11; currentCalYear--; }
      renderCalendar(currentCalMonth, currentCalYear);
    });

    document.getElementById('cal-next-month').addEventListener('click', (e) => {
      e.stopPropagation();
      currentCalMonth++;
      if (currentCalMonth > 11) { currentCalMonth = 0; currentCalYear++; }
      renderCalendar(currentCalMonth, currentCalYear);
    });

    document.addEventListener('click', (e) => {
      if (!calendarPopup.contains(e.target) && !btnOpenCalendar.contains(e.target)) {
        calendarPopup.style.display = 'none';
      }
    });
  }

  // Initial render of date pills
  renderDatePills(selectedDate);

  // Setup Save Form
  document.getElementById('setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('setup-error');
    const inputs = form.querySelectorAll('.input-field');
    
    // Clear old errors
    inputs.forEach(input => input.classList.remove('input-error'));
    
    if (!form.checkValidity()) {
      errorEl.style.display = 'block';
      inputs.forEach(input => {
        if (!input.validity.valid) {
          input.classList.add('input-error');
        }
      });
      return;
    }
    errorEl.style.display = 'none';

    // Save to localStorage
    const id = document.getElementById('emp-id').value.trim();
    const name = document.getElementById('emp-name').value.trim();
    const code = document.getElementById('emp-code').value.trim();
    
    localStorage.setItem('outly_employeeData', JSON.stringify({ id, name, code }));
    checkEmployeeData();
  });

  // Calculate Button
  document.getElementById('btn-calculate').addEventListener('click', () => {
    const activeSeg = document.querySelector('.segment.active').dataset.value;
    
    // Short leave validation
    if (activeSeg === 'short-leave') {
      const slHours = parseInt(document.getElementById('sl-hours').value) || 0;
      const slMins = parseInt(document.getElementById('sl-mins').value) || 0;
      const slError = document.getElementById('sl-error');
      
      document.getElementById('sl-hours').classList.remove('input-error');
      document.getElementById('sl-mins').classList.remove('input-error');
      
      if (slHours === 0 && slMins === 0) {
        slError.style.display = 'block';
        document.getElementById('sl-hours').classList.add('input-error');
        document.getElementById('sl-mins').classList.add('input-error');
        return;
      }
      slError.style.display = 'none';
    }

    const empStr = localStorage.getItem('outly_employeeData');
    if (!empStr) {
      setUIState('setup');
      return;
    }
    const emp = JSON.parse(empStr);

    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const yyyy = selectedDate.getFullYear();
    const formatted = `${dd}/${mm}/${yyyy}`;

    const payload = {
      pEmployeeID: emp.id,
      pMonth: String(selectedDate.getMonth() + 1),
      pFromDate: formatted,
      pToDate: formatted,
      pViewType: "1",
      pDate: "",
      pCompanyID: "2",
      pZoneID: "0",
      pBranchID: "2",
      pDepartmentID: "3",
      pEmpGroupID: "0",
      pDesignationID: "0",
      pDivisionID: "0",
      pJobRoleID: "0",
      pEmploymentType: "0",
      pJobType: "0",
      pEmployeeName: emp.name,
      pEmployeeCode: emp.code,
    };

    const btnCalc = document.getElementById('btn-calculate');
    btnCalc.textContent = 'Calculating...';
    btnCalc.disabled = true;
    
    document.getElementById('empty-state-box').style.display = 'none';
    document.getElementById('fetch-error-box').style.display = 'none';

    fetch("https://office.wedowebapps.in/ess/Emp/Timesheet.aspx/ws_GetData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest"
      },
      body: JSON.stringify(payload),
    })
    .then((r) => r.json())
    .then((data) => {
      btnCalc.textContent = 'Recalculate Leaving Time';
      btnCalc.disabled = false;
      
      const entry = data?.d?.listTimesheet?.[0];
      const REQUIRED = getRequiredMins(activeSeg);
      
      if (!entry) {
        renderResultState(activeSeg, "N/A", "0:00", formatMins(REQUIRED), "0:00", 0, REQUIRED);
        return;
      }
      
      const selDay = new Date(selectedDate);
      const todayDay = new Date();
      todayDay.setHours(0, 0, 0, 0);
      selDay.setHours(0, 0, 0, 0);
      
      const isToday = selDay.getTime() === todayDay.getTime();
      const isPastDate = selDay < todayDay;
      
      const breakStr = calculateBreakTime(entry.TimeEntry);
      const breakMins = parseHMToMins(breakStr);
      
      if (isToday) {
        const firstIn = getFirstClockIn(entry.TimeEntry);
        const now = new Date();
        const nowMins = now.getHours() * 60 + now.getMinutes();

        let workedMins = 0;
        if (firstIn !== null) {
          workedMins = Math.max(0, nowMins - firstIn - breakMins);
        }

        const remainMins = Math.max(0, REQUIRED - workedMins);
        const leaveAtMins = nowMins + remainMins;
        
        renderResultState(activeSeg, minsToTimeStr(leaveAtMins), formatMins(workedMins), formatMins(remainMins), breakStr, Math.min(100, (workedMins / REQUIRED) * 100), REQUIRED);
      } else if (isPastDate) {
        const workedStr = entry.TotalTimeHM || "0:00";
        const workedMins = parseHMToMins(workedStr);
        renderResultState(activeSeg, "-", workedStr, "-", breakStr, Math.min(100, (workedMins / REQUIRED) * 100), REQUIRED);
      } else {
        renderResultState(activeSeg, "N/A", "0:00", formatMins(REQUIRED), "0:00", 0, REQUIRED);
      }
    })
    .catch((err) => {
      console.error(err);
      btnCalc.textContent = 'Calculate Leaving Time';
      btnCalc.disabled = false;
      document.getElementById('empty-state-box').style.display = 'none';
      document.getElementById('fetch-error-box').style.display = 'flex';
    });
  });

  // Reset Modal
  btnShowReset.addEventListener('click', () => {
    resetModal.style.display = 'flex';
  });

  btnCancelReset.addEventListener('click', () => {
    resetModal.style.display = 'none';
  });

  btnConfirmReset.addEventListener('click', () => {
    resetModal.style.display = 'none';
    localStorage.removeItem('outly_employeeData');
    checkEmployeeData();
  });
  
  // Close modal on click outside
  resetModal.addEventListener('click', (e) => {
    if(e.target === resetModal) {
      resetModal.style.display = 'none';
    }
  });

  // Profile Dropdown Toggle
  const btnProfileTrigger = document.getElementById('btn-profile-trigger');
  const profileDropdown = document.getElementById('profile-dropdown');
  
  if (btnProfileTrigger && profileDropdown) {
    btnProfileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('show');
      }
    });

    profileDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
      });
    });
  }

  // Theme Toggle
  const btnThemeToggle = document.getElementById('btn-theme-toggle');
  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const currentTheme = root.getAttribute('data-theme');
      
      if (currentTheme === 'dark') {
        root.setAttribute('data-theme', 'light');
      } else if (currentTheme === 'light') {
        root.setAttribute('data-theme', 'dark');
      } else {
        // If unset, detect system preference and toggle to the opposite
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', prefersDark ? 'light' : 'dark');
      }
    });
  }

  // Set default theme to light
  document.documentElement.setAttribute('data-theme', 'light');

  // Local Storage Management
  function checkEmployeeData() {
    const empStr = localStorage.getItem('outly_employeeData');
    if (empStr) {
      const emp = JSON.parse(empStr);
      // Update header
      const profileName = document.querySelector('.profile-name');
      const profileAvatar = document.querySelector('.profile-avatar');
      const displayEmpName = document.getElementById('display-emp-name');
      const displayEmpCode = document.getElementById('display-emp-code');
      
      if (profileName) profileName.textContent = emp.name;
      if (profileAvatar) profileAvatar.textContent = emp.name.charAt(0).toUpperCase();
      if (displayEmpName) displayEmpName.textContent = emp.name;
      if (displayEmpCode) displayEmpCode.textContent = emp.code;

      setUIState('default');
    } else {
      setUIState('setup');
    }
  }

  // Initialize
  checkEmployeeData();
});
