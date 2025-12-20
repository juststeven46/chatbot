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
          '<p class="message text-black" id="' + id + '">' +
          output.answer +
          '</p>';
      } else {
        // fallback kalau struktur JSON tidak cocok
        botAnswerDiv.innerHTML +=
        '<div class="message text-[17px] leading-[1.6] break-words whitespace-pre-wrap my-2" id="' + id + '">' +
        output.answer +
        '</div>';
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
// chat.js (ganti bagian auto-resize lama dengan ini)
document.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("messageInput");
  if (!textarea) {
    console.error("Textarea #messageInput tidak ditemukan!");
    return;
  }

  // Pastikan overflow hidden agar tidak muncul scrollbar saat auto-resize
  textarea.style.overflowY = "hidden";

  // Inisialisasi: reset ke auto dulu lalu ambil scrollHeight sebagai baseHeight
  textarea.style.height = "auto";
  const baseHeight = textarea.scrollHeight;

  // Set tinggi awal ke baseHeight
  textarea.style.height = baseHeight + "px";

  // Fungsi resize yang andal (pakai requestAnimationFrame agar browser reflow dulu)
  function doResize() {
    // reset ke auto supaya scrollHeight merefleksikan isi aktual
    textarea.style.height = "auto";

    // ukur di frame berikutnya (jaminan reflow)
    requestAnimationFrame(() => {
      let newHeight = textarea.scrollHeight;

      // jaga minimum = baseHeight (agar tidak menjadi lebih kecil dari awal)
      if (newHeight < baseHeight) newHeight = baseHeight;

      textarea.style.height = newHeight + "px";
    });
  }

  // Pasang listener yang relevan
  textarea.addEventListener("input", doResize);

  // juga tangani paste / cut karena mereka bisa mengubah isi asinkron
  textarea.addEventListener("paste", () => setTimeout(doResize, 0));
  textarea.addEventListener("cut", () => setTimeout(doResize, 0));

  // Jalankan sekali untuk inisialisasi
  doResize();
});
document.getElementById("attachbutton").addEventListener("click", (e) => {
  const fileInput = document.getElementById("file-input")
  e.preventDefault();
  fileInput.click();
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file){
      const fileInfo = document.getElementById("file-info");
      fileInfo.textContent = `${file.name}`;
      const container = document.getElementById("container");
      container.classList.remove('h-14');
      container.classList.add('h-20');
      container.classList.remove('rounded-full');
      container.classList.add('rounded-lg')
      const submitBtn = document.getElementById("submitbutton");
      submitBtn.classList.add('mt-8');
      submitBtn.classList.remove('rounded-full');
      submitBtn.classList.add('rounded-lg');
    }
  });

});