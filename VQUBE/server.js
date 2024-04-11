const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB Connection URL
const mongoURI = 'mongodb://localhost:27017';
const client = new MongoClient(mongoURI);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve index.html as the home page
app.get('/', (req, res) => {
  res.sendFile('app.html', { root: __dirname + '/public' });
});

// Connect to MongoDB
async function connectToDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    await createDatabase();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process if unable to connect to MongoDB
  }
}
connectToDB();

// Create MongoDB database and collection if they don't exist
async function createDatabase() {
  try {
    const db = client.db('mymongo'); // Change 'myongo' to your desired database name

    // Create the 'users' collection if it doesn't exist
    await db.createCollection('users');
    console.log('Database and collection created');
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

// Handle user signup
app.post('/signup', async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    const db = client.db('mymongo');

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to MongoDB
    const result = await db.collection('users').insertOne({ firstname, lastname, email, password: hashedPassword });
    
    if (result.insertedCount === 1) {
      console.log('User registered successfully:', email);
      // Redirect to the home page or any other page as needed
      return res.redirect('/');
    } else {
      throw new Error('Failed to insert user data');
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).send('Error registering user');
  }
});

// Handle user login (Code for this endpoint is not provided in the current code)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
