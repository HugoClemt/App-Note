/* use std::fs::File;
use std::io::Write;
use std::io::Read; */

use rusqlite::{Connection, Result};

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct Note {
    id: i32,
    title: String,
    text: String,
}

fn main() {
    let conn = Connection::open("notes.db").expect("Failed to open database");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            text TEXT NOT NULL
        )",
        [],
    )
    .expect("Failed to create table");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_note, read_note, update_note, delete_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn save_note(title: String, text: String) -> Result<(), String> {
    let conn = Connection::open("notes.db").expect("Failed to open database");
    conn.execute(
        "INSERT INTO notes (title, text) VALUES (?1, ?2)",
        &[&title, &text],
    )
    .map_err(|e| format!("Failed to save note: {}", e))?;
    Ok(())
}

#[tauri::command]
fn read_note() -> Result<Vec<Note>, String> {
    let conn = Connection::open("notes.db").expect("Failed to open database");
    let mut stmt = conn
        .prepare("SELECT id, title, text FROM notes")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let note_iter = stmt
        .query_map([], |row| Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            text: row.get(2)?,
        }))
        .map_err(|e| format!("Failed to query notes: {}", e))?;

    let mut notes = Vec::new();
    for note_result in note_iter {
        let note = note_result.map_err(|e| format!("Failed to retrieve note: {}", e))?;
        notes.push(note);
    }
    Ok(notes)
}

#[tauri::command]
fn update_note(id: i32, title: String, text: String) -> Result<(), String> {
    let conn = Connection::open("notes.db").expect("Failed to open database");
    conn.execute(
        "UPDATE notes SET title = ?1, text = ?2 WHERE id = ?3",
        &[&title, &text, &id.to_string()],
    )
    .map_err(|e| format!("Failed to update note: {}", e))?;
    Ok(())
}

#[tauri::command]
fn delete_note(id: i32) -> Result<(), String> {
    let conn = Connection::open("notes.db").expect("Failed to open database");
    conn.execute("DELETE FROM notes WHERE id = ?1", &[&id])
        .map_err(|e| format!("Failed to delete note: {}", e))?;
    Ok(())
}