# Lisa

Lisa is an online art sharing platform built around three roles: **users** who browse and engage with art, **presenters** who upload and showcase their work, and an **admin** who oversees the entire platform.

## Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)

## Project Structure

```
Lisa/
├── config/         # App and database configuration
├── controllers/    # Request handling logic
├── middleware/      # Auth and request middleware
├── models/         # Data models
├── routes/         # API/route definitions
├── public/         # Static assets
├── css/            # Stylesheets
├── index.html      # Entry page
├── schema.sql      # Database schema
├── lisa.db         # SQLite database
└── server.js       # App entry point
```

## Getting Started

**Prerequisites:** Node.js and npm installed.

```bash
git clone https://github.com/Bonsa-Dereje/Lisa.git
cd Lisa
npm install
node server.js
```

The app will be available at `http://localhost:3000` (or the port configured in `config/`).

## Roles

- **User** — browse and interact with shared artwork
- **Presenter** — upload and manage their own art
- **Admin** — oversees users, presenters, and platform content

## License

No license specified.
