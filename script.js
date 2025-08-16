// ===== Music Suggestion Functions =====

// Suggest based on song name or link
function suggestMusic() {
    const song = document.getElementById("songInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (song === "") {
        resultsDiv.innerHTML = "<p style='color:red;'>Please enter a song name or link.</p>";
        return;
    }

    // Placeholder example
    const suggestions = [
        `${song} (Remix)`,
        `${song} - Acoustic Version`,
        `Songs similar to ${song} by Artist X`,
        `If you like ${song}, try Track Y`
    ];

    resultsDiv.innerHTML = `<h3>Suggestions for "${song}":</h3><ul>` +
        suggestions.map(s => `<li>${s}</li>`).join("") +
        `</ul>`;
}

// Suggest based on uploaded audio file
function suggestFromFile() {
    const fileInput = document.getElementById("audioInput");
    const resultsDiv = document.getElementById("results");

    if (fileInput.files.length === 0) {
        resultsDiv.innerHTML = "<p style='color:red;'>Please upload an audio file.</p>";
        return;
    }

    const file = fileInput.files[0];
    resultsDiv.innerHTML = `<p>Analyzing file: <strong>${file.name}</strong>... (placeholder suggestions)</p>`;
}

// ===== Splash Screen Functionality =====
window.addEventListener("load", () => {
    const splash = document.getElementById("splash");

    // Wait 2 seconds (2000ms) before starting the fade
    setTimeout(() => {
        splash.classList.add("fade-out");

        // Remove splash after fade completes (matches CSS)
        setTimeout(() => splash.style.display = "none", 800);
    }, 800); // <-- change 2000 to longer/shorter time in ms
});
