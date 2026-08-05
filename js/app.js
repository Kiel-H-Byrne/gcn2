(function () {
  'use strict';

  var CATEGORY_ORDER = ['Drivers', 'Woods', 'LongIrons', 'ShortIrons', 'Wedges', 'RoughIrons', 'SandWedges'];
  var CATEGORY_LABELS = {
    Drivers: 'Drivers',
    Woods: 'Woods',
    LongIrons: 'Long Irons',
    ShortIrons: 'Short Irons',
    Wedges: 'Wedges',
    RoughIrons: 'Rough Irons',
    SandWedges: 'Sand Wedges',
  };
  var CATEGORY_SLOT = { Drivers: 1, Woods: 2, LongIrons: 3, ShortIrons: 4, Wedges: 5, RoughIrons: 6, SandWedges: 7 };
  var TYPE_SUGGESTIONS = ['Beginner', 'Common', 'Rare', 'Epic', 'Legendary', 'Master', 'Golden', 'Signature'];

  function accentVar(category) {
    return 'var(--series-' + (CATEGORY_SLOT[category] || 1) + ')';
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function generateId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'custom-' + Math.random().toString(36).slice(2) + '-' + Math.random().toString(36).slice(2);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------

  var STORAGE_KEYS = {
    customClubs: 'gcwind.customClubs',
    deletedSeedIds: 'gcwind.deletedSeedIds',
    bag: 'gcwind.bag',
    settings: 'gcwind.settings',
    lastLevel: 'gcwind.lastLevel',
  };

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage unavailable/full -- app still works in-memory for this session */
    }
  }

  // ---------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------

  var state = {
    customClubs: readJSON(STORAGE_KEYS.customClubs, {}),
    deletedSeedIds: readJSON(STORAGE_KEYS.deletedSeedIds, []),
    bag: readJSON(STORAGE_KEYS.bag, []),
    settings: Object.assign(
      { title: '', variant: 'ring', modeIndex: 0, windStep: 0.5 },
      readJSON(STORAGE_KEYS.settings, {})
    ),
    lastLevel: readJSON(STORAGE_KEYS.lastLevel, null),
    activeCategory: 'Drivers',
    editingClubId: null, // id currently open in the editor form ('' = new club)
  };

  var clubsCache = null;

  function invalidateClubsCache() {
    clubsCache = null;
  }

  function getClubs() {
    if (clubsCache) return clubsCache;
    var seed = (window.GC_CLUBS || []).filter(function (c) {
      return state.deletedSeedIds.indexOf(c.id) === -1;
    });
    var seedIds = {};
    var merged = seed.map(function (c) {
      seedIds[c.id] = true;
      return state.customClubs[c.id] || c;
    });
    Object.keys(state.customClubs).forEach(function (id) {
      if (!seedIds[id]) merged.push(state.customClubs[id]);
    });
    merged.sort(function (a, b) {
      return CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.tour - b.tour;
    });
    clubsCache = merged;
    return merged;
  }

  function getClubById(id) {
    return getClubs().filter(function (c) {
      return c.id === id;
    })[0];
  }

  function isSeedClub(id) {
    return (window.GC_CLUBS || []).some(function (c) {
      return c.id === id;
    });
  }

  function saveBag() {
    writeJSON(STORAGE_KEYS.bag, state.bag);
  }
  function saveSettings() {
    writeJSON(STORAGE_KEYS.settings, state.settings);
  }
  function saveLastLevel() {
    writeJSON(STORAGE_KEYS.lastLevel, state.lastLevel);
  }
  function saveClubOverrides() {
    writeJSON(STORAGE_KEYS.customClubs, state.customClubs);
    writeJSON(STORAGE_KEYS.deletedSeedIds, state.deletedSeedIds);
  }

  // ---------------------------------------------------------------------
  // Bag mutations
  // ---------------------------------------------------------------------

  function addToBag(club) {
    if (state.bag.some(function (b) { return b.clubId === club.id; })) return;
    var suggested = state.lastLevel ? clamp(state.lastLevel, 1, club.maxLevel) : club.maxLevel;
    state.bag.push({ clubId: club.id, level: suggested });
    state.lastLevel = suggested;
    saveBag();
    saveLastLevel();
    requestRender();
  }

  function removeFromBag(clubId) {
    state.bag = state.bag.filter(function (b) {
      return b.clubId !== clubId;
    });
    saveBag();
    requestRender();
  }

  function setBagLevel(clubId, level, opts) {
    var entry = state.bag.filter(function (b) { return b.clubId === clubId; })[0];
    if (!entry) return;
    entry.level = level;
    state.lastLevel = level;
    updateLevelVisual(clubId, level);
    if (!opts || opts.commit) {
      saveBag();
      saveLastLevel();
      requestRender();
    }
  }

  function clearBag() {
    if (state.bag.length && !confirm('Clear all clubs from your bag?')) return;
    state.bag = [];
    saveBag();
    requestRender();
  }

  // ---------------------------------------------------------------------
  // Render scheduling
  // ---------------------------------------------------------------------

  var renderScheduled = false;
  function requestRender() {
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(function () {
      renderScheduled = false;
      render();
    });
  }

  function updateLevelVisual(clubId, level) {
    document.querySelectorAll('[data-club-id="' + clubId + '"] [data-role="level-text"]').forEach(function (el) {
      el.textContent = 'Lv ' + level;
    });
    document.querySelectorAll('[data-club-id="' + clubId + '"] .lvl-pill').forEach(function (pill) {
      pill.classList.toggle('is-active', Number(pill.dataset.level) === level);
    });
  }

  // ---------------------------------------------------------------------
  // Level picker (shared component: club grid cards + bag chips)
  // ---------------------------------------------------------------------

  function buildLevelPicker(club, level, source) {
    var wrap = document.createElement('div');
    wrap.className = 'level-picker';
    wrap.style.setProperty('--pill-accent', accentVar(club.category));

    var dec = document.createElement('button');
    dec.type = 'button';
    dec.className = 'lvl-step';
    dec.setAttribute('aria-label', 'Decrease level');
    dec.innerHTML = '<svg width="11" height="11"><use href="#icon-minus"/></svg>';
    dec.addEventListener('click', function (e) {
      e.stopPropagation();
      setBagLevel(club.id, clamp(level - 1, 1, club.maxLevel), { commit: true });
    });

    var inc = document.createElement('button');
    inc.type = 'button';
    inc.className = 'lvl-step';
    inc.setAttribute('aria-label', 'Increase level');
    inc.innerHTML = '<svg width="11" height="11"><use href="#icon-plus"/></svg>';
    inc.addEventListener('click', function (e) {
      e.stopPropagation();
      setBagLevel(club.id, clamp(level + 1, 1, club.maxLevel), { commit: true });
    });

    var track = document.createElement('div');
    track.className = 'lvl-track';
    track.dataset.levelTrack = '1';
    track.dataset.clubId = club.id;
    track.dataset.source = source;
    track.tabIndex = 0;
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-valuemin', '1');
    track.setAttribute('aria-valuemax', String(club.maxLevel));
    track.setAttribute('aria-valuenow', String(level));
    track.setAttribute('aria-label', club.name + ' level');

    for (var lvl = 1; lvl <= club.maxLevel; lvl++) {
      var pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'lvl-pill' + (lvl === level ? ' is-active' : '');
      pill.dataset.level = String(lvl);
      pill.textContent = String(lvl);
      pill.tabIndex = -1;
      track.appendChild(pill);
    }

    function levelFromClientX(clientX) {
      var rect = track.getBoundingClientRect();
      if (rect.width === 0) return level;
      var ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      return clamp(Math.round(ratio * (club.maxLevel - 1)) + 1, 1, club.maxLevel);
    }

    var dragging = false;

    function onMove(e) {
      var newLevel = levelFromClientX(e.clientX);
      setBagLevel(club.id, newLevel, { commit: false });
      track.setAttribute('aria-valuenow', String(newLevel));
    }

    function onUp(e) {
      dragging = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      var newLevel = levelFromClientX(e.clientX);
      setBagLevel(club.id, newLevel, { commit: true });
    }

    track.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      dragging = true;
      var newLevel = levelFromClientX(e.clientX);
      setBagLevel(club.id, newLevel, { commit: false });
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        setBagLevel(club.id, clamp(level + 1, 1, club.maxLevel), { commit: true });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        setBagLevel(club.id, clamp(level - 1, 1, club.maxLevel), { commit: true });
      }
    });

    wrap.appendChild(dec);
    wrap.appendChild(track);
    wrap.appendChild(inc);
    return wrap;
  }

  // ---------------------------------------------------------------------
  // Category tabs
  // ---------------------------------------------------------------------

  function renderTabs() {
    var el = document.getElementById('category-tabs');
    el.innerHTML = '';
    var clubs = getClubs();
    CATEGORY_ORDER.forEach(function (cat) {
      var count = clubs.filter(function (c) { return c.category === cat; }).length;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab-btn' + (state.activeCategory === cat ? ' is-active' : '');
      btn.style.setProperty('--tab-accent', accentVar(cat));
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(state.activeCategory === cat));
      btn.innerHTML =
        '<svg width="15" height="15"><use href="#icon-' + cat + '"/></svg>' +
        '<span>' + CATEGORY_LABELS[cat] + '</span>';
      btn.addEventListener('click', function () {
        state.activeCategory = cat;
        requestRender();
      });
      el.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------
  // Club grid
  // ---------------------------------------------------------------------

  function renderGrid() {
    var el = document.getElementById('club-grid');
    el.innerHTML = '';
    var clubs = getClubs().filter(function (c) {
      return c.category === state.activeCategory;
    });

    if (!clubs.length) {
      var empty = document.createElement('p');
      empty.className = 'bag-empty-hint';
      empty.textContent = 'No clubs in this category yet -- use "Manage Clubs" to add one.';
      el.appendChild(empty);
      return;
    }

    clubs.forEach(function (club) {
      var bagEntry = state.bag.filter(function (b) { return b.clubId === club.id; })[0];
      var card = document.createElement('div');
      card.className = 'club-card' + (bagEntry ? ' is-selected' : '');
      card.style.setProperty('--card-accent', accentVar(club.category));
      card.dataset.clubId = club.id;
      card.setAttribute('role', 'listitem');

      var top = document.createElement('div');
      top.className = 'club-card-top';
      top.innerHTML = '<svg class="club-card-icon" width="22" height="22"><use href="#icon-' + club.category + '"/></svg>';

      if (bagEntry) {
        var badge = document.createElement('span');
        badge.className = 'club-card-level-badge';
        badge.dataset.role = 'level-text';
        badge.textContent = 'Lv ' + bagEntry.level;
        top.appendChild(badge);
      }
      card.appendChild(top);

      var name = document.createElement('div');
      name.className = 'club-card-name';
      name.textContent = club.name;
      card.appendChild(name);

      var meta = document.createElement('div');
      meta.className = 'club-card-meta';
      meta.innerHTML = '<span>' + escapeHtml(club.type || '') + '</span><span>Tour ' + club.tour + '</span>';
      card.appendChild(meta);

      if (bagEntry) {
        card.appendChild(buildLevelPicker(club, bagEntry.level, 'grid'));
      }

      card.addEventListener('click', function (e) {
        if (e.target.closest('.level-picker')) return;
        if (!bagEntry) addToBag(club);
      });

      el.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------
  // Bag panel
  // ---------------------------------------------------------------------

  function renderBag() {
    var listEl = document.getElementById('bag-list');
    var hintEl = document.getElementById('bag-empty-hint');
    var countEl = document.getElementById('bag-count');
    listEl.innerHTML = '';
    countEl.textContent = String(state.bag.length);
    hintEl.hidden = state.bag.length > 0;

    state.bag.forEach(function (entry) {
      var club = getClubById(entry.clubId);
      if (!club) return;

      var chip = document.createElement('div');
      chip.className = 'bag-chip';
      chip.style.setProperty('--card-accent', accentVar(club.category));
      chip.dataset.clubId = club.id;

      var top = document.createElement('div');
      top.className = 'bag-chip-top';
      top.innerHTML =
        '<svg class="bag-chip-icon" width="18" height="18"><use href="#icon-' + club.category + '"/></svg>' +
        '<span class="bag-chip-name">' + escapeHtml(club.name) + '</span>' +
        '<span class="club-card-level-badge" data-role="level-text" style="background:' +
        accentVar(club.category) +
        '">Lv ' + entry.level + '</span>';

      var removeBtn = document.createElement('button');
      removeBtn.className = 'bag-chip-remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', 'Remove ' + club.name);
      removeBtn.innerHTML = '<svg width="14" height="14"><use href="#icon-close"/></svg>';
      removeBtn.addEventListener('click', function () {
        removeFromBag(club.id);
      });
      top.appendChild(removeBtn);

      chip.appendChild(top);
      chip.appendChild(buildLevelPicker(club, entry.level, 'bag'));
      listEl.appendChild(chip);
    });
  }

  // ---------------------------------------------------------------------
  // Chart controls + output
  // ---------------------------------------------------------------------

  function populateModeSelect() {
    var sel = document.getElementById('mode-select');
    sel.innerHTML = '';
    window.GCWind.WIND_MODES.forEach(function (mode, i) {
      var opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = mode.name;
      sel.appendChild(opt);
    });
    sel.value = String(state.settings.modeIndex);
  }

  function ringShadeStyle(ringValue) {
    var clamped = clamp(ringValue, 1, 10);
    var pct = 6 + (clamped - 1) * ((46 - 6) / 9);
    return 'background-color: color-mix(in srgb, var(--series-1) ' + pct.toFixed(1) + '%, var(--surface-1));';
  }

  // Compact two-column layout for print/PDF: rings (or the wind range) split
  // into a left half and right half side by side, halving the vertical space
  // each club needs so a whole bag fits on one printed page.
  function buildPrintTableHTML(club, level, mode) {
    var cell = function (value, shadeOn) {
      var shade = shadeOn != null ? ringShadeStyle(shadeOn) : '';
      return '<td style="' + shade + '">' + value.toFixed(1) + '</td>';
    };

    if (state.settings.variant === 'ring') {
      var rows = window.GCWind.buildWindPerRingTable(club, level, mode, 10);
      var left = rows.slice(0, 5);
      var right = rows.slice(5, 10);
      var head =
        '<tr><th>Ring</th><th>Max</th><th>Mid</th><th>Min</th>' +
        '<th class="print-split">Ring</th><th>Max</th><th>Mid</th><th>Min</th></tr>';
      var body = left
        .map(function (l, i) {
          var r = right[i];
          return (
            '<tr><td>' + l.ring + '</td>' +
            cell(l.max, l.ring) + cell(l.mid, l.ring) + cell(l.min, l.ring) +
            '<td class="print-split">' + r.ring + '</td>' +
            cell(r.max, r.ring) + cell(r.mid, r.ring) + cell(r.min, r.ring) +
            '</tr>'
          );
        })
        .join('');
      return '<table class="wind-table wind-table-print"><thead>' + head + '</thead><tbody>' + body + '</tbody></table>';
    }

    var windRows = window.GCWind.buildRingsPerWindTable(club, level, mode, {
      minWind: 1,
      maxWind: 16,
      step: state.settings.windStep,
    });
    var mid = Math.ceil(windRows.length / 2);
    var leftRows = windRows.slice(0, mid);
    var rightRows = windRows.slice(mid);
    var headW =
      '<tr><th>Wind</th><th>Max</th><th>Mid</th><th>Min</th>' +
      '<th class="print-split">Wind</th><th>Max</th><th>Mid</th><th>Min</th></tr>';
    var bodyW = leftRows
      .map(function (l, i) {
        var r = rightRows[i];
        return (
          '<tr><td>' + l.wind.toFixed(1) + '</td>' +
          cell(l.max, l.max) + cell(l.mid, l.mid) + cell(l.min, l.min) +
          (r
            ? '<td class="print-split">' + r.wind.toFixed(1) + '</td>' + cell(r.max, r.max) + cell(r.mid, r.mid) + cell(r.min, r.min)
            : '<td class="print-split"></td><td></td><td></td><td></td>') +
          '</tr>'
        );
      })
      .join('');
    return '<table class="wind-table wind-table-print"><thead>' + headW + '</thead><tbody>' + bodyW + '</tbody></table>';
  }

  function buildScreenTableElement(club, level, mode) {
    var table = document.createElement('table');
    table.className = 'wind-table';

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    if (state.settings.variant === 'ring') {
      headRow.innerHTML = '<th>Ring</th><th>Max</th><th>Mid</th><th>Min</th>';
    } else {
      headRow.innerHTML = '<th>Wind</th><th>Max</th><th>Mid</th><th>Min</th>';
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');

    if (state.settings.variant === 'ring') {
      var rows = window.GCWind.buildWindPerRingTable(club, level, mode, 10);
      rows.forEach(function (row) {
        var tr = document.createElement('tr');
        var shade = ringShadeStyle(row.ring);
        tr.innerHTML =
          '<td>' + row.ring + '</td>' +
          '<td style="' + shade + '">' + row.max.toFixed(1) + '</td>' +
          '<td style="' + shade + '">' + row.mid.toFixed(1) + '</td>' +
          '<td style="' + shade + '">' + row.min.toFixed(1) + '</td>';
        tbody.appendChild(tr);
      });
    } else {
      var windRows = window.GCWind.buildRingsPerWindTable(club, level, mode, {
        minWind: 1,
        maxWind: 16,
        step: state.settings.windStep,
      });
      windRows.forEach(function (row) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' + row.wind.toFixed(1) + '</td>' +
          '<td style="' + ringShadeStyle(row.max) + '">' + row.max.toFixed(1) + '</td>' +
          '<td style="' + ringShadeStyle(row.mid) + '">' + row.mid.toFixed(1) + '</td>' +
          '<td style="' + ringShadeStyle(row.min) + '">' + row.min.toFixed(1) + '</td>';
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    return table;
  }

  function buildClubCardShell(club, level, accuracy) {
    var card = document.createElement('div');
    card.className = 'club-chart-card';
    card.style.setProperty('--chart-accent', accentVar(club.category));

    var head = document.createElement('div');
    head.className = 'club-chart-head';
    head.innerHTML =
      '<svg class="club-chart-icon" width="24" height="24"><use href="#icon-' + club.category + '"/></svg>' +
      '<div class="club-chart-titles">' +
      '<div class="club-chart-name">' + escapeHtml(club.name) + '</div>' +
      '<div class="club-chart-sub">Lv ' + level + ' &middot; Accuracy ' + accuracy + '</div>' +
      '</div>';
    card.appendChild(head);
    return card;
  }

  function renderChart() {
    var out = document.getElementById('chart-output');
    var controls = document.getElementById('chart-controls');
    out.innerHTML = '';

    if (!state.bag.length) {
      controls.hidden = true;
      out.innerHTML = '<div class="chart-empty">Add clubs to your bag to build a wind chart.</div>';
      return;
    }
    controls.hidden = false;

    var windStepField = document.getElementById('wind-step-field');
    windStepField.style.display = state.settings.variant === 'wind' ? '' : 'none';

    if (state.settings.title.trim()) {
      var banner = document.createElement('div');
      banner.className = 'chart-title-banner';
      banner.textContent = state.settings.title.trim();
      out.appendChild(banner);
    }

    var mode = window.GCWind.WIND_MODES[state.settings.modeIndex];

    state.bag.forEach(function (entry) {
      var club = getClubById(entry.clubId);
      if (!club) return;
      var level = clamp(entry.level, 1, club.maxLevel);
      var accuracy = club.accuracy[level - 1];

      var card = buildClubCardShell(club, level, accuracy);

      var tableWrap = document.createElement('div');
      tableWrap.className = 'club-chart-table-wrap screen-only';
      tableWrap.appendChild(buildScreenTableElement(club, level, mode));
      card.appendChild(tableWrap);

      var printWrap = document.createElement('div');
      printWrap.className = 'club-chart-table-wrap print-only';
      printWrap.innerHTML = buildPrintTableHTML(club, level, mode);
      card.appendChild(printWrap);

      out.appendChild(card);
    });
  }

  // ---------------------------------------------------------------------
  // Full-screen, screenshot-friendly chart view
  // ---------------------------------------------------------------------

  function renderFullscreenChart() {
    var body = document.getElementById('fullscreen-body');
    body.innerHTML = '';

    var subtitleParts = [
      window.GCWind.WIND_MODES[state.settings.modeIndex].name,
      state.settings.variant === 'ring' ? 'Wind per Ring' : 'Rings per Wind',
    ];
    document.getElementById('fullscreen-subtitle').textContent = subtitleParts.join(' · ');

    var titleEl = document.getElementById('fullscreen-title');
    var title = state.settings.title.trim();
    titleEl.textContent = title || 'Wind Chart';

    var mode = window.GCWind.WIND_MODES[state.settings.modeIndex];

    state.bag.forEach(function (entry) {
      var club = getClubById(entry.clubId);
      if (!club) return;
      var level = clamp(entry.level, 1, club.maxLevel);
      var accuracy = club.accuracy[level - 1];

      var card = buildClubCardShell(club, level, accuracy);
      var tableWrap = document.createElement('div');
      tableWrap.className = 'club-chart-table-wrap';
      tableWrap.appendChild(buildScreenTableElement(club, level, mode));
      card.appendChild(tableWrap);
      body.appendChild(card);
    });
  }

  function openFullscreenChart() {
    if (!state.bag.length) return;
    var overlay = document.getElementById('fullscreen-overlay');
    renderFullscreenChart();
    overlay.hidden = false;
    document.getElementById('fullscreen-close').focus();
    if (overlay.requestFullscreen) {
      overlay.requestFullscreen().catch(function () {
        /* fullscreen not available/permitted -- the overlay still covers the viewport */
      });
    }
  }

  function closeFullscreenChart() {
    document.getElementById('fullscreen-overlay').hidden = true;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
    }
  }

  // ---------------------------------------------------------------------
  // Chart controls wiring (one-time)
  // ---------------------------------------------------------------------

  function wireChartControls() {
    var titleInput = document.getElementById('chart-title');
    titleInput.value = state.settings.title;
    titleInput.addEventListener('input', function () {
      state.settings.title = titleInput.value;
      saveSettings();
      requestRender();
    });

    document.getElementById('variant-toggle').addEventListener('click', function (e) {
      var btn = e.target.closest('.segmented-btn');
      if (!btn) return;
      state.settings.variant = btn.dataset.variant;
      saveSettings();
      document.querySelectorAll('#variant-toggle .segmented-btn').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      requestRender();
    });

    var modeSelect = document.getElementById('mode-select');
    modeSelect.addEventListener('change', function () {
      state.settings.modeIndex = Number(modeSelect.value);
      saveSettings();
      requestRender();
    });

    var stepSelect = document.getElementById('wind-step-select');
    stepSelect.value = String(state.settings.windStep);
    stepSelect.addEventListener('change', function () {
      state.settings.windStep = Number(stepSelect.value);
      saveSettings();
      requestRender();
    });

    document.getElementById('clear-bag-btn').addEventListener('click', clearBag);
    document.getElementById('print-btn').addEventListener('click', function () {
      window.print();
    });
    document.getElementById('fullscreen-btn').addEventListener('click', openFullscreenChart);
  }

  function wireFullscreenOverlay() {
    document.getElementById('fullscreen-close').addEventListener('click', closeFullscreenChart);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !document.getElementById('fullscreen-overlay').hidden) {
        closeFullscreenChart();
      }
    });
    document.addEventListener('fullscreenchange', function () {
      var overlay = document.getElementById('fullscreen-overlay');
      if (!document.fullscreenElement && !overlay.hidden) {
        overlay.hidden = true;
      }
    });
  }

  // ---------------------------------------------------------------------
  // Manage Clubs modal
  // ---------------------------------------------------------------------

  var editor = {};

  function openEditorModal() {
    document.getElementById('club-editor-overlay').hidden = false;
    showEditorPlaceholder();
  }

  function showEditorPlaceholder() {
    state.editingClubId = null;
    renderEditorList();
    document.getElementById('editor-form-pane').innerHTML =
      '<p class="editor-form-placeholder">Select a club on the left to edit it, or add a new one.</p>';
  }

  function closeEditorModal() {
    document.getElementById('club-editor-overlay').hidden = true;
    state.editingClubId = null;
  }

  function renderEditorList() {
    var listEl = document.getElementById('editor-club-list');
    listEl.innerHTML = '';
    var clubs = getClubs();

    CATEGORY_ORDER.forEach(function (cat) {
      var inCat = clubs.filter(function (c) { return c.category === cat; });
      if (!inCat.length) return;
      var heading = document.createElement('div');
      heading.className = 'editor-category-heading';
      heading.textContent = CATEGORY_LABELS[cat];
      listEl.appendChild(heading);

      inCat.forEach(function (club) {
        var row = document.createElement('button');
        row.type = 'button';
        row.className = 'editor-club-row' + (state.editingClubId === club.id ? ' is-active' : '');
        var isCustom = !!state.customClubs[club.id];
        row.innerHTML =
          '<span class="row-accent" style="background:' + accentVar(club.category) + '"></span>' +
          '<span class="row-name">' + escapeHtml(club.name) + '</span>' +
          (isCustom ? '<span class="row-custom-badge">edited</span>' : '');
        row.addEventListener('click', function () {
          renderEditorForm(club.id);
        });
        listEl.appendChild(row);
      });
    });
  }

  function blankClub() {
    return {
      id: '',
      name: '',
      category: state.activeCategory || 'Drivers',
      tour: 1,
      type: 'Common',
      power: [200],
      accuracy: [50],
    };
  }

  function renderEditorForm(clubId) {
    state.editingClubId = clubId;
    renderEditorList();

    var pane = document.getElementById('editor-form-pane');
    pane.innerHTML = '';

    var isNew = clubId === 'new';
    var club = isNew ? blankClub() : Object.assign({}, getClubById(clubId));
    if (!club) {
      showEditorPlaceholder();
      return;
    }

    var form = document.createElement('form');
    form.className = 'club-form';

    var row1 = document.createElement('div');
    row1.className = 'club-form-row';
    row1.innerHTML =
      '<div class="club-form-field"><label>Name</label><input name="name" type="text" required value="' +
      escapeHtml(club.name) +
      '" /></div>' +
      '<div class="club-form-field"><label>Category</label><select name="category">' +
      CATEGORY_ORDER.map(function (c) {
        return '<option value="' + c + '"' + (c === club.category ? ' selected' : '') + '>' + CATEGORY_LABELS[c] + '</option>';
      }).join('') +
      '</select></div>';
    form.appendChild(row1);

    var row2 = document.createElement('div');
    row2.className = 'club-form-row';
    row2.innerHTML =
      '<div class="club-form-field"><label>Tour (unlock order)</label><input name="tour" type="number" min="0" step="1" value="' +
      Number(club.tour || 0) +
      '" /></div>' +
      '<div class="club-form-field"><label>Rarity / type</label><input name="type" type="text" list="type-suggestions" value="' +
      escapeHtml(club.type || '') +
      '" /></div>';
    form.appendChild(row2);

    if (!document.getElementById('type-suggestions')) {
      var datalist = document.createElement('datalist');
      datalist.id = 'type-suggestions';
      datalist.innerHTML = TYPE_SUGGESTIONS.map(function (t) {
        return '<option value="' + t + '">';
      }).join('');
      document.body.appendChild(datalist);
    }

    var levelsLabel = document.createElement('div');
    levelsLabel.className = 'levels-table-label';
    levelsLabel.innerHTML =
      '<span>Per-level stats</span><button type="button" class="btn-ghost" id="add-level-row-btn">+ Add level</button>';
    form.appendChild(levelsLabel);

    var levelsTable = document.createElement('table');
    levelsTable.className = 'levels-editor';
    levelsTable.innerHTML = '<thead><tr><th>Lv</th><th>Power</th><th>Accuracy</th><th></th></tr></thead><tbody></tbody>';
    var tbody = levelsTable.querySelector('tbody');

    function addLevelRow(power, accuracy) {
      var tr = document.createElement('tr');
      var idx = tbody.children.length + 1;
      tr.innerHTML =
        '<td>' + idx + '</td>' +
        '<td><input type="number" class="level-power" step="1" value="' + (power != null ? power : '') + '" /></td>' +
        '<td><input type="number" class="level-accuracy" step="1" value="' + (accuracy != null ? accuracy : '') + '" /></td>' +
        '<td><button type="button" class="remove-level-btn" aria-label="Remove level"><svg width="14" height="14"><use href="#icon-close"/></svg></button></td>';
      tr.querySelector('.remove-level-btn').addEventListener('click', function () {
        if (tbody.children.length <= 1) return;
        tr.remove();
        renumberLevelRows();
      });
      tbody.appendChild(tr);
    }

    function renumberLevelRows() {
      Array.prototype.forEach.call(tbody.children, function (tr, i) {
        tr.firstElementChild.textContent = String(i + 1);
      });
    }

    (club.power && club.power.length ? club.power : [200]).forEach(function (p, i) {
      addLevelRow(p, (club.accuracy || [])[i]);
    });

    form.appendChild(levelsTable);

    levelsLabel.querySelector('#add-level-row-btn').addEventListener('click', function () {
      if (tbody.children.length >= 12) return;
      var last = tbody.lastElementChild;
      var lastPower = last ? last.querySelector('.level-power').value : '';
      var lastAcc = last ? last.querySelector('.level-accuracy').value : '';
      addLevelRow(lastPower, lastAcc);
    });

    var actions = document.createElement('div');
    actions.className = 'club-form-actions';
    var canDelete = !isNew;
    actions.innerHTML =
      (canDelete ? '<button type="button" class="btn-danger" id="delete-club-btn">Delete club</button>' : '<span></span>') +
      '<div class="club-form-actions-right">' +
      '<button type="button" class="btn-ghost" id="cancel-club-btn">Cancel</button>' +
      '<button type="submit" class="btn-primary">' +
      (isNew ? 'Add club' : 'Save changes') +
      '</button>' +
      '</div>';
    form.appendChild(actions);

    pane.appendChild(form);

    if (canDelete) {
      document.getElementById('delete-club-btn').addEventListener('click', function () {
        if (!confirm('Delete "' + club.name + '"? This also removes it from your bag if present.')) return;
        deleteClub(club.id);
      });
    }
    document.getElementById('cancel-club-btn').addEventListener('click', function () {
      showEditorPlaceholder();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var powerVals = Array.prototype.map.call(tbody.querySelectorAll('.level-power'), function (i) {
        return parseFloat(i.value);
      });
      var accVals = Array.prototype.map.call(tbody.querySelectorAll('.level-accuracy'), function (i) {
        return parseFloat(i.value);
      });
      if (powerVals.some(isNaN) || accVals.some(isNaN)) {
        alert('Every level needs a numeric power and accuracy value.');
        return;
      }
      var name = form.name.value.trim();
      if (!name) {
        alert('Name is required.');
        return;
      }
      var saved = {
        id: isNew ? generateId() : club.id,
        name: name,
        category: form.category.value,
        tour: parseInt(form.tour.value, 10) || 0,
        type: form.type.value.trim() || 'Common',
        power: powerVals,
        accuracy: accVals,
        maxLevel: powerVals.length,
      };
      state.customClubs[saved.id] = saved;
      saveClubOverrides();
      invalidateClubsCache();
      renderEditorForm(saved.id);
      requestRender();
    });
  }

  function deleteClub(clubId) {
    delete state.customClubs[clubId];
    if (isSeedClub(clubId) && state.deletedSeedIds.indexOf(clubId) === -1) {
      state.deletedSeedIds.push(clubId);
    }
    state.bag = state.bag.filter(function (b) {
      return b.clubId !== clubId;
    });
    saveClubOverrides();
    saveBag();
    invalidateClubsCache();
    if (state.activeCategory && !getClubs().some(function (c) { return c.category === state.activeCategory; })) {
      state.activeCategory = 'Drivers';
    }
    showEditorPlaceholder();
    requestRender();
  }

  function wireEditorModal() {
    document.getElementById('manage-clubs-btn').addEventListener('click', openEditorModal);
    document.getElementById('club-editor-close').addEventListener('click', closeEditorModal);
    document.getElementById('club-editor-overlay').addEventListener('click', function (e) {
      if (e.target.id === 'club-editor-overlay') closeEditorModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !document.getElementById('club-editor-overlay').hidden) closeEditorModal();
    });

    document.getElementById('add-club-btn').addEventListener('click', function () {
      renderEditorForm('new');
    });

    document.getElementById('export-clubs-btn').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(getClubs(), null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'golf-clash-clubs.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    var importInput = document.getElementById('import-clubs-file');
    document.getElementById('import-clubs-btn').addEventListener('click', function () {
      importInput.click();
    });
    importInput.addEventListener('change', function () {
      var file = importInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var imported, valid = 0, skipped = 0;
        try {
          imported = JSON.parse(reader.result);
        } catch (e) {
          alert('That file is not valid JSON.');
          return;
        }
        if (!Array.isArray(imported)) {
          alert('Expected a JSON array of clubs.');
          return;
        }
        imported.forEach(function (c) {
          if (!c || !c.name || !c.category || !Array.isArray(c.power) || !c.power.length) {
            skipped++;
            return;
          }
          var id = c.id || generateId();
          state.customClubs[id] = {
            id: id,
            name: c.name,
            category: c.category,
            tour: Number(c.tour) || 0,
            type: c.type || 'Common',
            power: c.power,
            accuracy: c.accuracy && c.accuracy.length === c.power.length ? c.accuracy : c.power.map(function () { return 50; }),
            maxLevel: c.power.length,
          };
          valid++;
        });
        saveClubOverrides();
        invalidateClubsCache();
        renderEditorList();
        requestRender();
        alert('Imported ' + valid + ' club(s).' + (skipped ? ' Skipped ' + skipped + ' invalid entr' + (skipped === 1 ? 'y' : 'ies') + '.' : ''));
      };
      reader.readAsText(file);
      importInput.value = '';
    });
  }

  // ---------------------------------------------------------------------
  // Master render + init
  // ---------------------------------------------------------------------

  function render() {
    renderTabs();
    renderGrid();
    renderBag();
    renderChart();
  }

  function init() {
    populateModeSelect();
    document.querySelectorAll('#variant-toggle .segmented-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.variant === state.settings.variant);
    });
    wireChartControls();
    wireEditorModal();
    wireFullscreenOverlay();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
