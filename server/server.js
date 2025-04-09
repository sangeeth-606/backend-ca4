
import express from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
app.use(express.json())

await mongoose.connect('mongodb+srv://sangeethdrive69:gXIGaQ1sK2fgCRRi@cluster0.iojyc.mongodb.net/backend-ca4')


const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }
})
const User = mongoose.model('User', userSchema)

const SECRET = 'sdhhkhsdhfkskj'


const ProtectedRoute = (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ error: 'unauthorizedd' })

  try {
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(403).json({ error: 'invalid token' })
  }
}



app.post('/register', async (req, res) => {
  const { username,  password } = req.body
  const existing = await User.findOne({ username })
  if (existing) return res.status(400).json({ error: 'User already existss' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ username, password: hashed })
  res.status(201).json({ message: 'User registered', userId: user._id })
})


app.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await User.findOne({ username })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const match = await bcrypt.compare(password, user.password)
  if (!match) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ userId: user._id }, SECRET)

  
    res.cookie('token', token, {
    })
    .json({ message: 'Login successful' })
})

app.get('/profile', ProtectedRoute,  async (req, res) => {
    const user = await User.findById(req.user.userId)
    res.json(user)
  })

app.get('/time', (req, res) => {
    const token = req.cookies.token
    if(token){
        return res.json({ message: 'user auth successfully' })
    }
    return res.status(401).json({message:"not authenticated"})
})
app.get('/',(req, res)=>{
    res.status(200).json("hey hihih")
})
app.listen(8000, () => console.log('Server running on port 8000'))
