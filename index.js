const express = require('express');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Store notes in-memory (for demonstration purposes)
const notes = {};

app.use(express.urlencoded({ extended: true })); // Middleware to handle form data

app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Self-Destructing Note Generator</title>
    </head>
    <body>
      <h1>Self-Destructing Note Generator</h1>
      <form action="/generate" method="post">
        <label for="noteText">Enter your note:</label><br>
        <textarea id="noteText" name="noteText" rows="4" cols="50"></textarea><br>
        <label for="noteDuration">Note duration (seconds):</label>
        <input type="number" id="noteDuration" name="noteDuration" min="1" value="10"><br>
        <button type="submit">Generate Self-Destructing Note</button>
      </form>
      <div id="generatedLink" style="display: none;"></div>
    </body>
    </html>
  `);
});

app.post('/generate', (req, res) => {
  const randomUrl = crypto.randomBytes(6).toString('hex'); // Generate a random URL
  const noteContent = req.body.noteText;
  const noteDuration = parseInt(req.body.noteDuration) * 1000; // Convert seconds to milliseconds
  const expiryTime = Date.now() + noteDuration;

  notes[randomUrl] = { content: noteContent, expiry: expiryTime };

  const noteLink = `http://localhost:3000/note/${randomUrl}`;
  
  res.send(`
    <html>
    <head>
      <title>Self-Destructing Note Generator</title>
    </head>
    <body>
      <h1>Self-Destructing Note Generator</h1>
      <form action="/generate" method="post">
        <label for="noteText">Enter your note:</label><br>
        <textarea id="noteText" name="noteText" rows="4" cols="50"></textarea><br>
        <label for="noteDuration">Note duration (seconds):</label>
        <input type="number" id="noteDuration" name="noteDuration" min="1" value="10"><br>
        <button type="submit">Generate Self-Destructing Note</button>
      </form>
      <div id="generatedLink">
        <p>Your self-destructing note link:</p>
        <a href="${noteLink}" target="_blank">${noteLink}</a>
      </div>
    </body>
    </html>
  `);
});

app.get('/note/:url', (req, res) => {
  const url = req.params.url;
  const note = notes[url];

  if (!note || Date.now() > note.expiry) {
    return res.send('Note not found or has expired.');
  }

  res.send(`
    <html>
    <head>
      <title>Self-Destructing Note</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f0f0f0;
        }
        .note-container {
          border: 2px solid #333;
          padding: 20px;
          background-color: white;
          text-align: center;
          font-family: Arial, sans-serif;
        }
      </style>
      <script>
        setTimeout(() => {
          document.getElementById('note').innerHTML = 'This note has self-destructed.';
          document.getElementById('newNoteButton').style.display = 'block';
        }, ${note.expiry - Date.now()});
      </script>
    </head>
    <body>
      <div class="note-container">
        <div id="note">${note.content}</div>
        <button id="newNoteButton" style="display: none;" onclick="window.location.href='/';">Generate New Note</button>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
