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
  if (fs.existsSync(vehiclesFilePath)) {
    const data = fs.readFileSync(vehiclesFilePath, 'utf-8');
    return JSON.parse(data);
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
    { id: 'crown', brand: 'TOYOTA', model: 'CROWN SIGNIA XLE', year: 2025, miles: 1670 },
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
  const notes = readNotes(vehicleId);
  notes.push(note);
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { vehicles });
});

app.post('/vehicles', (req, res) => {
  const { id, brand, model, year, miles } = req.body;

  if (!id || !brand || !model || isNaN(year) || isNaN(miles) || year < 1900 || miles < 0) {
    return res.status(400).json({ error: 'Invalid vehicle data.' });
  }

  if (vehicles.some(v => v.id === id)) {
    return res.status(400).json({ error: 'Vehicle ID already exists.' });
  }

  const newVehicle = { id, brand, model, year: parseInt(year, 10), miles: parseInt(miles, 10) };
  vehicles.push(newVehicle);
  writeVehicles(vehicles);

  res.redirect('/');
});

app.delete('/vehicles/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;

  vehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
  writeVehicles(vehicles);

  const notesFilePath = path.join(notesDir, `${vehicleId}.json`);
  if (fs.existsSync(notesFilePath)) {
    fs.unlinkSync(notesFilePath);
  }

  res.redirect('/');
});

// Other existing routes for notes and mileage updating go here

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
