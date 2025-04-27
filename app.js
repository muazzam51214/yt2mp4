import express, { urlencoded } from 'express';
import path from 'path';
import cors from 'cors';
import downloadRoutes from './routes/downloadRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();

// Setup __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set 'public' folder as static
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS (Allow API access from other domains)
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', downloadRoutes);

// Error Handler
app.use(errorHandler);

export default app;