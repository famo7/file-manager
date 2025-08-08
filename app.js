require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('node:path');
const passport = require('passport');
const multer = require('multer');
const expressSession = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const prisma = require('./prismaClient');
const authRoute = require('./routes/authRoute');
const folderRoute = require('./routes/folderRoute');
const fileRoutes = require('./routes/fileRoute');

const upload = multer({ dest: 'uploads/' });

const expressLayouts = require('express-ejs-layouts');
const configurePassport = require('./config/passportConfig');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(passport.session());
configurePassport();

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', (req, res) => {
  res.render('index');
});
app.use('/', authRoute);
app.use('/folders', folderRoute);
app.use('/files', fileRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
