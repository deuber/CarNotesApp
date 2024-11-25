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

  let cumulativeCost = 0;
  const maintenanceData = notes.map(note => {
    cumulativeCost += parseFloat(note.cost) || 0; // Add cost to cumulative total
    return {
      miles: note.odometer,
      cost: cumulativeCost, // Use cumulative cost
      service: note.note,
      date: note.date,
    };
  });

  res.json(maintenanceData);
});


// Route: Notes page
app.get('/notes/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const notes = readNotes(vehicleId);
  res.render('notes', { vehicleId, notes });
});

// Route: Add a new vehicle
app.post('/vehicles', (req, res) => {
  const { id, brand, model, year, miles } = req.body;

  // Validate input
  if (!id || !brand || !model || isNaN(year) || isNaN(miles) || year < 1900 || miles < 0) {
    return res.status(400).send('Invalid vehicle data.');
  }

  const vehicles = readVehicles();

  // Check if a vehicle with the same ID already exists
  if (vehicles.some(vehicle => vehicle.id === id)) {
    return res.status(400).send('A vehicle with this ID already exists.');
  }

  // Create a new vehicle object
  const newVehicle = {
    id,
    brand,
    model,
    year: parseInt(year, 10),
    miles: parseInt(miles, 10),
  };

  // Add the new vehicle to the array
  vehicles.push(newVehicle);

  // Save the updated vehicle list
  writeVehicles(vehicles);

  // Redirect back to the homepage
  res.redirect('/');
});


// Route: Edit a note (render edit form)
app.get('/notes/:vehicleId/edit/:index', (req, res) => {
  const { vehicleId, index } = req.params;
  const notes = readNotes(vehicleId);

  // Validate index
  if (!notes[index]) {
    return res.status(404).send('Note not found.');
  }

  res.render('editNote', { vehicleId, index, note: notes[index] });
});

// Route: Delete a note
app.delete('/notes/:vehicleId/:index', (req, res) => {
  const { vehicleId, index } = req.params;
  const notes = readNotes(vehicleId);

  // Validate index
  if (!notes[index]) {
    return res.status(404).send('Note not found.');
  }

  // Remove the note
  notes.splice(index, 1);
  writeNotes(vehicleId, notes);

  // Redirect to the notes page
  res.redirect(`/notes/${vehicleId}`);
});


// Route: Add a new note
app.post('/notes/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const { note, date, odometer, cost } = req.body;

  if (!note || !date || isNaN(odometer)) {
    return res.status(400).send('Invalid note data.');
  }

  const notes = readNotes(vehicleId);
  notes.push({ note, date, odometer: parseInt(odometer, 10), cost: cost ? parseFloat(cost).toFixed(2) : null });
  writeNotes(vehicleId, notes);

  res.redirect(`/notes/${vehicleId}`);
});

// Route: Update a note
app.put('/notes/:vehicleId/:index', (req, res) => {
  const { vehicleId, index } = req.params;
  const { note, date, odometer, cost } = req.body;

  // Validate input
  if (!note || !date || isNaN(odometer) || isNaN(cost)) {
    return res.status(400).send('Invalid note data.');
  }

  const notes = readNotes(vehicleId);

  // Validate index
  if (!notes[index]) {
    return res.status(404).send('Note not found.');
  }

  // Update the note
  notes[index] = {
    note,
    date,
    odometer: parseInt(odometer, 10),
    cost: parseFloat(cost).toFixed(2) // Ensure cost is formatted as a float
  };

  // Save the updated notes
  writeNotes(vehicleId, notes);

  // Redirect to the notes page
  res.redirect(`/notes/${vehicleId}`);
});

// Route: Update vehicle mileage
app.post('/update-miles/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const { miles } = req.body;

  if (isNaN(miles) || miles < 0) {
    return res.status(400).send('Invalid mileage value.');
  }

  const vehicles = readVehicles();
  const vehicle = vehicles.find(v => v.id === vehicleId);

  if (vehicle) {
    vehicle.miles = parseInt(miles, 10);
    writeVehicles(vehicles);
    res.redirect('/');
  } else {
    res.status(404).send('Vehicle not found.');
  }
});

// Route: Add a new vehicle
app.post('/vehicles', (req, res) => {
  const { id, brand, model, year, miles } = req.body;

  if (!id || !brand || !model || isNaN(year) || isNaN(miles) || year < 1900 || miles < 0) {
    return res.status(400).send('Invalid vehicle data.');
  }

  const vehicles = readVehicles();
  if (vehicles.some(vehicle => vehicle.id === id)) {
    return res.status(400).send('A vehicle with this ID already exists.');
  }

  const newVehicle = { id, brand, model, year: parseInt(year, 10), miles: parseInt(miles, 10) };
  vehicles.push(newVehicle);
  writeVehicles(vehicles);

  res.redirect('/');
});

// Route: Delete a vehicle
app.delete('/vehicles/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;

  const vehicles = readVehicles();
  const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);

  if (updatedVehicles.length === vehicles.length) {
    return res.status(404).send('Vehicle not found.');
  }

  writeVehicles(updatedVehicles);

  const notesFilePath = path.join(notesDir, `${vehicleId}.json`);
  if (fs.existsSync(notesFilePath)) {
    fs.unlinkSync(notesFilePath);
  }

  res.redirect('/');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
