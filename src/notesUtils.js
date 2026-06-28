const NOTES_KEY = "videoNotes";

const getAllNotes = () => {
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : {};
};

export const getNotesForVideo = (videoId) => {
  const allNotes = getAllNotes();
  return allNotes[videoId] || [];
};

export const addNote = (videoId, text) => {
  const allNotes = getAllNotes();
  const videoNotes = allNotes[videoId] || [];

  const newNote = {
    id: Date.now().toString(),
    text: text,
    createdAt: new Date().toISOString(),
  };

  allNotes[videoId] = [newNote, ...videoNotes];
  localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
  return allNotes[videoId];
};

export const deleteNote = (videoId, noteId) => {
  const allNotes = getAllNotes();
  const videoNotes = allNotes[videoId] || [];
  allNotes[videoId] = videoNotes.filter((note) => note.id !== noteId);
  localStorage.setItem(NOTES_KEY, JSON.stringify(allNotes));
  return allNotes[videoId];
};