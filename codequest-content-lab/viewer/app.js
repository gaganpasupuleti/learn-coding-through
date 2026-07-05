(function () {
  "use strict";

  var DATA_URL = "sample-normalized-content.json";

  var els = {
    search: document.getElementById("search"),
    filterType: document.getElementById("filter-type"),
    filterDomain: document.getElementById("filter-domain"),
    filterLicense: document.getElementById("filter-license"),
    filterReview: document.getElementById("filter-review"),
    reset: document.getElementById("reset-filters"),
    stats: document.getElementById("stats"),
    cards: document.getElementById("cards"),
    empty: document.getElementById("empty"),
    error: document.getElementById("error"),
  };

  var allItems = [];

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort();
  }

  function fillSelect(select, values) {
    values.forEach(function (value) {
      var opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      select.appendChild(opt);
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function matchesSearch(item, query) {
    if (!query) return true;
    var q = query.toLowerCase();
    var haystack = [
      item.title,
      item.author_or_creator,
      (item.tags || []).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(q) !== -1;
  }

  function getFilteredItems() {
    var type = els.filterType.value;
    var domain = els.filterDomain.value;
    var license = els.filterLicense.value;
    var review = els.filterReview.value;
    var query = els.search.value.trim();

    return allItems.filter(function (item) {
      if (type && item.content_type !== type) return false;
      if (domain && !(item.domains || []).includes(domain)) return false;
      if (license && item.license_status !== license) return false;
      if (review && item.review_status !== review) return false;
      return matchesSearch(item, query);
    });
  }

  function renderSafety(item) {
    var filePath = item.file_path === null ? "null" : String(item.file_path);
    var audioPath = item.audio_file_path === null ? "null" : String(item.audio_file_path);
    var sourceUrl = item.source_url
      ? '<a class="card__link" href="' +
        escapeHtml(item.source_url) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(item.source_url) +
        "</a>"
      : "—";

    return (
      '<dl class="card__safety">' +
      "<div><dt>Source: </dt><dd>" +
      sourceUrl +
      "</dd></div>" +
      "<div><dt>License: </dt><dd>" +
      escapeHtml(item.license_status || "—") +
      "</dd></div>" +
      "<div><dt>Review: </dt><dd>" +
      escapeHtml(item.review_status || "—") +
      "</dd></div>" +
      "<div><dt>file_path: </dt><dd>" +
      escapeHtml(filePath) +
      "</dd></div>" +
      "<div><dt>audio_file_path: </dt><dd>" +
      escapeHtml(audioPath) +
      "</dd></div>" +
      "</dl>"
    );
  }

  function renderCard(item) {
    var typeClass = "card--" + (item.content_type || "unknown");
    var tags = (item.tags || [])
      .map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + "</span>";
      })
      .join("");

    return (
      '<article class="card ' +
      typeClass +
      '">' +
      '<div class="card__meta">' +
      '<span class="chip">' +
      escapeHtml(item.content_type || "unknown") +
      "</span>" +
      '<span class="chip">' +
      escapeHtml((item.domains || []).join(", ") || "—") +
      "</span>" +
      '<span class="chip">' +
      escapeHtml(item.source_name || item.source_type || "source") +
      "</span>" +
      "</div>" +
      "<h2 class=\"card__title\">" +
      escapeHtml(item.title || "Untitled") +
      "</h2>" +
      '<p class="card__author">' +
      escapeHtml(item.author_or_creator || "Unknown") +
      "</p>" +
      '<p class="card__summary">' +
      escapeHtml(item.summary || "") +
      "</p>" +
      '<div class="card__tags">' +
      tags +
      "</div>" +
      renderSafety(item) +
      "</article>"
    );
  }

  function render() {
    var filtered = getFilteredItems();
    els.stats.innerHTML =
      "Showing <strong>" +
      filtered.length +
      "</strong> of <strong>" +
      allItems.length +
      "</strong> items";

    if (filtered.length === 0) {
      els.cards.innerHTML = "";
      els.empty.classList.remove("hidden");
    } else {
      els.empty.classList.add("hidden");
      els.cards.innerHTML = filtered.map(renderCard).join("");
    }
  }

  function showError(message) {
    els.error.textContent = message;
    els.error.classList.remove("hidden");
    els.cards.innerHTML = "";
    els.empty.classList.add("hidden");
    els.stats.textContent = "";
  }

  function initFilters(items) {
    fillSelect(
      els.filterType,
      uniqueSorted(items.map(function (i) { return i.content_type; }))
    );
    fillSelect(
      els.filterDomain,
      uniqueSorted(items.flatMap(function (i) { return i.domains || []; }))
    );
    fillSelect(
      els.filterLicense,
      uniqueSorted(items.map(function (i) { return i.license_status; }))
    );
    fillSelect(
      els.filterReview,
      uniqueSorted(items.map(function (i) { return i.review_status; }))
    );
  }

  function bindEvents() {
    [els.search, els.filterType, els.filterDomain, els.filterLicense, els.filterReview].forEach(
      function (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    );

    els.reset.addEventListener("click", function () {
      els.search.value = "";
      els.filterType.value = "";
      els.filterDomain.value = "";
      els.filterLicense.value = "";
      els.filterReview.value = "";
      render();
    });
  }

  function load() {
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + DATA_URL + " (" + res.status + ")");
        return res.json();
      })
      .then(function (data) {
        allItems = data.items || [];
        if (!allItems.length) throw new Error("No items found in " + DATA_URL);
        initFilters(allItems);
        bindEvents();
        render();
      })
      .catch(function (err) {
        showError(
          err.message +
            ". Serve this folder with a local HTTP server (see README.md)."
        );
      });
  }

  load();
})();
