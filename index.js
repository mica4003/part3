const express = require('express');
const app = express();
const morgan = require('morgan')

app.use(express.json());
morgan.token('content', function (req, res) {
    return JSON.stringify(req.body); // Return the request body as a JSON string
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

app.use(express.static('dist'))
const cors = require('cors')
app.use(cors())

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

const generateId = () => {
    const randomId = Math.floor(Math.random()*50)
    return randomId
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

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/info', (req, res) => {
    res.send(
        `<br>Phonebook has info for ${persons.length} people<br> ${formattedDate}`
    );
});

app.get('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id)
    const person = persons.find(person=>person.id===id)
    if(person){
        res.json(person)
    }else{
        res.status(404).end()
    }
})

app.delete('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person=>person.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req,res)=>{
    const body = req.body
    const isNameExisit = persons.find(person => person.name.includes(body.name))
    if(!body.name || isNameExisit){
        return res.status(400).json({
            error: 'name must be unique'
        })
    }
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person)
    res.json(person)
})

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});
