const {MongoClient, ObjectId} = require("mongodb")
const express = require("express")
const multer = require("multer")
const upload = multer()
const sanitizeHTML = require("sanitize-html")
const fse = require("fs-extra")
const sharp = require("sharp")
let db
const path = require("path")


fse.ensureDirSync(path.join("public", "uploaded-photos"))

const app = express()
app.set("view engine", "ejs")
app.set("views", "./views")
app.use(express.static("public"))

app.use(express.json())
app.use(express.urlencoded({extended: false}))

function passwordProtected(req, res, next) {
    res.set("WWW-Authenticate", "Basic realm='OOCA Stress Tracking'")
    if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=") {
        next()
    } else {
        console.log(req.headers.authorization)
        res.status(401).send("Try again")
    }
}


app.use(passwordProtected)

app.get("/", (req, res) => {
    res.render("admin")
})

app.get("/api/getStress", async (req, res) => {
    const allStress = await db.collection("stressTracks").find().toArray()
    res.json(allStress)
})

app.post("/create-stress", upload.single("photo"), ourCleanup, async (req, res) => {
    if (req.file) {
        const photofilename = `${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844, 456).jpeg({quality: 60}).toFile(path.join("public", "uploaded-photos", photofilename))
        req.cleanData.photo = photofilename
    }
    console.log(req.body)
    const info = await db.collection("stressTracks").insertOne(req.cleanData)
    const newStressTrack = await db.collection("stressTracks").findOne({ _id: new ObjectId(info.insertedId) })
    res.send(newStressTrack)
})

app.delete("/stress/:id", async (req, res) => {
    if (typeof req.params.id != "string") req.params.id = ""
    const doc = await db.collection("stressTracks").findOne({ _id: new ObjectId(req.params.id) })
    if (doc.photo) {
        fse.remove(path.join("public", "uploaded-photos", doc.photo))
    }
    db.collection("stressTracks").deleteOne({ _id: new ObjectId(req.params.id) })
    res.send("Deleted!")
})

app.post("/update-stress", upload.single("photo"), ourCleanup, async (req, res) => {
    if (req.file) {
        const photofilename = `${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844, 456).jpeg({quality: 60}).toFile(path.join("public", "uploaded-photos", photofilename))
        req.cleanData.photo = photofilename
        const info = await db.collection("stressTracks").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
        if (info.value.photo) {
            fse.remove(path.join("public", "uploaded-photos", info.value.photo))
        }
        res.send(photofilename)
    } else {
        db.collection("stressTracks").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
        res.send(false)
    }
})

function ourCleanup(req, res, next) {
    if (typeof req.body.stressLevel != "number") req.body.stressLevel = + req.body.stressLevel
    if (typeof req.body.description != "string") req.body.description = ""
    if (typeof req.body._id != "string") req.body._id = ""

    req.cleanData = {
        stressLevel: sanitizeHTML(req.body.stressLevel, {allowedTags: [], allowedAttributes: {}}),
        description: sanitizeHTML(req.body.description.trim(), {allowedTags: [], allowedAttributes: {}}) 
    }
    
    next()
}

async function start() {
    const client = new MongoClient("mongodb://root:root@localhost:27017/OocaDB?&authSource=admin")
    await client.connect()
    db = client.db()
    port = 3000
    app.listen(port, () => {
        console.log(`Server is running on ${port}`)
    })
}
start()
