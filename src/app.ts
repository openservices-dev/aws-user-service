import express from 'express';
import cookieParser from 'cookie-parser';
import config from './config';
import routes from './routes';
import cors from './middlewares/cors';
import logRequest from './middlewares/logRequest';
import errorHandler from './middlewares/errorHandler';
import services from './services';

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors);
app.use(logRequest);

app.use(services.Trace.openSegment('user-service') as any);
app.use(`${config.routePrefix}`, routes);
app.use(services.Trace.closeSegment() as any);

app.use(errorHandler);

export default app;
