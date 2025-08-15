let skateData = {};
fetch("skates.json")
  .then((res) => res.json())
  .then((data) => {
    skateData = data;
    markClickableModels();
    checkHashForSkate();
    enableSkateClicks();
  });

// Add .clickable to .model if id exists in skates.json
function markClickableModels() {
  document.querySelectorAll(".model").forEach((el) => {
    const skateId = el.id;
    if (skateId && skateData[skateId]) {
      el.classList.add("clickable");
    }
  });
}

// Listen for clicks on .model.clickable and update hash
function enableSkateClicks() {
  document.querySelectorAll(".model.clickable").forEach((el) => {
    el.addEventListener("click", function () {
      window.location.hash = `#skate/${el.id}`;
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
    ${skate.notes ? `<p style="font-style: italic;">${skate.notes}</p>` : ""}
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
        skate.key_features
          ? `<li><strong>Key Features:</strong> ${skate.key_features}</li>`
          : ""
      }
      ${
        skate.description
          ? `<li><strong>Description:</strong> ${skate.description}</li>`
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
        skate.player_description
          ? `<li><strong>Our opinion:</strong> ${skate.player_description}</li>`
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

function checkHashForSkate() {
  const hash = window.location.hash;
  const match = hash.match(/^#skate\/([a-zA-Z0-9\-]+)/);
  const skateId = match ? match[1] : null;
  if (skateId && skateData[skateId]) {
    showSkateDetail(skateData[skateId]);
  } else {
    closeSkateDialog();
  }
}

window.addEventListener("hashchange", checkHashForSkate);
window.addEventListener("DOMContentLoaded", checkHashForSkate);

window.addEventListener("DOMContentLoaded", function () {
  document.getElementById("close-skate-detail").onclick = function () {
    closeSkateDialog();
    // Remove hash from URL
    if (window.location.hash.startsWith("#skate/")) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  };
});

// Add this after your other event listeners:
window.addEventListener("DOMContentLoaded", function () {
  const dialog = document.getElementById("skate-detail-dialog");

  // Close dialog when clicking outside the modal content
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      closeSkateDialog();
      if (window.location.hash.startsWith("#skate/")) {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    }
  });

  // Close dialog and clear hash when pressing ESC
  dialog.addEventListener("close", function () {
    if (window.location.hash.startsWith("#skate/")) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  });
});

// Add this function to your skates.js for development/testing only
function testAllSkateLinks() {
  const links = Array.from(document.querySelectorAll(".model a"));
  const dialog = document.getElementById("skate-detail-dialog");
  let failed = [];

  function testLink(i) {
    if (i >= links.length) {
      if (failed.length === 0) {
        console.log("All links opened the dialog successfully!");
      } else {
        console.warn("Links that failed to open the dialog:", failed);
      }
      closeSkateDialog();
      return;
    }
    const link = links[i];
    // Simulate click
    link.click();
    setTimeout(() => {
      // Check if dialog is open and has content
      if (
        !dialog.open ||
        !dialog.querySelector("h2") ||
        !dialog.querySelector("h2").textContent.trim()
      ) {
        console.warn(`Link ${link.href} did not open the dialog correctly.`);
        failed.push(link.href);
      }
      closeSkateDialog();
      setTimeout(() => testLink(i + 1), 200); // Small delay between tests
    }, 300); // Wait for dialog to render
  }

  testLink(0);
}

// Video Modal Functions
function openVideo(videoUrl) {
  const videoModal = document.getElementById("video-modal");
  const videoContent = document.getElementById("video-content");

  if (videoModal && videoContent) {
    videoContent.innerHTML = `
      <video 
        width="100%" 
        height="auto" 
        controls 
        autoplay
        style="display: block; max-height: 70vh; border-radius: 14px;">
        <source src="${videoUrl}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
    videoModal.showModal();
  }
}

function closeVideoModal() {
  const videoModal = document.getElementById("video-modal");
  const videoContent = document.getElementById("video-content");
  if (videoModal && videoModal.open) {
    // Stop video playback by clearing content
    if (videoContent) {
      videoContent.innerHTML = "";
    }
    videoModal.close();
  }
}

// Event listeners for video modal
window.addEventListener("DOMContentLoaded", function () {
  const closeVideoBtn = document.getElementById("close-video");
  if (closeVideoBtn) {
    closeVideoBtn.addEventListener("click", closeVideoModal);
  }

  // Close video modal when clicking outside
  const videoModal = document.getElementById("video-modal");
  if (videoModal) {
    videoModal.addEventListener("click", function (e) {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });

    // Close video modal when pressing ESC
    videoModal.addEventListener("close", function () {
      closeVideoModal();
    });
  }
});
