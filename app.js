const express = require('express')
const morgan = require('morgan')
const uuid = require('node-uuid')
var rfs = require('rotating-file-stream') // Include FS
var path = require('path') // Include Path
const app = express()
const port = 5000

const rotatingLogStream = rfs.createStream('request.log', { interval: '1d', path: path.join(__dirname, 'log') })

// Custom token with the name of 'trace-id'. You can call it whatever you like
morgan.token('trace-id', function(req, res) { return req.trace_id })
morgan.token('span-id', function(req, res) { return req.span_id })

// Include the custom token
app.use(calculateTraceId)
app.use(generateSpanId)
app.use(morgan(':date[web] [:trace-id][:span-id] - :method :url :status :res[content-length] - :response-time ms ', { stream: rotatingLogStream }))

app.get('/', function(req, res) {
    res.send('hello, world!')
})

app.get('/about', function(req, res) {
    res.send('About Page!')
})

function calculateTraceId(req, res, next) {
    var current_trace_id = req.headers['forr-trace-id']
    req.trace_id = typeof current_trace_id !== "undefined" ? current_trace_id : (current_trace_id = uuid.v4())
    next()
}

function generateSpanId(req, res, next) {
    req.span_id = uuid.v4()
    next()
}

app.listen(port, () => console.info(`App listening on port ${port}`))