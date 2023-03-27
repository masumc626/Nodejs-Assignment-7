const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const autoIncrementModelID = require('./counterModel');

const port = 8080
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// your code goes here
dotenv.config();

//connect to DB-----------------------
mongoose.connect(process.env.DATABASE_URL, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('connected to DB')
})

// Model---------------------

const schoolSchema = new mongoose.Schema({
    id: Number,
    name: String,
    currentClass: Number,
    division: String,
})

schoolSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
        return;
    }

    autoIncrementModelID('activities', this, next);
});

const School = mongoose.model('class', schoolSchema);

// Roughts ------------------------------
app.get("/api/student", async (req, res) => {
    const studentArray = require("./InitialData")
    studentArray.forEach(async std => {
        const data = new School({
            id: std.id,
            name: std.name,
            currentClass: std.currentClass,
            division: std.division,
        });
        await data.save();
    })
    res.status(200).json(studentArray)
})

app.get("/api/student/:id", async (req, res) => {
    const id = req.params.id
    const data = await School.find(
        { id: id },
        { _id: 0 }
    )
    if (!data.length) {
        return res.status(404).json({});
    }
    res.status(200).json(data[0]);
})

app.post("/api/student", async (req, res) => {
    const { name, currentClass, division } = req.body;
    if (!name, !currentClass, !division) {
        return res.status(400).json({})
    }
    const data = new School({
        name: name,
        currentClass: currentClass,
        division: division,
    });
    await data.save();
    res.status(200).json({
        id: data.id
    })
})


app.put("/api/student/:id", async (req, res) => {
    const id = req.params.id
    const { name } = req.body;
    const data = await School.findOneAndUpdate(
        { id: id },
        {
            $set: {
                name: name
            }
        },
        { new: true }
    );

    if (!data) {
        return res.status(400).json({});
    }

    res.status(200).json({
        name: data.name
    });
})

app.delete("/api/student/:id", async (req, res) => {
    const id = req.params.id;
    const data = await School.findOneAndDelete(
        { id: id }
    );
    if (!data) {
        return res.status(404).json({});
    }
    res.status(200).json(data)
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;   