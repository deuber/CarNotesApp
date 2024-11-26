// app.js

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
const vehiclesSampleFilePath = path.join(__dirname, 'vehicles.sample.json');

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
    try {
      const data = fs.readFileSync(vehiclesFilePath, 'utf-8').trim();
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading vehicles.json:', error);
      return [];
    }
  }
  return [];
}

// Utility: Write vehicles
function writeVehicles(vehicles) {
  fs.writeFileSync(vehiclesFilePath, JSON.stringify(vehicles, null, 2), 'utf-8');
}

// Utility: Read notes
function readNotes(vehicleId) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8').trim();
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading notes for vehicle ${vehicleId}:`, error);
      return [];
    }
  }
  return [];
}

// Utility: Write notes
function writeNotes(vehicleId, notes) {
  const filePath = path.join(notesDir, `${vehicleId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf-8');
}

// Ensure vehicles.json exists by copying from vehicles.sample.json or initializing empty
if (!fs.existsSync(vehiclesFilePath)) {
  const vehiclesSamplePath = path.join(__dirname, 'vehicles.sample.json');
  if (fs.existsSync(vehiclesSamplePath)) {
    try {
      const sampleVehicles = JSON.parse(fs.readFileSync(vehiclesSamplePath, 'utf-8'));
      writeVehicles(sampleVehicles);
      console.log('vehicles.json has been created from vehicles.sample.json.');
    } catch (error) {
      console.error('Error reading vehicles.sample.json:', error);
      writeVehicles([]);
      console.log('Initialized vehicles.json with an empty array due to error.');
    }
  } else {
    writeVehicles([]);
    console.log('vehicles.sample.json not found. Initialized vehicles.json with an empty array.');
  }
}

// Route: Home page
app.get('/', (req, res) => {
  const vehicles = readVehicles();

  // For each vehicle, find the max cost from its notes
  const vehiclesWithMaxCost = vehicles.map(vehicle => {
    const notes = readNotes(vehicle.id);
    const maxCost = notes.reduce((max, note) => {
      const cost = parseFloat(note.cost) || 0;
      return cost > max ? cost : max;
    }, 0);
    return { ...vehicle, maxCost };
  });

  res.render('index', { vehicles: vehiclesWithMaxCost });
});

// Route: Fetch maintenance data for a vehicle
app.get('/maintenance/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;
  const notes = readNotes(vehicleId);

  let cumulativeCost = 0;
  let maxCost = 0;

  const maintenanceData = notes.map(note => {
    const cost = parseFloat(note.cost) || 0;
    if (cost > maxCost) {
      maxCost = cost;
    }
    cumulativeCost += cost;
    return {
      note: note.note,
      date: note.date,
      odometer: note.odometer,
      cost: cumulativeCost.toFixed(2),
    };
  });

  res.json({ maintenanceData, maxCost: maxCost.toFixed(2) });
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
  notes.push({
    note,
    date,
    odometer: parseInt(odometer, 10),
    cost: cost ? parseFloat(cost).toFixed(2) : null,
  });
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
    cost: parseFloat(cost).toFixed(2), // Ensure cost is formatted as a float
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
