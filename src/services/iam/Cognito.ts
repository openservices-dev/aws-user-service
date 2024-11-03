import { createHmac } from 'crypto';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RevokeTokenCommand,
  GetUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  RespondToAuthChallengeCommand,
  SetUserMFAPreferenceCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import logger from '../../logger';

/**
 * @see https://blog.devgenius.io/nodejs-typescript-authentication-service-with-amazon-cognito-user-pools-9a12ea066ffb
 */
class AWSCognito implements Services.IAM {
  constructor(
    protected cognitoClient: CognitoIdentityProviderClient,
    protected serviceToken: Services.Token,
    protected clientId: string,
    protected clientSecret?: string,
  ) {}

  /**
   * Retrieve user detail from AWS Cognito.
   * @param id 
   * @param accessToken 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/GetUserCommand/
   */
  public async get(id: string, accessToken: string): Promise<unknown> {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.get response', response);

    return response;
  }

  /**
   * Add new user to AWS Cognito user pool. This user will not be able to log in
   * until he / she confirms the registration.
   * @param username 
   * @param password 
   * @param meta
   * @returns 
   * @throws UsernameExistsException if username / email already exists
   * @throws InvalidPasswordException if password does not match the requirements
   * @throws Error
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/SignUpCommand/
   */
   public async signUp(username: string, password: string, meta: Record<string, unknown>): Promise<User> {
    const command = new SignUpCommand({
      ClientId: this.clientId,
      SecretHash: this.getSecretHash(username),
      Username: username,
      Password: password,
      UserAttributes: Object.keys(meta).map(key => ({ Name: key, Value: String(meta[key]) })),
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.signUp response', response);

    const user = {
      id: response.UserSub,
      username: username,
    };

    return user as User;
  }

  /**
   * Confirm email or phone number by submitting code sent to the user.
   * If this step is not done, user will not be able to log in.
   * @param username 
   * @param code 
   * @throws CodeMismatchException if the provided code doesn't match what the server was expecting
   * @throws ExpiredCodeException if a code has expired
   * @throws UserNotFoundException if user isn't found
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ConfirmSignUpCommand/
   */
  public async confirmSignUp(username: string, code: string): Promise<unknown> {
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      SecretHash: this.getSecretHash(username),
      Username: username,
      ConfirmationCode: code,
    });

    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.confirmSignUp response', response);

    return response;
  }


  /**
   * Log in user with username and password.
   * This can either return `refreshToken` and `accessToken` in case of succesful
   * login, or `session` in case that user has MFA enabled.
   * @param username 
   * @param password 
   * @param device
   * @returns 
   * @throws {NotAuthorizedException} if wrong username or password
   * @throws {UserNotConfirmedException} if user is not verified
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/InitiateAuthCommand/
   */
  public async signIn(username: string, password: string, device?: UserDevice): Promise<unknown> {    
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
        SECRET_HASH: this.getSecretHash(username),
      },
      UserContextData: {
        IpAddress: device.ip,
        EncodedData: `os=${device.os}&browser=${device.browser}`,
      },
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.signIn response', response);

    return response;
  }

  /**
   * 
   * @param username 
   * @param code 
   * @param session 
   * @throws {CodeMismatchException} if the provided code doesn't match what the server was expecting
   * @throws {ExpiredCodeException} if a code has expired
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/RespondToAuthChallengeCommand/
   */
  public async respondToChallenge(username: string, code: string, session: string): Promise<unknown> {
    const command = new RespondToAuthChallengeCommand({
      ClientId: this.clientId,
      ChallengeName: 'SOFTWARE_TOKEN_MFA',
      ChallengeResponses: {
        USERNAME: username,
        SOFTWARE_TOKEN_MFA_CODE: code,
        SECRET_HASH: this.getSecretHash(username),
      },
      Session: session,
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.respondToChallenge response', response);

    return response;
  }

  /**
   * 
   * @param refreshToken refresh token to revoke
   * @throws {UnauthorizedException} if invalid access token
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/RevokeTokenCommand/
   */
  public async signOut(refreshToken: string): Promise<unknown> {
    const command = new RevokeTokenCommand({
      ClientId: this.clientId,
      ClientSecret: this.clientSecret,
      Token: refreshToken,
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.signOut response', response);

    return response;
  }

  /**
   * 
   * @param username 
   * @throws {UserNotFoundException} if user isn't found
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ForgotPasswordCommand/
   */
  public async forgotPassword(username: string): Promise<unknown> {
    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: username,
      SecretHash: this.getSecretHash(username),
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.forgotPassword response', response);

    return response;
  }

  /**
   * 
   * @param username 
   * @param password 
   * @param code 
   * @throws {CodeMismatchException} if the provided code doesn't match what the server was expecting
   * @throws {ExpiredCodeException} if a code has expired
   * @throws {UserNotFoundException} if user isn't found
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/ConfirmForgotPasswordCommand/
   */
  public async confirmForgotPassword(username: string, password: string, code: string): Promise<unknown> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: username,
      Password: password,
      ConfirmationCode: code,
      SecretHash: this.getSecretHash(username),
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.confirmForgotPassword response', response);

    return response;
  }

  /**
   * 
   * @param username 
   * @param accessToken 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/AssociateSoftwareTokenCommand/
   */
  public async setupMFA(username: string, accessToken: string): Promise<unknown> {
    const command = new AssociateSoftwareTokenCommand({
      AccessToken: accessToken,
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.setupMFA response', response);

    return response;
  }

  /**
   * 
   * @param username 
   * @param code 
   * @param accessToken 
   * @param session 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/VerifySoftwareTokenCommand/
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/SetUserMFAPreferenceCommand/
   */
  public async verifyMFA(username: string, code: string, accessToken: string, session: string): Promise<unknown> {
    const command = new VerifySoftwareTokenCommand({
      AccessToken: accessToken,
      Session: session,
      UserCode: code,
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.verifyMFA response', response);

    const command2 = new SetUserMFAPreferenceCommand({
      SoftwareTokenMfaSettings: {
        Enabled: true,
        PreferredMfa: true,
      },
      AccessToken: accessToken,
    });

    const response2 = await this.cognitoClient.send(command2);

    logger.debug('AWSCognito.verifyMFA response2', response2);

    return [response, response2];
  }

  /**
   * 
   * @param refreshToken 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/InitiateAuthCommand/
   */
  public async renewTokens(refreshToken: string): Promise<unknown> {
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
        SECRET_HASH: this.clientSecret,
      },
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.renewTokens', response);

    return response;
  }

  /**
   * 
   * @param refreshToken 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/RevokeTokenCommand/
   */
  public async deleteToken(refreshToken: string): Promise<unknown> {
    const command = new RevokeTokenCommand({
      ClientId: this.clientId,
      ClientSecret: this.clientSecret,
      Token: refreshToken,
    });
  
    const response = await this.cognitoClient.send(command);

    logger.debug('AWSCognito.deleteToken response', response);

    return response;
  }

  protected getSecretHash(username: string): string | undefined {
    if (typeof this.clientSecret === 'undefined') {
      return undefined;
    }

    return createHmac('sha256', this.clientSecret).update(`${username}${this.clientId}`).digest('base64');
  }
}

export default AWSCognito;
