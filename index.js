const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const bodyParser = require('body-parser');
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }
})
const User = mongoose.model('User', userSchema)

const exerciseSchema = new mongoose.Schema({
  userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async function(req, res){
  let { username } = req.body;
  if(username && typeof username == 'string') {
    let existing = await User.findOne({ username: username }).exec()
    if(existing)
      return res.json({username: existing.username, _id: existing._id})
    let user = await User.create({ username: username })
    return res.json(user)
  }
  return res.json({error: ''})
})

app.get('/api/users', async function(req, res){
  let users = await User.find({}).select({ username: 1, _id: 1 });
  return res.json(users)
})

app.post('/api/users/:_id/exercises', async function(req, res){
  let { description, duration, date } = req.body;
  let user = await User.findById(req.params._id).exec()
  if(user) {
    let exercise = await Exercise.create({ 
      userid: user._id,
      description: description,
      duration: duration,
      date: date? date : new Date()
    })
    if(exercise)
      return res.json({ 
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
        _id: user._id,
        username: user.username
      })
  }
  return res.json({ error: '' })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
