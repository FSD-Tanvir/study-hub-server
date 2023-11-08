const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    // create collection
    const assignmentCollection = client
      .db("assignmentDB")
      .collection("AllAssignments");

    const submittedCollection = client
      .db("assignmentDB")
      .collection("SubmittedAssignments");

    // get all data from AllAssignment Collection
    app.get("/api/v1/all-assignments", async (req, res) => {
      const cursor = assignmentCollection.find();
      result = await cursor.toArray();
      res.send(result);
    });

    // get single data from AllAssignment Collection
    app.get("/api/v1/all-assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const assignment = await assignmentCollection.findOne(query);
      res.send(assignment);
    });

    // insert single data to AllAssignment Collection
    app.post("/api/v1/all-assignments", async (req, res) => {
      const assignment = req.body;
      const result = await assignmentCollection.insertOne(assignment);
      res.send(result);
    });

    // updated single data to AllAssignment Collection
    app.put("/api/v1/all-assignments/:id", async (req, res) => {
      const id = req.params.id;
      const assignment = req.body;
      const filter = { _id: new ObjectId(id) };
      const previousAssignment = await assignmentCollection.findOne(filter);
      const assignmentCreatorEmail = previousAssignment.email;
      const currentUserEmail = assignment.email;
      const options = { upsert: true };
      const updatedAssignment = {
        $set: {
          title: assignment.title,
          image: assignment.image,
          marks: assignment.marks,
          dueDate: assignment.dueDate,
          difficulty: assignment.difficulty,
          description: assignment.description,
        },
      };

      if (currentUserEmail === assignmentCreatorEmail) {
        const result = await assignmentCollection.updateOne(
          filter,
          updatedAssignment,
          options
        );
        res.send(result);
      } else {
        res.status(403).send({ error: "Forbidden" });
      }
    });

    //updated single data to AllAssignment Collection
    app.delete("/api/v1/all-assignments/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const assignment = await assignmentCollection.findOne(query);
      const assignmentCreatorEmail = assignment.email;
      const currentUserEmail = req.body.userEmail;

      if (currentUserEmail === assignmentCreatorEmail) {
        const result = await assignmentCollection.deleteOne(query);
        res.send(result);
      } else {
        res.status(403).send({ error: "Forbidden" });
      }
    });

    // get all data from SubmittedCollection 
    app.get("/api/v1/submitted-assignments", async (req, res) => {
      const cursor = submittedCollection.find();
      result = await cursor.toArray();
      res.send(result);
    });

    //get specific user's data from SubmittedCollection
    app.get("/api/v1/my-assignments/", async(req,res)=>{
     const userEmail = req.query.userEmail
     const query = { examineeEmail: userEmail}
     const cursor = submittedCollection.find(query);
     const myAssignments = await cursor.toArray();
     res.send(myAssignments);
    })

    //insert single data to SubmittedCollection 
    app.post("/api/v1/submitted-assignments", async (req, res) => {
      const submittedAssignment = req.body;
      const result = await submittedCollection.insertOne(submittedAssignment);
      res.send(result);
    });

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
