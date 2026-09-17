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

  // Result Templates
  const templates = {
    fullDayResult: `
      <div class="result-card" style="padding-top: 48px; position: relative;">
        <!-- Topside Stats -->
        <div class="arc-top-stat" style="left: 20px; text-align: start;">
          <div class="arc-stat-val">6h 08m</div>
          <div class="arc-stat-label">Worked</div>
        </div>
        <div class="arc-top-stat" style="right: 20px; text-align: right;">
          <div class="arc-stat-val">2h 22m</div>
          <div class="arc-stat-label">Left</div>
        </div>

        <div class="arc-progress-wrapper">
          <svg viewBox="0 0 100 55" class="arc-svg">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--c-border)" stroke-width="8" stroke-linecap="round"/>
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#arcGradient)" stroke-width="8" stroke-linecap="round" stroke-dasharray="125.6" stroke-dashoffset="125.6" id="anim-progress-arc-full"/>
            <defs>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--c-arc-1)" />
                <stop offset="50%" stop-color="var(--c-arc-2)" />
                <stop offset="100%" stop-color="var(--c-arc-3)" />
              </linearGradient>
            </defs>
          </svg>
          <div class="arc-text-center">
            <div class="result-time">19:37</div>
            <div class="result-label" style="margin-bottom: 0;">LEAVING TIME</div>
          </div>
        </div>
        
        <!-- Bottom Metric Card -->
        <div class="metrics-cards-single">
          <div class="metric-card-new">
            <div class="mc-header">
              <span class="mc-icon">☕</span> <span class="mc-title">Break Time</span>
            </div>
            <div class="mc-body">
              <div class="mc-data">
                <div class="mc-value" style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="font-size: 20px; color: var(--c-text-main);">49m</span>
                  <span style="font-size: 13px; font-weight: 500; color: var(--c-text-secondary);">/ 60m</span>
                </div>
              </div>
              <div class="mc-ring">
                <svg viewBox="0 0 36 36" class="circular-chart-small">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle" stroke="var(--c-arc-3)" stroke-dasharray="0, 100" data-target="81" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" id="anim-ring-break" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    shortLeaveResult: `
      <div class="result-card" style="padding-top: 48px; position: relative;">
        <!-- Topside Stats -->
        <div class="arc-top-stat" style="left: 20px;">
          <div class="arc-stat-val">6h 09m</div>
          <div class="arc-stat-label">Worked</div>
        </div>
        <div class="arc-top-stat" style="right: 20px; text-align: right;">
          <div class="arc-stat-val">1h 21m</div>
          <div class="arc-stat-label">Left</div>
        </div>

        <div class="arc-progress-wrapper">
          <svg viewBox="0 0 100 55" class="arc-svg">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="var(--c-border)" stroke-width="8" stroke-linecap="round"/>
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#arcGradientSL)" stroke-width="8" stroke-linecap="round" stroke-dasharray="125.6" stroke-dashoffset="125.6" id="anim-progress-arc-sl"/>
            <defs>
              <linearGradient id="arcGradientSL" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="var(--c-arc-1)" />
                <stop offset="50%" stop-color="var(--c-arc-2)" />
                <stop offset="100%" stop-color="var(--c-arc-3)" />
              </linearGradient>
            </defs>
          </svg>
          <div class="arc-text-center">
            <div class="result-time">18:37</div>
            <div class="result-label" style="margin-bottom: 0;">LEAVING TIME</div>
          </div>
        </div>
        
        <div class="deduction-badge" style="margin-bottom: 16px;">
          SHORT LEAVE · 1H 0M DEDUCTED
        </div>
        
        <!-- Bottom Metric Card -->
        <div class="metrics-cards-single">
          <div class="metric-card-new">
            <div class="mc-header">
              <span class="mc-icon">☕</span> <span class="mc-title">Break Time</span>
            </div>
            <div class="mc-body">
              <div class="mc-data">
                <div class="mc-value" style="display: flex; align-items: baseline; gap: 4px;">
                  <span style="font-size: 20px; color: var(--c-text-main);">49m</span>
                  <span style="font-size: 13px; font-weight: 500; color: var(--c-text-secondary);">/ 60m</span>
                </div>
              </div>
              <div class="mc-ring">
                <svg viewBox="0 0 36 36" class="circular-chart-small">
                  <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path class="circle" stroke="var(--c-arc-3)" stroke-dasharray="0, 100" data-target="81" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" id="anim-sl-ring-break" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    halfDaySuccess: `
      <div class="success-card">
        <h3 class="success-title">Your time is completed!</h3>
        <p class="success-desc">You're free to go — RUN!!</p>
        
        <div class="metrics-grid two-cols mt-4">
          <div class="metric">
            <span class="metric-label">Worked</span>
            <span class="metric-value">6:08</span>
          </div>
          <div class="metric">
            <span class="metric-label">Break</span>
            <span class="metric-value">0:49</span>
          </div>
        </div>
      </div>
    `
  };

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

  function animateProgress(targetWidth) {
    // Slight delay to allow DOM to render before animating width
    setTimeout(() => {
      // Backwards compatibility for old bar if used
      const pbar = document.getElementById('anim-progress');
      if (pbar) {
        pbar.style.width = targetWidth + '%';
      }
      
      // Arc animations
      const total = 125.6;
      const offset = total - (total * (targetWidth / 100));
      
      const arcFull = document.getElementById('anim-progress-arc-full');
      if (arcFull) {
        arcFull.style.strokeDashoffset = offset;
      }
      
      const arcSL = document.getElementById('anim-progress-arc-sl');
      if (arcSL) {
        arcSL.style.strokeDashoffset = offset;
      }
      
      // Animate rings
      ['break'].forEach(type => {
        const ring = document.getElementById('anim-ring-' + type);
        if (ring) {
          const target = ring.getAttribute('data-target');
          ring.setAttribute('stroke-dasharray', target + ', 100');
        }
        const slRing = document.getElementById('anim-sl-ring-' + type);
        if (slRing) {
          const target = slRing.getAttribute('data-target');
          slRing.setAttribute('stroke-dasharray', target + ', 100');
        }
      });
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

  segments.forEach(seg => {
    seg.addEventListener('click', (e) => {
      const val = e.target.dataset.value;
      setActiveSegment(val);
      
      // Update UI for demo based on click
      if(val === 'short-leave') {
        setUIState('short-leave-input');
      } else if (val === 'half-day') {
        setUIState('half-day-completed');
      } else {
        setUIState('default');
      }
    });
  });

  // Setup Save Button
  document.getElementById('btn-save-setup').addEventListener('click', () => {
    setUIState('default');
  });

  // Calculate Button
  document.getElementById('btn-calculate').addEventListener('click', () => {
    const activeSeg = document.querySelector('.segment.active').dataset.value;
    if(activeSeg === 'full-day') {
      setUIState('full-day-result');
    } else if(activeSeg === 'short-leave') {
      setUIState('short-leave-result');
    }
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
    setUIState('setup');
  });
  
  // Close modal on click outside
  resetModal.addEventListener('click', (e) => {
    if(e.target === resetModal) {
      resetModal.style.display = 'none';
    }
  });

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

  // Initialize
  setUIState('setup');
});
