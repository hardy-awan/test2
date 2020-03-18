const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');

const UserApi = require ('./routes/api/users');
const AuthApi = require('./routes/api/auth');
const ProfileApi = require('./routes/api/profile');
const PostApi = require('./routes/api/posts')




const app = express();

connectDB();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))



app.use('/users', UserApi)
app.use('/account', AuthApi)
app.use('/profile', ProfileApi)
app.use('/posts', PostApi)

if (process.env.NODE_ENV === 'production' ) {
    
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname,'client', 'build', 'index.html'))
    })
}

const PORT = process.env.PORT || 5000;



app.listen(PORT,() => console.log(` Server running in PORT ${PORT}`));