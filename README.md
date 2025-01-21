# AWS User Service

User management API using AWS Cognito.

## Routes

List of routes with basic info.

Use `/user/api-docs` to view routes descriptions. This route is available only in development mode (`ENV=DEVELOPMENT`).

For testing purpose check [Postman collection](./aws-user-service.postman_collection.json).

| Request | Path | Description |
| ------- | ---- | ----------- |
| POST | /user/register | Register new user |
| POST | /user/confirm | Confirm registration using verification code |
| POST | /user/login | Log in user |
| GET | /user/me | User detail |
| PUT | /user/user/:id | Update user |
| POST | /user/password-reset-request | Request password reset |
| POST | /user/password-reset | Reset password using verification code |
| POST | /user/totp/setup | Setup MFA |
| POST | /user/totp/verify | Verify MFA |
| DELETE | /user/:id | Delete user |
| GET | /user/refresh-token | Renew refresh token |

## Environment variables

Here are some basic environment variables. Whole configuration is in [config.ts](./src/config.ts) where you can find type and supported values for each option.

| Name | Description |
| ---- | ----------- |
| PORT | Port number on which the service is listening |
| SERVICES_AWS_COGNITO_REGION | AWS Cognito region (e.g. `eu-central-1`) |
| SERVICES_AWS_COGNITO_POOL_ID | ID in form `<region>-<random string>` |
| SERVICES_AWS_COGNITO_CLIENT_ID | App client ID |
| SERVICES_AWS_COGNITO_CLIENT_SECRET | App client secret |

## Logging and debugging

#### Debug logs

```
LOGGER_LEVEL=debug
```

#### Sentry

**Sentry** is supported and is initialized if `SENTRY_DSN` variable is set:

```
SENTRY_DSN=
```

#### AWS X-Ray or default tracing

Service provides basic tracing using `cls-hooked` and `uuid7` trace ID. This trace ID is part of each log and is unique for each request.

```shell
SERVICES_TRACE_TYPE=CLS_HOOKED
```

AWS X-Ray is supported and has also additional options (check [config.ts](./src/config.ts)).

```shell
SERVICES_TRACE_TYPE=AWS_XRAY
```

## License

[MIT license](./LICENSE)
