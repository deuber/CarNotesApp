const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const methodOverride = require('method-override');

const app = express();
const port = 8080;

// Define paths
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

// Route: Home page
app.get('/', (req, res) => {
  const vehicles = readVehicles();
  res.render('index', { vehicles });
});

// Route: Fetch maintenance data for a vehicle
app.get('/maintenance/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const filePath = path.join(notesDir, `${vehicleId}.json`);

  if (fs.existsSync(filePath)) {
    const notes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const maintenanceData = notes.map(note => ({
      date: note.date,
      miles: note.odometer,
      service: note.note
    }));
    res.json(maintenanceData);
  } else {
    res.json([]); // Return an empty array if no data is found
  }
});

// Route: Notes page
app.get('/notes/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const filePath = path.join(notesDir, `${vehicleId}.json`);

  if (fs.existsSync(filePath)) {
    const notes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.render('notes', { vehicleId, notes });
  } else {
    res.render('notes', { vehicleId, notes: [] });
  }
});

// Route: Add a note
app.post('/notes/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const { note, date, odometer } = req.body;

  if (!note || !date || isNaN(odometer)) {
    return res.status(400).send('Invalid input');
  }

  const filePath = path.join(notesDir, `${vehicleId}.json`);
  const notes = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : [];

  notes.push({ note, date, odometer: parseInt(odometer, 10) });
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));

  res.redirect(`/notes/${vehicleId}`);
});

// Route: Delete a note
app.delete('/notes/:vehicleId/:index', (req, res) => {
  const { vehicleId, index } = req.params;
  const filePath = path.join(notesDir, `${vehicleId}.json`);

  if (fs.existsSync(filePath)) {
    const notes = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    notes.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
    res.status(200).send('Note deleted');
  } else {
    res.status(404).send('Notes file not found');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
