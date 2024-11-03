# AWS User Service

User management for your web application.

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

## License

[MIT license](./LICENSE)
