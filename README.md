npm init -y
npm i express sequelize mysql2 dotenv jsonwebtoken bcryptjs
npm i --save-dev nodemon


Add to package.json:

json
Copy
Edit
"scripts": {
  "start": "nodemon server.js"
}
