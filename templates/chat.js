function sendMessage() {
  const message = document.getElementById('messageInput').value;
  const botAnswerDiv = document.getElementById('answer');

  fetch('http://127.0.0.1:8080/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: message }) // key "input" harus sesuai Flask
  })
    .then((response) => {
      if (!response.ok) {
        // kalau bukan JSON valid, ambil teks biasa
        return response.text().then((text) => {
          throw new Error(`HTTP ${response.status}: ${text}`);
        });
      }
      // kalau OK, parse sebagai JSON
      return response.json();
    })
    .then((output) => {
      const id = output.id || `msg-${Date.now()}`; // id unik
      console.log("Server response:", output);     // debug di console

      if (output.error) {
        botAnswerDiv.innerHTML +=
          '<h2 class="message text-red-600" id="' + id + '">' +
          '⚠️ Error: ' + output.error +
          '</h2>';
      } else if (output.answer) {
        botAnswerDiv.innerHTML +=
          '<h2 class="message text-black" id="' + id + '">' +
          output.answer +
          '</h2>';
      } else {
        // fallback kalau struktur JSON tidak cocok
        botAnswerDiv.innerHTML +=
          '<h2 class="message" id="' + id + '">' +
          JSON.stringify(output) +
          '</h2>';
      }
    })
    .catch((error) => {
      console.error("Terjadi kesalahan:", error);
      const id = 'err-' + Date.now();
      botAnswerDiv.innerHTML +=
        '<h2 class="message text-red-500" id="' + id + '">' +
        '⚠️ Terjadi kesalahan: ' + error.message +
        '</h2>';
    });
}

document.getElementById('chat-form').addEventListener("submit", function (e) {
  e.preventDefault();
  sendMessage();
});
