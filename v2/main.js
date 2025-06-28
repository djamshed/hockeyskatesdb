let allSkates = [];
let currentLevel = "";
let currentYear = 2024;

async function loadSkates() {
  const res = await fetch("skates.json");
  const data = await res.json();
  allSkates = Object.values(data).flat();
  filterSkates();

  // Check for deep-link on load
  const params = new URLSearchParams(window.location.search);
  const skateParam = params.get("skate");
  if (skateParam) {
    const skate = findSkateById(skateParam);
    if (skate) showModal(skate, false);
  }
}

function setLevel(level) {
  currentLevel = level;
  filterSkates();
}

function setYear(year) {
  currentYear = year;
  document
    .querySelectorAll(".tabs button")
    .forEach((btn) => btn.classList.remove("active"));
  if (year === 2024)
    document.getElementById("tab-2024").classList.add("active");
  else if (year === 2023)
    document.getElementById("tab-2023").classList.add("active");
  else document.getElementById("tab-older").classList.add("active");
  filterSkates();
}

function filterSkates() {
  const search = document.getElementById("search").value.toLowerCase();
  const grid = document.getElementById("skateGrid");
  grid.innerHTML = "";

  const filtered = allSkates.filter((s) => {
    const matchesLevel = !currentLevel || s.player_level === currentLevel;
    const matchesYear =
      currentYear === "older"
        ? s.release_year <= 2022
        : s.release_year === currentYear;
    const matchesSearch = s.model.toLowerCase().includes(search);
    return matchesLevel && matchesYear && matchesSearch;
  });

  for (const skate of filtered) {
    const card = document.createElement("div");
    card.className = "skate-card";
    // Prefer price, then launch_price_usd, then current_price_usd
    let price =
      skate.price || skate.launch_price_usd || skate.current_price_usd || null;
    card.innerHTML = `
      <img src="/v2/placeholder.jpg?text=${encodeURIComponent(
        skate.brand
      )}+${encodeURIComponent(skate.model)}" alt="skate">
      <h2>${skate.brand} ${skate.model}</h2>
      <p>${skate.player_level}</p>
      <p><strong>Price:</strong> ${price ? "$" + price : "—"}</p>
      <p>${getTagline(skate)}</p>
      <a href="#" class="details-link">Details</a>
    `;
    card.querySelector(".details-link").onclick = (e) => {
      e.preventDefault();
      showModal(skate, true);
    };
    grid.appendChild(card);
  }
}

function getSkateId(skate) {
  // Use the unique id field from the JSON object
  return encodeURIComponent(skate.id);
}

function findSkateById(skateId) {
  // Find by id field in allSkates
  const decodedId = decodeURIComponent(skateId);
  return allSkates.find((s) => s.id === decodedId);
}

