let skateData = {};
fetch("skates.json")
  .then((res) => res.json())
  .then((data) => {
    skateData = data;
    checkPathForSkate();
    enableSkateLinks();
  });

function enableSkateLinks() {
  document.querySelectorAll(".model a").forEach((link) => {
    link.addEventListener("click", function (e) {
      const match = link.pathname.match(/^\/skate\/([a-zA-Z0-9\-]+)$/);
      if (match) {
        e.preventDefault();
        const skateId = match[1];
        if (skateId && skateData[skateId]) {
          showSkateDetail(skateData[skateId]);
          window.history.pushState({ skateId }, "", `/skate/${skateId}`);
        }
      }
    });
  });
}

function showSkateDetail(skate) {
  const dialog = document.getElementById("skate-detail-dialog");
  const content = document.getElementById("skate-detail-content");
  content.innerHTML = `
    <h2 style="margin-top:0">${skate.brand ? skate.brand + " " : ""}${
    skate.model || ""
  }</h2>
    <ul style="text-align:left;">
      ${
        skate.release_year
          ? `<li><strong>Year:</strong> ${skate.release_year}</li>`
          : ""
      }
      ${
        skate.player_level
          ? `<li><strong>Level:</strong> ${skate.player_level}</li>`
          : ""
      }
      ${
        skate.launch_price_usd
          ? `<li><strong>Launch Price:</strong> $${skate.launch_price_usd}</li>`
          : ""
      }
      ${
        skate.current_price_usd
          ? `<li><strong>Current Price:</strong> $${skate.current_price_usd}</li>`
          : ""
      }
      ${skate.notes ? `<li><strong>Notes:</strong> ${skate.notes}</li>` : ""}
      ${
        skate.description
          ? `<li><strong>Description:</strong> ${skate.description}</li>`
          : ""
      }
      ${
        skate.player_description
          ? `<li><strong>Review:</strong> ${skate.player_description}</li>`
          : ""
      }
      ${
        skate.boot_material
          ? `<li><strong>Boot Material:</strong> ${skate.boot_material}</li>`
          : ""
      }
      ${
        skate.blade_holder
          ? `<li><strong>Blade Holder:</strong> ${skate.blade_holder}</li>`
          : ""
      }
      ${
        skate.steel_type
          ? `<li><strong>Steel Type:</strong> ${skate.steel_type}</li>`
          : ""
      }
      ${
        skate.fit_options
          ? `<li><strong>Fit Options:</strong> ${skate.fit_options}</li>`
          : ""
      }
      ${
        skate.key_features
          ? `<li><strong>Key Features:</strong> ${skate.key_features}</li>`
          : ""
      }
    </ul>
  `;
  dialog.showModal();
}

function closeSkateDialog() {
  const dialog = document.getElementById("skate-detail-dialog");
  if (dialog && dialog.open) dialog.close();
}

// Check path for /skate/ID and show/hide dialog accordingly
function checkPathForSkate() {
  const match = window.location.pathname.match(/^\/skate\/([a-zA-Z0-9\-]+)$/);
  const skateId = match ? match[1] : null;
  if (skateId && skateData[skateId]) {
    showSkateDetail(skateData[skateId]);
  } else {
    closeSkateDialog();
  }
}

// Listen for browser navigation (back/forward) and on page load
window.addEventListener("popstate", checkPathForSkate);
window.addEventListener("DOMContentLoaded", checkPathForSkate);

// Close dialog button
window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("close-skate-detail").onclick = function () {
    closeSkateDialog();
    // Remove /skate/... from URL
    if (window.location.pathname.startsWith("/skate/")) {
      window.history.pushState({}, "", "/");
    }
  };
});
