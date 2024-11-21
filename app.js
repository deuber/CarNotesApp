const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const methodOverride = require('method-override');

// Initialize the Express app
const app = express();
const port = 8000;

// Define paths
const notesDir = path.join(__dirname, 'notes');
const vehiclesFilePath = path.join(__dirname, 'vehicles.json');

// Ensure the notes directory exists
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(methodOverride('_method')); // Support DELETE/PUT methods
app.set('view engine', 'ejs'); // Set EJS as the templating engine

// Utility: Read vehicle data
function readVehicles() {
  try {
    if (fs.existsSync(vehiclesFilePath)) {
      const data = fs.readFileSync(vehiclesFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading vehicles file:', err);
  }
  return [];
}

// Utility: Write vehicle data
function writeVehicles(vehicles) {
  fs.writeFileSync(vehiclesFilePath, JSON.stringify(vehicles, null, 2));
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

// Dynamic vehicle data
let vehicles = readVehicles();

// Utility: Read notes
function readNotes(vehicleId) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

// Utility: Write notes
function writeNote(vehicleId, note) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  let notes = readNotes(vehicleId);
  notes.push(note);
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
}

// Route: List all vehicles
app.get('/', (req, res) => {
  res.render('index', { vehicles });
});

// Route: Add a new vehicle
app.post('/vehicles', (req, res) => {
  const { id, brand, model, year, miles } = req.body;

  // Validate input
  if (!id || !brand || !model || isNaN(year) || isNaN(miles) || year < 1900 || miles < 0) {
    return res.status(400).json({ error: 'Invalid vehicle data.' });
  }

  // Check if vehicle ID already exists
  if (vehicles.some(v => v.id === id)) {
    return res.status(400).json({ error: 'Vehicle ID already exists.' });
  }

  // Add the new vehicle
  const newVehicle = { id, brand, model, year: parseInt(year, 10), miles: parseInt(miles, 10) };
  vehicles.push(newVehicle);
  writeVehicles(vehicles);

  res.redirect('/');
});

// Route: Delete a vehicle
app.delete('/vehicles/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;

  // Filter out the vehicle
  vehicles = vehicles.filter(v => v.id !== vehicleId);
  writeVehicles(vehicles);

  // Remove notes for the deleted vehicle
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  res.redirect('/');
});

// Route: Get notes for a specific vehicle
app.get('/notes/:vehicleId', (req, res) => {
  const vehicleId = req.params.vehicleId;
  const notes = readNotes(vehicleId);
  res.render('notes', { vehicleId, notes });
});

// Route: Add a note to a vehicle
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

// Route: Update mileage for a specific vehicle
app.post('/update-miles/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const { miles } = req.body;

  // Find vehicle
  const vehicle = vehicles.find(v => v.id === vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found.' });
  }

  // Validate mileage
  const updatedMiles = parseInt(miles, 10);
  if (isNaN(updatedMiles) || updatedMiles < 0) {
    return res.status(400).json({ error: 'Invalid mileage value.' });
  }

  // Update mileage
  vehicle.miles = updatedMiles;
  writeVehicles(vehicles);

  res.redirect('/');
});

// Route: Delete a specific note
app.delete('/notes/:vehicleId/:noteIndex', (req, res) => {
  const { vehicleId } = req.params;
  const noteIndex = parseInt(req.params.noteIndex, 10);
  const filePath = path.join(notesDir, `${vehicleId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Notes for this vehicle not found.' });
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const notes = JSON.parse(data);

    // Validate note index
    if (isNaN(noteIndex) || noteIndex < 0 || noteIndex >= notes.length) {
      return res.status(400).json({ error: 'Invalid note index.' });
    }

    // Remove note and update file
    notes.splice(noteIndex, 1);
    fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));

    res.redirect(`/notes/${vehicleId}`);
  } catch (err) {
    console.error(`Error deleting note for vehicle ${vehicleId}:`, err.message);
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
