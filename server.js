const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Firebase setup
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// CPX postback
app.get("/cpx-postback", async (req, res) => {
  try {
    const userId = req.query.ext_user_id;

    // 👇 IMPORTANT FIX
    const reward = parseInt(req.query.amount || "100"); // default 100 for testing

    if (!userId) {
      return res.status(400).send("User ID missing");
    }

    const userRef = db.collection("users").doc(userId);

    // 👇 check user exists
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(404).send("User not found");
    }

    await userRef.update({
      diamonds: admin.firestore.FieldValue.increment(reward),
    });

    res.send("Reward added successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});