// Modal logic
function showModal(skate, pushState = true) {
  let modal = document.getElementById("skate-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "skate-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.background = "rgba(0,0,0,0.5)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "1000";
    modal.innerHTML = `
      <div id="modal-content" style="
        background: #fff;
        padding: 32px 40px 32px 40px;
        border-radius: 14px;
        max-width: 600px;
        width: 90vw;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      ">
        <div style="position:sticky;top:0;z-index:2;background:#fff;padding-bottom:8px;">
          <h2 id="modal-title" style="margin-top:0; display:flex;align-items:center;justify-content:space-between;">
          <div></div>
          <button id="close-modal" style="
            
            background: #eee;
            border: none;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            font-size: 22px;
            cursor: pointer;
            transition: background 0.2s;
            z-index:3;
          ">&times;</button>
          </h2>
        </div>
        <div id="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector("#close-modal").onclick = () => closeModal();
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  }
  const body = modal.querySelector("#modal-body");

  // List of possible features to show
  const features = [
    { key: "player_level", label: "Player Level" },
    { key: "release_year", label: "Release Year" },
    { key: "notes", label: "Notes" },
    // Add price logic: prefer price, then launch_price_usd, then current_price_usd
    { key: "price", label: "Price", prefix: "$" },
    { key: "launch_price_usd", label: "Launch Price", prefix: "$" },
    { key: "current_price_usd", label: "Current Price", prefix: "$" },
    { key: "weight", label: "Weight", suffix: "g" },
    { key: "boot_material", label: "Boot Material" },
    { key: "blade_holder", label: "Blade Holder" },
    { key: "runner", label: "Runner" },
    { key: "fit", label: "Fit" },
    { key: "description", label: "Description" },
    { key: "player_description", label: "Beer League Expert Review" },
    // Add more keys as needed
  ];

  // When building featureList, only show the first available price
  let shownPrice = false;
  let featureList = features
    .filter((f) => {
      if (
        (f.key === "price" ||
          f.key === "launch_price_usd" ||
          f.key === "current_price_usd") &&
        shownPrice
      ) {
        return false;
      }
      if (
        (f.key === "price" ||
          f.key === "launch_price_usd" ||
          f.key === "current_price_usd") &&
        skate[f.key]
      ) {
        shownPrice = true;
        return true;
      }
      return skate[f.key];
    })
    .map((f) => {
      let value = skate[f.key];
      if (f.prefix) value = f.prefix + value;
      if (f.suffix) value = value + f.suffix;
      return `<li><strong>${f.label}:</strong> ${value}</li>`;
    })
    .join("");

  // Lower/Higher/Older/Newer model links (with model names as links)
  let modelLinks = "";
  const linkStyle = "font-weight:bold;text-decoration:underline;";

  const getModelLink = (id, label) => {
    const target = findSkateById(id);
    if (!target) return "";
    return `<span>${label}: <a href="#" id="modal-link-${label
      .replace(/\s/g, "")
      .toLowerCase()}" style="${linkStyle}">${target.brand} ${
      target.model
    }</a></span>`;
  };

  let linksArr = [];
  if (skate.newer_model)
    linksArr.push(getModelLink(skate.newer_model, "newer model"));
  if (skate.older_model)
    linksArr.push(getModelLink(skate.older_model, "older model"));
  if (skate.higher_model)
    linksArr.push(getModelLink(skate.higher_model, "higher model"));
  if (skate.lower_model)
    linksArr.push(getModelLink(skate.lower_model, "lower model"));

  if (linksArr.length) {
    modelLinks = `<div style="display:flex;flex-direction:column;gap:8px;margin:18px 0 0 0;">${linksArr.join(
      ""
    )}</div>`;
  }

  body.innerHTML = `
    <img src="/v2/placeholder.jpg?text=${encodeURIComponent(
      skate.brand
    )}+${encodeURIComponent(
    skate.model
  )}" alt="skate" style="width:220px;max-width:100%;border-radius:5px;display:block;margin:16px auto;">
    <ul style="text-align:left;">
      ${featureList}
    </ul>
    ${modelLinks}
  `;
  modal.style.display = "flex";

  // Update URL for deep-linking using id
  if (pushState) {
    const skateId = getSkateId(skate);
    window.history.pushState({ skateId }, "", `?skate=${skateId}`);
  }
  // Add event listeners for the new links
  if (skate.newer_model) {
    const newerLink = document.getElementById("modal-link-newermodel");
    if (newerLink) {
      newerLink.onclick = (e) => {
        e.preventDefault();
        const newerSkate = findSkateById(skate.newer_model);
        if (newerSkate) showModal(newerSkate, true);
      };
    }
  }
  if (skate.older_model) {
    const olderLink = document.getElementById("modal-link-oldermodel");
    if (olderLink) {
      olderLink.onclick = (e) => {
        e.preventDefault();
        const olderSkate = findSkateById(skate.older_model);
        if (olderSkate) showModal(olderSkate, true);
      };
    }
  }
  if (skate.higher_model) {
    const higherLink = document.getElementById("modal-link-highermodel");
    if (higherLink) {
      higherLink.onclick = (e) => {
        e.preventDefault();
        const higherSkate = findSkateById(skate.higher_model);
        if (higherSkate) showModal(higherSkate, true);
      };
    }
  }
  if (skate.lower_model) {
    const lowerLink = document.getElementById("modal-link-lowermodel");
    if (lowerLink) {
      lowerLink.onclick = (e) => {
        e.preventDefault();
        const lowerSkate = findSkateById(skate.lower_model);
        if (lowerSkate) showModal(lowerSkate, true);
      };
    }
  }

  modal.querySelector("h2 > div").textContent = `${skate.brand} ${skate.model}`;
}

function closeModal() {
  const modal = document.getElementById("skate-modal");
  if (modal) modal.style.display = "none";
  // Remove skate param from URL
  if (window.location.search.includes("skate=")) {
    window.history.pushState({}, "", window.location.pathname);
  }
}

function getTagline(skate) {
  if (skate.notes?.toLowerCase().includes("top-of-the-line"))
    return "Top-tier elite performance";
  if (skate.notes?.toLowerCase().includes("entry-level"))
    return "Best for new skaters";
  if (skate.notes?.toLowerCase().includes("mid-tier"))
    return "Solid option for regular players";
  return skate.notes || "";
}

loadSkates();

// Handle browser navigation and direct links
window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  const skateParam = params.get("skate");
  if (skateParam) {
    const skate = findSkateById(skateParam);
    if (skate) showModal(skate, false);
  } else {
    closeModal();
  }
});
