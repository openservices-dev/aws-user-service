import express from 'express';

const router = express.Router();

async function setupSwagger() {
  const swaggerUi = await require('swagger-ui-express');
  const swaggerJSDoc = await require('swagger-jsdoc');

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'User Service API',
        version: '1.0.0',
        description: 'API documentation for User Service. This service is responsible for user management and can use local strategy or use supported services like AWS Cognito. \n\nBased on `DATABASE_PRIMARY_KEY_TYPE` environment variable it can use either `INT` or `UUID` as primary key type.',
      },
    },
    apis: ['./dist/routes/*.js', './dist/routes/*/*.js'],
  };

  const swaggerSpec = swaggerJSDoc(options);

  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

if (process.env.ENV === 'DEVELOPMENT') {
  setupSwagger();
}

export default router;
