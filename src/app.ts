import express from 'express';
import cookieParser from 'cookie-parser';
import config from './config';
import routes from './routes';
import cors from './middlewares/cors';
import trace from './middlewares/trace';
import logRequest from './middlewares/logRequest';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(trace);
app.use(cors);
app.use(logRequest);

app.use(`${config.routePrefix}`, routes);

app.use(errorHandler);

export default app;
