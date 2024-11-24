const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const methodOverride = require('method-override');

// Initialize the Express app
const app = express();
const port = 8080;

// Define file paths
const notesDir = path.join(__dirname, 'notes');
const vehiclesFilePath = path.join(__dirname, 'vehicles.json');

// Ensure the notes directory exists
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Utility: Read vehicles
function readVehicles() {
  if (fs.existsSync(vehiclesFilePath)) {
    return JSON.parse(fs.readFileSync(vehiclesFilePath, 'utf-8'));
  }
  return [];
}

// Utility: Write vehicles
function writeVehicles(vehicles) {
  fs.writeFileSync(vehiclesFilePath, JSON.stringify(vehicles, null, 2));
}

// Utility: Read notes
function readNotes(vehicleId) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return [];
}

// Utility: Write notes
function writeNotes(vehicleId, notes) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
}

// Ensure vehicles.json exists with initial data
if (!fs.existsSync(vehiclesFilePath)) {
  const initialVehicles = [
    { id: 'crown', brand: 'TOYOTA', model: 'CROWN SIGNIA XLE', year: 2025, miles: 1668 },
    { id: 'highlander', brand: 'TOYOTA', model: 'HIGHLANDER', year: 2022, miles: 21983 },
    { id: 'tacoma', brand: 'TOYOTA', model: 'TACOMA TRD OFFRD', year: 2023, miles: 19441 },
    { id: 'crosstrek', brand: 'SUBARU', model: 'Crosstrek', year: 2023, miles: 34854 }
  ];
  writeVehicles(initialVehicles);
}

// Route: Home page
app.get('/', (req, res) => {
  const vehicles = readVehicles();
  res.render('index', { vehicles });
});

// Route: Fetch maintenance data for a vehicle
app.get('/maintenance/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const notes = readNotes(vehicleId);
  const maintenanceData = notes.map(note => ({
    date: note.date,
    miles: note.odometer,
    service: note.note,
  }));
  res.json(maintenanceData);
});

// Route: Notes page
app.get('/notes/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const notes = readNotes(vehicleId);
  res.render('notes', { vehicleId, notes });
});

// Route: Add a new note
app.post('/notes/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const { note, date, odometer } = req.body;

  if (!note || !date || isNaN(odometer)) {
    return res.status(400).send('Invalid note data.');
  }

  const notes = readNotes(vehicleId);
  notes.push({ note, date, odometer: parseInt(odometer, 10) });
  writeNotes(vehicleId, notes);

  res.redirect(`/notes/${vehicleId}`);
});

// Route: Edit a note (render edit form)
app.get('/notes/:vehicleId/edit/:index', (req, res) => {
  const { vehicleId, index } = req.params;
  const notes = readNotes(vehicleId);

  if (!notes[index]) {
    return res.status(404).send('Note not found.');
  }

  res.render('editNote', { vehicleId, index, note: notes[index] });
});

// Route: Update a note
app.put('/notes/:vehicleId/:index', (req, res) => {
  const { vehicleId, index } = req.params;
  const { note, date, odometer } = req.body;

  if (!note || !date || isNaN(odometer)) {
    return res.status(400).send('Invalid note data.');
  }

  const notes = readNotes(vehicleId);

  if (!notes[index]) {
    return res.status(404).send('Note not found.');
  }

  notes[index] = { note, date, odometer: parseInt(odometer, 10) };
  writeNotes(vehicleId, notes);

  res.redirect(`/notes/${vehicleId}`);
});

// Route: Delete a note
app.delete('/notes/:vehicleId/:index', (req, res) => {
  const { vehicleId, index } = req.params;
  const notes = readNotes(vehicleId);

  if (!notes[index]) {
    return res.status(404).send('Note not found.');
  }

  notes.splice(index, 1);
  writeNotes(vehicleId, notes);

  res.status(200).json({ message: 'Note deleted successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
