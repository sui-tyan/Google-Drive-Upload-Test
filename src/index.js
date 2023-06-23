import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import fs from "fs";
import express from "express";

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/drive",
];

try {
  const creds = fs.readFileSync("creds.json");
  oauth2Client.setCredentials(JSON.parse(creds));
} catch (err) {
  console.log("No creds found");
}

app.get("/auth/google", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(url);
});

app.get("/google/redirect", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  fs.writeFileSync("creds.json", JSON.stringify(tokens));
  res.send("success");
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

app.get("/saveText", async (req, res) => {
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  drive.files.create({
    requestBody: {
      name: "test.txt",
      mimeType: "text/plain",
    },
    media: {
      mimeType: "text/plain",
      body: "text",
    },
  });
});

app.get("/saveImage", (req, res) => {
  drive.files.create({
    requestBody: {
      name: "uploaded_image.jpg",
      mimeType: "image/jpeg",
    },
    media: {
      mimeType: "image/jpeg",
      body: fs.createReadStream('image.jpg'),
    },
  });
});

app.listen(3000, () => {
  console.log("server on port 3000");
});
