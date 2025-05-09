const express = require("express");
const conn = require("./config/db.js");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { v4: uuidv4 } = require("uuid"); // Updated import
const Org = require("./models/orgModel");
const jwt = require("jsonwebtoken");
const hash = require("./utils/hash.js");
const bcrypt = require("bcryptjs");

conn();

app.use(express.json());
app.use(cors());

// Test Route
app.get('/foo', (req, res) => res.send('bar'))

// Get Tenant Info with Dist ID
app.get('/api/org', async (req, res) => {
  try {
    const { id } = req.headers;

    const org = await Org.findOne({ distID: id }).select("-rootPass");

    if (!org) {
      res.status(404).json({ err: 'No Organization found' })
    }

    res.status(200).json({ org })
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ err: error.message })
  }
})

// Register new Tenant
app.post("/api/org", async (req, res) => {
  try {
    const { username, password, region, email, subdomain } = req.body;
    const hashed = await hash(password);

    const org = await Org.create({
      rootEmail: email,
      rootUname: username,
      rootPass: hashed,
      region,
      distID: uuidv4(),
      slug: subdomain
    });

    const token = jwt.sign({ id: org._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      success: true,
      token,
      org: {
        id: org._id,
        email: org.rootEmail,
        region: org.region,
        distID: org.distID,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { slug, uname, pass, root } = req.body;
    console.log();

    if (root === true) {
      // Root user login
      const org = await Org.findOne({ slug, rootUname: uname });
      console.log(org);

      if (!org) {
        return res.status(404).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(pass, org.rootPass);

      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: org.distID,
          role: "root",
        },
        process.env.JWT_SECRET,
        { expiresIn: "7h" }
      );

      return res.status(200).json({
        token,
        org: {
          id: org.distID,
          name: org.name,
        },
      });
    } else {
      // Normal user login (implement your logic here)
      return res
        .status(501)
        .json({ error: "Normal user login not implemented" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/org/agent', (req, res) => {
  try {
    const { id } = req.headers;
    const { name, desc, platform, ver } = req.body;

    console.log(id, name, desc, platform, ver);
    res.status(200).json({ success: "Agent Created" })
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ err: error.message })
  }
})

app.listen(process.env.NODE_PORT, () => {
  console.log(`Server running on port ${process.env.NODE_PORT}`);
});
