const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Initialize the Express app
const app = express();
const port = 8000;

// Define paths
const notesDir = path.join(__dirname, 'notes');

// Ensure the notes directory exists
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Function to read notes for a vehicle
function readNotes(vehicleId) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

// Function to write a new note for a vehicle
function writeNote(vehicleId, note) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  let notes = readNotes(vehicleId);
  notes.push(note);
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
}

// Route to list all vehicles
const vehicles = [
  { id: 'crown', brand: 'TOYOTA', model: 'CROWN SIGNIA XLE', year: 2025, miles: 1668 },
  { id: 'highlander', brand: 'TOYOTA', model: 'HIGHLANDER', year: 2022, miles: 21983 },
  { id: 'tacoma', brand: 'TOYOTA', model: 'TACOMA TRD OFFRD', year: 2023, miles: 19441 },
  { id: 'crosstrek', brand: 'SUBARU', model: 'Crosstrek', year: 2023, miles: 34854 }
];

app.get('/', (req, res) => {
  res.render('index', { vehicles });
});

// Route to get notes for a specific vehicle
app.get('/notes/:vehicleId', (req, res) => {
  const vehicleId = req.params.vehicleId;
  const notes = readNotes(vehicleId);
  res.render('notes', { vehicleId, notes });
});

// Route to add a new note
app.post('/notes/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const { note, date, odometer } = req.body;

  const newNote = {
    note: note.trim(),
    date,
    odometer: Math.round(odometer)
  };

  writeNote(vehicleId, newNote);
  res.redirect(`/notes/${vehicleId}`);
});

// Route to delete a note
app.delete('/notes/:vehicleId/:noteIndex', (req, res) => {
  const { vehicleId } = req.params;
  const noteIndex = parseInt(req.params.noteIndex, 10); // Convert to integer
  const filePath = path.join(notesDir, `${vehicleId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Notes for this vehicle not found.' });
  }

  try {
    // Read the notes from the file
    const data = fs.readFileSync(filePath, 'utf-8');
    const notes = JSON.parse(data);

    // Validate the note index
    if (isNaN(noteIndex) || noteIndex < 0 || noteIndex >= notes.length) {
      return res.status(400).json({ error: 'Invalid note index.' });
    }

    // Remove the note
    notes.splice(noteIndex, 1);

    // Write the updated notes back to the file
    fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));

    res.status(200).json({ 
      message: 'Note deleted successfully.', 
      notes 
    });
  } catch (err) {
    console.error(`Error deleting note for vehicle ${vehicleId}:`, err.message);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
