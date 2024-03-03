const express = require('express');
const app = express();
const morgan = require('morgan')
require('dotenv').config()
const Person = require('./models/person')

app.use(express.json());
morgan.token('content', function (req, res) {
  return JSON.stringify(req.body); // Return the request body as a JSON string
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

app.use(express.static('dist'))
const cors = require('cors');
app.use(cors())

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if(error.name === "CastError"){
    return response.status(400).send({error: 'malformatted id'})
  }
  next(error)
}

// Get the current date
const currentDate = new Date();
// Define the months array for formatting
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
// Get the day, month, year, and time
const day = currentDate.getDate();
const month = months[currentDate.getMonth()];
const year = currentDate.getFullYear();
const time = currentDate.toLocaleTimeString();
const timezone = currentDate.toString().match(/\((.*?)\)/)[1];
// Construct the formatted string
const formattedDate = `${day} ${month} ${year} ${time} GMT${currentDate.getTimezoneOffset() > 0 ? '+' : '-'}${Math.abs(currentDate.getTimezoneOffset()/60)}00 (${timezone})`;

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    res.send(`<br>Phonebook has info for ${persons.length} people<br> ${formattedDate}`);
  })
});

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person){
        res.json(person)
      }else{
        res.status(404).end()
      }
    })
    .catch(error=>next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(deletedPerson=>{
      res.json(deletedPerson)
    })
    .catch(error=>next(error))
})

app.post('/api/persons', (req,res)=>{
  const body = req.body
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(
      savedPerson => {
        res.json(savedPerson)
      }
    )
})

app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  const updatedPerson = req.body; // New information for the updated person
    
  Person.findByIdAndUpdate(id, updatedPerson, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson); // Send the updated person as JSON response
    })
    .catch(error => next(error));
});

app.use(errorHandler)

const PORT = process.env.PORT||3001;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
