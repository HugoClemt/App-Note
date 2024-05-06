const { invoke } = window.__TAURI__.tauri;

async function save_note(title, text) {
  await invoke("save_note", { title: title, text: text });
  document.getElementById("title").value = "";
  document.getElementById("text").value = "";
  fetchNote();
}

async function update_note(id, newNote) {
  await invoke("update_note", { id: id, new_note: newNote });
  fetchNote();
}

async function delete_note(id) {
  await invoke("delete_note", id);
  fetchNote();
}

async function fetchNote() {
  const notes = await invoke("read_note");
  const notesBody = document.querySelector("#notes-body");

  notes.forEach((note) => {
    const tr = document.createElement("tr");

    const idTd = document.createElement("td");
    idTd.textContent = note.id;
    tr.appendChild(idTd);

    const titleTd = document.createElement("td");
    titleTd.textContent = note.title;
    tr.appendChild(titleTd);

    const actionsTd = document.createElement("td");
    const readBtn = document.createElement("button");
    readBtn.textContent = "Read";
    readBtn.addEventListener("click", () => {
      document.querySelector("#title").value = note.title;
      document.querySelector("#text").value = note.text;
      console.log("Read clicked for note:", note);
    });
    actionsTd.appendChild(readBtn);

    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";
    updateBtn.classList.add("update-note");
    updateBtn.setAttribute("data-id", note.id);
    updateBtn.addEventListener("click", () => {
      const noteId = parseInt(updateBtn.getAttribute("data-id"), 10); 
      const newTitle = document.querySelector("#title").value;
      const newText = document.querySelector("#text").value;
      const newNote = { title: newTitle, text: newText };
      update_note(noteId, {title: newTitle, text: newText});
    });
    actionsTd.appendChild(updateBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      await delete_note(note.id);
      fetchNote();
    });
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);
    notesBody.appendChild(tr);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#greet-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = document.querySelector("#text").value;
    const title = document.querySelector("#title").value;
    save_note(title, text);
    fetchNote();


    const updateButtons = document.querySelectorAll(".update-note");
    updateButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const noteId = parseInt(updateBtn.getAttribute("data-id"), 10); 
        const newTitle = document.querySelector("#title").value;
        const newText = document.querySelector("#text").value;
        await update_note(noteId, newTitle, newText);
      });
    });
  });
});
