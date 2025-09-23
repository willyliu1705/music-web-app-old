function isLikelyUrl(text) {
    return /^https?:\/\//i.test(text);
}

function renderList(container, title, items) {
    container.innerHTML = `
    <h3>${title}</h3>
    <ul>${items.map((s) => `<li>${s}</li>`).join("")}</ul>
  `;
}

// Deduplicate by track name (case-insensitive), keep iTunes' popularity order
function uniqueByTrackName(results, limit = 10) {
    const seen = new Set();
    const picked = [];
    for (const r of results) {
        const key = (r.trackName || "").trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        picked.push(r);
        if (picked.length >= limit) break;
    }
    return picked;
}

// ===== Artist → Top Songs via iTunes Search API =====
async function getTopSongsByArtist(artist, limit = 10) {
    const endpoint = new URL("https://itunes.apple.com/search");
    endpoint.searchParams.set("term", artist);
    endpoint.searchParams.set("entity", "song");
    endpoint.searchParams.set("attribute", "artistTerm");
    endpoint.searchParams.set("limit", String(Math.max(limit * 3, 25)));

    const res = await fetch(endpoint.toString());
    if (!res.ok) {
        throw new Error(`iTunes API error: ${res.status}`);
    }
    const data = await res.json();

    const artistLower = artist.trim().toLowerCase();
    const filtered = data.results.filter((r) =>
        (r.artistName || "").trim().toLowerCase().includes(artistLower)
    );

    const topUnique = uniqueByTrackName(filtered.length ? filtered : data.results, limit);
    return topUnique.map((r) => ({
        artist: r.artistName,
        track: r.trackName,
        album: r.collectionName,
        previewUrl: r.previewUrl,
        storeUrl: r.trackViewUrl
    }));
}

// ===== Music Suggestion Functions =====

// Suggest based on text (artist name OR a link)
async function suggestMusic() {
    const inputEl = document.getElementById("songInput");
    const resultsDiv = document.getElementById("results");
    const song = inputEl.value.trim();

    if (song === "") {
        resultsDiv.innerHTML = "<p style='color:red;'>Please enter a song name or link.</p>";
        return;
    }

    if (isLikelyUrl(song)) {
        const suggestions = [
            `${song} (Remix)`,
            `${song} - Acoustic Version`,
            `Songs similar to ${song} by Artist X`,
            `If you like ${song}, try Track Y`
        ];
        renderList(resultsDiv, `Suggestions for "${song}":`, suggestions);
        return;
    }

    resultsDiv.innerHTML = `<p>Searching top songs for <strong>${song}</strong>…</p>`;

    try {
        const top = await getTopSongsByArtist(song, 10);
        if (top.length === 0) {
            resultsDiv.innerHTML = `<p>No songs found for artist: <strong>${song}</strong>.</p>`;
            return;
        }

        const items = top.map((t, idx) => {
            const parts = [`${idx + 1}. <strong>${t.track}</strong> — ${t.artist}`];
            if (t.album) parts.push(`(<em>${t.album}</em>)`);
            const links = [];
            if (t.previewUrl) links.push(`<a href="${t.previewUrl}" target="_blank" rel="noopener">Preview</a>`);
            if (t.storeUrl) links.push(`<a href="${t.storeUrl}" target="_blank" rel="noopener">iTunes</a>`);
            if (links.length) parts.push(" — " + links.join(" | "));
            return parts.join(" ");
        });

        renderList(resultsDiv, `Most popular songs by “${song}”`, items);
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `<p style="color:red;">Error fetching songs for “${song}”. Please try again.</p>`;
    }
}

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
    setTimeout(() => {
        splash.classList.add("fade-out");
        setTimeout(() => (splash.style.display = "none"), 800);
    }, 700);
});
