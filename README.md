# CarNotesApp

CarNotesApp is a simple web application designed to track maintenance notes for multiple vehicles. This app was created to solve a specific problem where the SmartCar API no longer allowed free access to manage multiple vehicles, limiting its usefulness for tracking all vehicle data. 

This app provides a straightforward and free solution to maintain a central place for all car maintenance records.

![Demo Image](https://raw.githubusercontent.com/deuber/CarNotesApp/main/My-Vehicles-demo.png)

![Folder Image](https://raw.githubusercontent.com/deuber/CarNotesApp/main/folderView.png)
---

## Features
- Add notes for vehicle maintenance (e.g., oil changes, tire replacements).
- View all maintenance notes for each vehicle.
- Delete notes when no longer needed.
- Works entirely offline with no external API dependencies.

---

## Why It Was Created
Originally, I used the SmartCar API to track vehicle data, but the free plan allowed access to only one vehicle. Since I wanted a free tool that could handle multiple vehicles, I decided to create this simple application to meet my needs without ongoing costs.

---

## How to Run the App
1. Clone the repository:

   git clone https://github.com/deuber/CarNotesApp.git

2. Install dependancies:

   npm install

3. Start the Server:

   node app.js

4. Open your browser and go to:

   http://localhost:8000/


## Technology Used
Node.js: Backend server
Express.js: Web framework
EJS: Templating engine
Bootstrap: For responsive UI
File System (fs): To store and retrieve vehicle notes locally


## Future Improvements?
1. Add user authentication for private access.
2. Allow file export/import for backup and restoration of notes.
3. Add advanced filters for note search by date or odometer.

## License
This project is licensed under the MIT License.




