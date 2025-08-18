async function suggestMusic() {
  const artistName = document.getElementById("songInput").value;

    const response = await fetch("http://localhost:3000/search", {  // <-- make sure this points to backend
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ artist: artistName }),
  });

  const data = await response.json();

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (data.error) {
    resultsDiv.innerHTML = `<p>${data.error}</p>`;
  } else {
    resultsDiv.innerHTML = `<h3>Top Tracks for ${data.artist}</h3>`;
    const ul = document.createElement("ul");
    data.songs.forEach((song) => {
      const li = document.createElement("li");
      li.textContent = song;
      ul.appendChild(li);
    });
    resultsDiv.appendChild(ul);
  }
}