# CarNotesApp

CarNotesApp is a more simple web application designed to track maintenance notes for multiple vehicles but without API. This app was created to solve a specific problem where the SmartCar API no longer allowed free access to manage multiple vehicles, limiting its usefulness for tracking all vehicle data. 

This app provides a straightforward and free solution to maintain a central place for all car maintenance records.

![Demo Image](https://raw.githubusercontent.com/deuber/CarNotesApp/main/My-Vehicles-demo5.png)



---

## Prerequisites
Make sure you have the following installed:
- **Node.js**: To run the server. [Download Node.js](https://nodejs.org/)
- **Git**: For version control. [Download Git](https://git-scm.com/)
- **PM2**: For process management. Install globally:
  npm install -g pm2

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
   npm install method-override



3. Start the Server:

   node app.js

4. Open your browser and go to:

   http://localhost:8000/

5. To restart use PM2

To run the app continuously and ensure it restarts on crashes, use PM2:

### Start the App
pm2 start app.js --name CarNotesApp

pm2 restart CarNotesApp

pm2 stop CarNotesApp

pm2 logs CarNotesApp

pm2 list



![Restart APP](https://raw.githubusercontent.com/deuber/CarNotesApp/main/restart.png)

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




