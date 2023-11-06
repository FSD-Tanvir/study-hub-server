const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const uri = process.env.URI;

//middleware
app.use(cors());
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentCollection = client
      .db("assignmentDB")
      .collection("AllAssignments");

    // app.get("/api/v1/all-assignments", async (req, res) => {
    //   const cursor = assignmentCollection.find();
    //   result = await cursor.toArray();
    //   res.send(result);
    // });

    app.post("/api/v1/all-assignments", async(req, res)=>{
        const assignment = req.body
        console.log(req.body);
        const result = await assignmentCollection.insertOne(assignment)
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Study Hub!");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
