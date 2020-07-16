const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, `.env.${process.env.production ? 'production' : 'development'}`)
})

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

const corsOptions = {
  origin: 'http://localhost:8081'
}

app.use(cors(corsOptions))

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({ message: 'Welcom to the app' })
})

const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
