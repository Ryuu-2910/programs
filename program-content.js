/* ====================================================================
   PROGRAM PAGE - JSON-driven tab panels

   Each tab reads one JSON file sitting next to this script:

     overview.json    -> Gambaran Umum
     academics.json   -> Akademik & Karier
     partners.json    -> Mitra
     lecturers.json   -> Pimpinan & Dosen
     news.json        -> Berita
     cta.json         -> Ajakan mendaftar (di bawah konten, sebelum footer)

   The <section data-panel="..."> shells stay in Untitled-1.html, so the
   tab switcher keeps working whether or not the data loads. Only the
   inside of each panel is rendered here.

   To reuse this page for another program studi, edit the JSON files.
   You should not need to touch this file or the HTML.
   ==================================================================== */

(function () {
  "use strict";

  /* ---------- helpers ---------- */

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function mount(selector) {
    return document.querySelector(selector);
  }

  function fail(el, label) {
    if (!el) return;
    el.innerHTML =
      '<div class="unpri-card"><div class="unpri-card__body">' +
      '<p style="color:#B91C1C; margin:0;">Gagal memuat ' + esc(label) + '. ' +
      'Pastikan file JSON ada dan halaman dibuka lewat server (Live Server), ' +
      'bukan langsung dari file lokal.</p>' +
      "</div></div>";
  }

  // Fetch one JSON file and hand it to a render function. Each panel is
  // independent, so a missing file only breaks its own tab.
  function load(file, selector, label, render) {
    var el = mount(selector);
    if (!el) return;

    fetch(file)
      .then(function (res) {
        if (!res.ok) throw new Error(res.status + " " + res.statusText);
        return res.json();
      })
      .then(function (data) {
        el.innerHTML = render(data);
      })
      .catch(function (err) {
        fail(el, label);
        console.error("Failed to load " + file + ":", err);
      });
  }

  /* ---------- icons ----------
     The Pe-icon-7-stroke font referenced by Untitled-1.css has no font file
     shipped alongside it, so every <i class="pe-7s-*"> rendered as an empty
     box. These inline SVGs replace it. They inherit colour via currentColor
     and size via the CSS on .unpri-ic / .unpri-video__play.
     JSON still uses the old pe-7s-* names; they are mapped here.           */

  var ICONS = {
    // The only solid one: a play triangle.
    play: '<path d="M9 6.2l9.5 5.8L9 17.8z" fill="currentColor"/>',

    // Graduation cap.
    study:
      '<path d="M2.5 8.2L12 4.2l9.5 4-9.5 4-9.5-4z"/>' +
      '<path d="M6.6 9.9v4.6c0 1.5 2.4 2.6 5.4 2.6s5.4-1.1 5.4-2.6V9.9"/>' +
      '<path d="M21.5 8.2v5.1"/>',

    // Briefcase.
    portfolio:
      '<rect x="2.8" y="7.2" width="18.4" height="12.6" rx="2.2"/>' +
      '<path d="M8.8 7.2V5.6a1.8 1.8 0 0 1 1.8-1.8h2.8a1.8 1.8 0 0 1 1.8 1.8v1.6"/>' +
      '<path d="M2.8 12.4h18.4"/>' +
      '<path d="M10.4 12.4v1.8h3.2v-1.8"/>',

    // Document with lines.
    note:
      '<path d="M5.8 3.4h7.6l4.8 4.8v12.4H5.8z"/>' +
      '<path d="M13.4 3.4v4.8h4.8"/>' +
      '<path d="M9 12.6h6M9 15.8h6M9 9.4h2.6"/>',

    // Award medal on a ribbon.
    medal:
      '<circle cx="12" cy="14.6" r="5.4"/>' +
      '<path d="M12 12.4l.8 1.7 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3z"/>' +
      '<path d="M8.6 9.8L6.2 3.6h11.6l-2.4 6.2"/>',

    // ID card.
    id:
      '<rect x="2.4" y="5" width="19.2" height="14" rx="2.2"/>' +
      '<circle cx="8.4" cy="10.6" r="2.1"/>' +
      '<path d="M5.2 15.8c.6-1.4 1.8-2.1 3.2-2.1s2.6.7 3.2 2.1"/>' +
      '<path d="M14.6 9.6h4.4M14.6 13.2h4.4"/>',

    // Rosette with tails.
    ribbon:
      '<circle cx="12" cy="8.8" r="5.2"/>' +
      '<path d="M12 6.6l.9 1.8 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>' +
      '<path d="M8.6 13.2L7.2 20.6 12 18.2l4.8 2.4-1.4-7.4"/>',

    // Clock.
    clock:
      '<circle cx="12" cy="12" r="8.4"/>' +
      '<path d="M12 6.8V12l3.4 2.1"/>',

    // Magnifier.
    search:
      '<circle cx="10.6" cy="10.6" r="6.4"/>' +
      '<path d="M15.3 15.3l5.2 5.2"/>',

    // Newspaper.
    news:
      '<path d="M3 5.4h13.4v14.2H4.8A1.8 1.8 0 0 1 3 17.8z"/>' +
      '<path d="M16.4 9.2h2.9a1.7 1.7 0 0 1 1.7 1.7v6.9a1.8 1.8 0 0 1-3.6 0"/>' +
      '<path d="M6.2 8.8h7M6.2 12.2h7M6.2 15.6h4.4"/>',

    // Chevron in a circle.
    chevronRight:
      '<circle cx="12" cy="12" r="8.4"/>' +
      '<path d="M10.6 8.4l3.6 3.6-3.6 3.6"/>'
  };

  // Old font class names -> icon keys, so the JSON files keep working as-is.
  var ICON_ALIASES = {
    "pe-7s-play": "play",
    "pe-7s-study": "study",
    "pe-7s-portfolio": "portfolio",
    "pe-7s-note2": "note",
    "pe-7s-note": "note",
    "pe-7s-medal": "medal",
    "pe-7s-id": "id",
    "pe-7s-ribbon": "ribbon",
    "pe-7s-clock": "clock",
    "pe-7s-search": "search",
    "pe-7s-news-paper": "news",
    "pe-7s-angle-right-circle": "chevronRight"
  };

  function icon(name, cls) {
    var key = ICON_ALIASES[name] || name;
    var body = ICONS[key] || ICONS.study;
    return (
      '<svg class="unpri-svg' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" ' +
      'width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
      'focusable="false">' + body + "</svg>"
    );
  }

  /* ---------- shared: video frame ---------- */

  // Renders a 16:9 frame. With no `src` it stays an empty placeholder box, so
  // the layout is already correct before anyone has a video file to drop in.
  // Fill `src` with a YouTube/Vimeo embed URL, or a path to an .mp4/.webm and
  // it switches to a native <video> player on its own.
  function renderVideo(v, extraClass) {
    if (!v) return "";

    var cls = "unpri-video" + (extraClass ? " " + extraClass : "");
    var src = (v.src || "").trim();
    var inner;

    if (!src) {
      inner =
        '<div class="unpri-video__empty">' +
        '<span class="unpri-video__play">' + icon("play") + "</span>" +
        '<p class="unpri-video__caption">' + esc(v.caption || " ") + "</p>" +
        "</div>";
    } else if (/\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(src)) {
      inner =
        '<video class="unpri-video__player" controls playsinline preload="metadata"' +
        (v.poster ? ' poster="' + esc(v.poster) + '"' : "") +
        '><source src="' + esc(src) + '"></video>';
    } else {
      inner =
        '<iframe class="unpri-video__player" src="' + esc(src) + '" ' +
        'title="' + esc(v.title || "Video") + '" frameborder="0" loading="lazy" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
        "allowfullscreen></iframe>";
    }

    var html = '<figure class="' + cls + '">';
    if (v.title) {
      html += '<figcaption class="unpri-video__title">' + esc(v.title) + "</figcaption>";
    }
    html += '<div class="unpri-video__frame">' + inner + "</div></figure>";
    return html;
  }

  /* ---------- shared: statistik strip ---------- */

  // `suffix` defaults to "+" so placeholder counts read as "1000+". Once the
  // real figures are known, set "suffix": "" on that item.
  function renderStats(stats) {
    if (!stats) return "";
    var items = stats.items || (stats.length ? stats : []);
    if (!items.length) return "";

    var cells = items
      .map(function (s) {
        var suffix = s.suffix == null ? "+" : s.suffix;
        return (
          '<div class="unpri-stat">' +
          '<span class="unpri-stat__num">' + esc(s.value) + esc(suffix) + "</span>" +
          '<span class="unpri-stat__label">' + esc(s.label) + "</span>" +
          "</div>"
        );
      })
      .join('<span class="unpri-stat__sep" aria-hidden="true"></span>');

    return '<div class="unpri-stats">' + cells + "</div>";
  }

  /* ---------- gambaran umum ---------- */

  function renderOverview(d) {
    var misi = ((d.misi && d.misi.items) || [])
      .map(function (text, i) {
        return (
          '<div class="unpri-misi__item">' +
          '<span class="unpri-misi__num">' + (i + 1) + "</span>" +
          "<p>" + esc(text) + "</p>" +
          "</div>"
        );
      })
      .join("");

    // Intro block video etc
    var html =
      '<div class="unpri-overview">' +
      '<h2 class="unpri-sectionTitle">' + esc(d.sectionTitle || "Gambaran Umum") + "</h2>" +
      renderVideo(d.video) +
      renderStats(d.stats) +
      '<p class="unpri-overview__desc">' + esc(d.description) + "</p>" +
      "</div>";

    // Alumni video
    html += renderVideo(d.alumniVideo, "unpri-video--alumni");

    // Visi and Misi share one row, two columns.
    var visi = "";
    if (d.visi && d.visi.text) {
      visi =
        '<div class="unpri-visi">' +
        '<p class="unpri-kicker">' + esc(d.visi.kicker || "Visi") + "</p>" +
        '<div class="unpri-visi__box"><p>' + esc(d.visi.text) + "</p></div>" +
        "</div>";
    }

    if (misi) {
      misi =
        '<div class="unpri-misi">' +
        '<p class="unpri-kicker">' + esc((d.misi && d.misi.kicker) || "Misi") + "</p>" +
        '<div class="unpri-misi__list">' + misi + "</div>" +
        "</div>";
    }

    if (visi || misi) {
      html += '<div class="unpri-vm">' + visi + misi + "</div>";
    }

    return html;
  }

  /* ---------- akademik & karier ---------- */

  function renderAcademics(d) {
    return (d.cards || [])
      .map(function (card) {
        var head =
          '<h3 class="unpri-card__ttl">' +
          '<span class="unpri-ic">' + icon(card.icon || "pe-7s-study") + "</span>" +
          esc(card.title) +
          "</h3>";

        if (card.chip) {
          head += '<span class="unpri-chip">' + esc(card.chip) + "</span>";
        }

        var body = "";
        if (card.intro) {
          body += '<p class="unpri-cardIntro">' + esc(card.intro) + "</p>";
        }

        // A card carries `placeholder` (nothing written yet), `entries`
        // (picture + short paragraph, used by Konsentrasi), or a plain
        // `items` list (used by Karir).
        if (card.placeholder) {
          body +=
            '<div class="unpri-placeholder"><p>' + esc(card.placeholder) + "</p></div>";
        } else if (card.entries && card.entries.length) {
          body +=
            '<div class="unpri-conGrid">' +
            card.entries
              .map(function (e) {
                var img = e.image
                  ? '<div class="unpri-con__img">' +
                    '<img src="' + esc(e.image) + '" alt="' + esc(e.alt || e.title) + '" loading="lazy">' +
                    "</div>"
                  : "";
                return (
                  '<article class="unpri-con">' +
                  img +
                  '<div class="unpri-con__body">' +
                  '<h4 class="unpri-con__ttl">' + esc(e.title) + "</h4>" +
                  "<p>" + esc(e.text) + "</p>" +
                  "</div></article>"
                );
              })
              .join("") +
            "</div>";
        } else {
          var items = (card.items || [])
            .map(function (li) {
              return "<li>" + esc(li) + "</li>";
            })
            .join("");
          body += '<ul class="unpri-ul">' + items + "</ul>";
        }

        return (
          '<div class="unpri-card"><div class="unpri-card__body">' +
          '<div class="unpri-cardHead">' + head + "</div>" +
          body +
          "</div></div>"
        );
      })
      .join("");
  }

  /* ---------- mitra ---------- */

  // Documentation band. Built only from partners that carry a `video` key, so
  // it disappears entirely when none do and grows as footage is collected —
  // no layout decision has to be made up front.
  //
  // auto-fill (not auto-fit) is deliberate: with one card it leaves the empty
  // tracks in place, so a lone video stays a sensible ~350px wide instead of
  // stretching across the whole page.
  function renderPartnerDocs(d) {
    var withVideo = (d.partners || []).filter(function (p) {
      return p.video;
    });
    if (!withVideo.length) return "";

    var meta = d.documentation || {};

    var cards = withVideo
      .map(function (p) {
        var v = p.video || {};

        // renderVideo already handles all three cases: blank src -> placeholder
        // box, .mp4/.webm -> native player, anything else -> embed iframe.
        var frame = renderVideo(
          {
            src: v.src,
            poster: v.poster,
            caption: v.placeholder
          },
          "unpri-docCard__video"
        );

        var body =
          '<div class="unpri-docCard__body">' +
          '<h4 class="unpri-docCard__ttl">' + esc(p.name) + "</h4>";
        if (v.caption) {
          body += '<p class="unpri-docCard__desc">' + esc(v.caption) + "</p>";
        }
        if (v.date) {
          body += '<p class="unpri-docCard__date">' + esc(v.date) + "</p>";
        }
        body += "</div>";

        return '<article class="unpri-docCard">' + frame + body + "</article>";
      })
      .join("");

    var head = "";
    if (meta.title) {
      head += '<h3 class="unpri-docHead__ttl">' + esc(meta.title) + "</h3>";
    }
    if (meta.intro) {
      head += '<p class="unpri-docHead__intro">' + esc(meta.intro) + "</p>";
    }
    if (head) head = '<div class="unpri-docHead">' + head + "</div>";

    return (
      '<section class="unpri-partnerDocs">' +
      head +
      '<div class="unpri-docGrid">' + cards + "</div>" +
      "</section>"
    );
  }

  /* ---------- mitra ---------- */

  function renderPartners(d) {
    var cards = (d.partners || [])
      .map(function (p) {
        // logoHeight overrides the default logo box height for logos with
        // odd proportions (see --logo-h in Untitled-2.css).
        var style = p.logoHeight ? ' style="--logo-h: ' + esc(p.logoHeight) + '"' : "";
        var tooltip = p.tooltip || p.name;

        return (
          '<div class="unpri-partnerCard" data-tooltip="' + esc(tooltip) + '">' +
          '<div class="unpri-partnerLogo"' + style + ">" +
          '<img src="' + esc(p.logo) + '" alt="' + esc(p.name) + '" onerror="this.remove();">' +
          '<span class="unpri-partnerName">' + esc(p.name) + "</span>" +
          "</div></div>"
        );
      })
      .join("");

    var grid = '<div class="unpri-partnerGrid">' + cards + "</div>";

    if (d.logosTitle) {
      grid =
        '<h3 class="unpri-docHead__ttl unpri-docHead__ttl--sub">' +
        esc(d.logosTitle) + "</h3>" + grid;
    }

    return renderPartnerDocs(d) + grid;
  }

  /* ---------- pimpinan & dosen ---------- */

  function renderLecturers(d) {
    var html = "";
    var head = d.head;

    if (head) {
      html +=
        '<div class="unpri-pmuLead">' +
        '<div class="unpri-avatar unpri-avatar--lg">' +
        '<img src="' + esc(head.photo) + '" alt="' + esc(head.name) + '">' +
        "</div><div>" +
        '<p class="unpri-pmuLead__name">' + esc(head.name) + "</p>" +
        '<p class="unpri-pmuLead__role">' + esc(head.role) + "</p>" +
        "</div></div>";
    }

    var chips = (d.lecturers || [])
      .map(function (l) {
        // photos is a list so a lecturer can carry fallback images; each one
        // removes itself on error, leaving the initials underneath.
        var imgs = (l.photos || [])
          .map(function (photo) {
            return '<img src="' + esc(photo) + '" alt="' + esc(l.name) + '" onerror="this.remove();">';
          })
          .join("");

        return (
          '<a class="unpri-lecturerChip" href="' + esc(l.href) + '">' +
          '<span class="unpri-lecturerAvatar">' + imgs + esc(l.initials) + "</span>" +
          '<span class="unpri-lecturerChip__text">' +
          '<span class="unpri-lecturerChip__name">' + esc(l.name) + "</span>" +
          '<span class="unpri-lecturerChip__meta">' + esc(l.meta) + "</span>" +
          "</span></a>"
        );
      })
      .join("");

    if (chips) {
      html +=
        '<div class="unpri-lecturers">' +
        '<span class="unpri-badge unpri-badge--outline">' + esc(d.sectionLabel || "Dosen Tetap") + "</span>" +
        '<div class="unpri-lecturers__grid">' + chips + "</div>" +
        "</div>";
    }

    return html;
  }

  /* ---------- berita ---------- */

  function renderNews(d) {
    var all = d.allNews || {};

    var head =
      '<div class="unpri-newsHead">' +
      "<p>" + esc(d.intro) + "</p>";

    if (all.href) {
      head +=
        '<a href="' + esc(all.href) + '" class="unpri-btn unpri-btn--ghost">' +
        icon(all.icon || "pe-7s-news-paper", "unpri-svg--lead") +
        esc(all.label || "Lihat Semua Berita") +
        "</a>";
    }
    head += "</div>";

    var items = d.items || [];
    var body;

    if (!items.length) {
      body = '<p style="margin:0; color:var(--up-muted, #667A83);">Belum ada berita.</p>';
    } else {
      body =
        '<div class="unpri-newsGrid">' +
        items
          .map(function (n) {
            return (
              '<div class="unpri-newsCard">' +
              '<div class="unpri-newsCard__img">' +
              '<img src="' + esc(n.image) + '" alt="' + esc(n.title) + '">' +
              "</div>" +
              '<div class="unpri-newsCard__body">' +
              '<p class="unpri-newsDate">' + esc(n.date) + "</p>" +
              '<h4 class="unpri-newsTitle">' + esc(n.title) + "</h4>" +
              '<p class="unpri-newsExcerpt">' + esc(n.excerpt) + "</p>" +
              '<a href="' + esc(n.href) + '" class="unpri-newsMore">' +
              esc(n.moreLabel || "Baca Selengkapnya \u2192") +
              "</a>" +
              "</div></div>"
            );
          })
          .join("") +
        "</div>";
    }

    return (
      '<div class="unpri-card"><div class="unpri-card__body">' +
      head +
      '<hr class="unpri-newsSep">' +
      body +
      "</div></div>"
    );
  }

  /* ---------- ajakan mendaftar (CTA) ---------- */

  function renderCta(d) {
    var btn = d.button || {};
    var html =
      '<div class="unpri-cta__inner">' +
      '<div class="unpri-cta__text">';

    if (d.eyebrow) {
      html += '<p class="unpri-cta__eyebrow">' + esc(d.eyebrow) + "</p>";
    }
    html +=
      '<h2 class="unpri-cta__title">' + esc(d.heading) + "</h2>" +
      '<p class="unpri-cta__desc">' + esc(d.text) + "</p>" +
      "</div>";

    if (btn.label) {
      html +=
        '<div class="unpri-cta__action">' +
        '<a class="unpri-cta__btn" href="' + esc(btn.href || "#") + '"' +
        (btn.target ? ' target="' + esc(btn.target) + '" rel="noopener"' : "") +
        ">" + esc(btn.label) + "</a>" +
        "</div>";
    }

    html += "</div>";
    return html;
  }

  /* ---------- boot ---------- */

  function boot() {
    load("overview.json", '[data-panel="overview"]', "Gambaran Umum", renderOverview);
    load("academics.json", '[data-panel="concentrations"]', "Akademik & Karier", renderAcademics);
    load("partners.json", '[data-panel="partners"]', "Mitra", renderPartners);
    load("lecturers.json", '[data-panel="pmu"]', "Pimpinan & Dosen", renderLecturers);
    load("news.json", '[data-panel="news"]', "Berita", renderNews);
    load("cta.json", "[data-cta]", "Ajakan Mendaftar", renderCta);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
