# CarNotesApp 

This REST API Node.js app offers a simple, user-friendly graph to track car maintenance against mileage, providing a free and centralized solution for managing maintenance records. Unfortunately, integration with the SmartCar API has been disabled due to the associated costs.

![Demo Image](https://raw.githubusercontent.com/deuber/CarNotesApp/main/My-Vehicles-demo9.png)


![New Edit with cost](https://raw.githubusercontent.com/deuber/CarNotesApp/main/images/Vehicle-Notes-edit3.png)


New Cost vs Time graph
![New Time vs Cost](https://raw.githubusercontent.com/deuber/CarNotesApp/main/My-Vehicles-demo10.png)


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

   http://localhost:8080/

5. To get started, add your first vehicle
![First Car](https://raw.githubusercontent.com/deuber/CarNotesApp/main/images/addCar.png)

6. Then add notes for each car
![First Note](https://raw.githubusercontent.com/deuber/CarNotesApp/main/images/addNote.png)



6. To restart use PM2

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
3. ~~Add cost per maintence and new graph~~

## License
This project is licensed under the MIT License.




