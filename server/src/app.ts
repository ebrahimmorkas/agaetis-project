import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, isProduction } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.js';
import routes from './routes/index.js';

const app = express();

// so req.ip (used by the login rate limiter) is the real client and not the proxy
app.set('trust proxy', env.TRUST_PROXY);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
