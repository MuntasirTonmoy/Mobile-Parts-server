const express = require("express");
const cors = require("cors");
const res = require("express/lib/response");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Access denied" });
    }
    req.decoded = decoded;
    next();
  });
};

//Mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yfl4a.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    console.log("db connected");
    const partsCollection = client.db("mobileParts").collection("parts");
    const orderCollection = client.db("mobileParts").collection("orders");
    const myOrderCollection = client.db("mobileParts").collection("myOrders");
    const reviewCollection = client.db("mobileParts").collection("reviews");
    const usersCollection = client.db("mobileParts").collection("users");

    // getting all the parts
    app.get("/parts", async (req, res) => {
      const query = {};
      const cursor = partsCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });

    // getting all reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const parts = await cursor.toArray();
      res.send(parts);
    });

    app.post("/reviews", async (req, res) => {
      const newOrder = req.body;
      const result = await reviewCollection.insertOne(newOrder);
      res.send(result);
    });

    // finding the parts by id
    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await partsCollection.findOne(query);
      res.send(result);
    });

    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
    });

    app.post("/myOrders", async (req, res) => {
      const newOrder = req.body;
      const result = await myOrderCollection.insertOne(newOrder);
      res.send(result);
    });

    app.get("/myOrders/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const decodedEmail = req.decoded.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = myOrderCollection.find(query);
        const myOrders = await cursor.toArray();
        return res.send(myOrders);
      } else {
        return res.status(403).send({ message: "Access denied" });
      }
    });

    app.delete("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myOrderCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDB = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDB, options);
      const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
      res.send({ result, token });
    });
  } finally {
  }
};

//calling run function
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Manufacturer Server is running ");
});

app.listen(port, () => {
  console.log("listing to port ", port);
});
