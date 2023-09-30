const express = require('express')
const app = express()
const WSServer = require('express-ws')(app)
const aWss = WSServer.getWss()
const cors = require('cors')
const PORT = process.env.PORT || 5000
const fs = require('fs')
const path = require('path')

app.use(cors())
app.use(express.json())


app.ws('/',(ws,req)=>{
    console.log("get message on server");
    ws.send("message from server");
    ws.on("message", (msg)=>{
        console.log(msg)
    })
})


app.listen(PORT, () => console.log(`server started on PORT ${PORT}`))


