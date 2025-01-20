export default {
  /**
   * @type {number}
   */
  port: process.env.PORT || 3010,
  /**
   * Values:
   * DEVELOPMENT
   * PRODUCTION
   * @type {string="DEVELOPMENT", "PRODUCTION"}
   */
  env: process.env.ENV || 'DEVELOPMENT',
  /**
   * Cookie domain, when user logs in.
   * @type {string}
   */
  domain: process.env.DOMAIN,
  /**
   * Prefix for all routes.
   * @type {string}
   */
  routePrefix: process.env.ROUTE_PREFIX || '/users',
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [ 'http://localhost:3000' ],
  },
  logger: {
    /**
     * Supported values:
     * debug
     * info
     * warn
     * error
     * @type {string="debug", "info", "warn", "error"}
     */
    level: process.env.LOGGER_LEVEL || 'info',
  },
  services: {
    aws: {
      cognito: {
        accessKeyId: process.env.SERVICES_AWS_COGNITO_ACCESS_KEY_ID,
        secretAccessKey: process.env.SERVICES_AWS_COGNITO_SECRET_ACCESS_KEY,
        region: process.env.SERVICES_AWS_COGNITO_REGION,
        poolId: process.env.SERVICES_AWS_COGNITO_POOL_ID,
        clientId: process.env.SERVICES_AWS_COGNITO_CLIENT_ID,
        clientSecret: process.env.SERVICES_AWS_COGNITO_CLIENT_SECRET,
      },
    },
    trace: {
      /**
       * @type {string="AWS_XRAY", "CLS_HOOKED"}
       * @default CLS_HOOKED
       */
      type: process.env.SERVICES_TRACE_TYPE || 'CLS_HOOKED',
      /**
       * If using Service Discovery to find the daemon address.
       * @type {string}
       * @requires SERVICES_TRACE_TYPE=AWS_XRAY
       */
      daemonAddressNamespace: process.env.SERVICES_TRACE_DAEMON_ADDRESS_NAMESPACE,
      /**
       * If using Service Discovery to find the daemon address.
       * @type {string}
       * @requires SERVICES_TRACE_TYPE=AWS_XRAY
       */
      daemonAddressName: process.env.SERVICES_TRACE_DAEMON_ADDRESS_NAME,
      /**
       * Supported values:
       * * ECS
       * * EC2
       * * BEANSTALK
       * @type {string}
       * @requires SERVICES_TRACE_TYPE=AWS_XRAY
       */
      plugins: process.env.SERVICES_TRACE_PLUGINS,
    },
  },
}
