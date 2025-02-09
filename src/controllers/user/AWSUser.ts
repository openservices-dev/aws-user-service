import {
  InvalidPasswordException,
  NotAuthorizedException,
  UserNotConfirmedException,
  UsernameExistsException,
  CodeMismatchException,
  ExpiredCodeException,
  UnauthorizedException,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import logger from '../../logger';
import APIError from '../../errors/APIError';

/**
 * 
 * @see https://aws.amazon.com/pm/cognito/
 * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-cognito-identity-provider/
 * @see https://www.npmjs.com/package/@aws-sdk/client-cognito-identity-provider
 */
class AWSUserController implements Controllers.UserController {
  constructor(
    protected userService: Services.IAM,
    protected serviceToken: Services.Token,
  ) {}

  /**
   * Retrieve user detail from AWS Cognito.
   * @param id 
   * @param accessToken 
   * @returns 
   */
  public async get(id: string, accessToken?: string): Promise<User> {
    try {
      const response: any = await this.userService.get(id, accessToken);

      const user = {
        username: response.Username,
      };
  
      response.UserAttributes.forEach((userAttribute) => {
        if (userAttribute.Name === 'sub') {
          user['id'] = userAttribute.Value;
        } else if (userAttribute.Name !== 'email_verified') {
          user[userAttribute.Name] = userAttribute.Value;
        }
      });
  
      return user as User;
    } catch (err) {
      logger.error('AWSUser.get', { message: err.message, type: err.constructor.name, stack: err.stack });

      throw new APIError({ message: 'Unexpected error!', code: 400 });
    }
  }

  /**
   * Add new user to AWS Cognito user pool. This user will not be able to log in
   * until he / she confirms the registration.
   * @param username 
   * @param password 
   * @param meta
   * @returns 
   * @throws APIError if unable to create new user or duplicate email
   */
  public async signUp(username: string, password: string, meta: Record<string, unknown>): Promise<User> {
    try {
      const user = await this.userService.signUp(username, password, meta);

      return user;
    } catch (err) {
      logger.error('AWSUser.signUp', { message: err.message, type: err.constructor.name, stack: err.stack });
      
      switch (err.constructor) {
        case UsernameExistsException:
          throw new APIError({ message: 'Email address already exists!', code: 400 });
        case InvalidPasswordException:
          throw new APIError({ message: 'Password does not match the requirements!', code: 400 });
        default:
          throw new APIError({ message: 'Unable to create user!', code: 400 });
      }  
    }
  }

  /**
   * Confirm email or phone number by submitting code sent to the user.
   * If this step is not done, user will not be able to log in.
   * @param username 
   * @param code 
   * @returns 
   */
  public async confirmSignUp(username: string, code: string): Promise<User> {
    try {
      const user = await this.userService.confirmSignUp(username, code);

      return null;
    } catch (err) {
      logger.error('AWSUser.confirmSignUp', { message: err.message, type: err.constructor.name, stack: err.stack });

      throw new APIError({ message: 'Cannot verify code!', code: 400 });
    }
  }

  /**
   * Log in user with username and password.
   * This can either return `refreshToken` and `accessToken` in case of succesful
   * login, or `session` in case that user has MFA enabled.
   * @param username 
   * @param password 
   * @returns 
   */
  public async signIn(username: string, password: string, device?: UserDevice): Promise<{ user: User, refreshToken?: string, accessToken?: string, session?: string }> {      
    try {
      const response: any = await this.userService.signIn(username, password, device);

      if (response.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
        return {
          user: {
            id: response.ChallengeParameters.USER_ID_FOR_SRP,
          } as User,
          session: response.Session,
        }
      }

      const data = this.serviceToken.decode(response.AuthenticationResult.IdToken) as any;
      const user = {
        id: data.payload.sub,
        email: data.payload.email,
        meta: {
          name: data.payload.name,
        },
        groups: data.payload['cognito:groups'],
      }

      return {
        user: user as unknown as User,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      };
    } catch (err) {
      logger.error('AWSUser.signIn', { message: err.message, type: err.constructor.name, stack: err.stack });

      switch (err.constructor) {
        case NotAuthorizedException:
          throw new APIError({ message: 'Wrong username or password!', code: 400 });
        case UserNotConfirmedException:
          throw new APIError({ message: 'User is not verified!', code: 400 });
        default:
          throw new APIError({ message: 'Unexpected error!', code: 400 });
      }
    }
  }

  /**
   * 
   * @param username 
   * @param code 
   * @param session 
   * @returns 
   */
  public async respondToChallenge(username: string, code: string, session: string): Promise<{ user: User, refreshToken: string, accessToken: string }> {  
    try {
      const response: any = await this.userService.respondToChallenge(username, code, session);

      const data = this.serviceToken.decode(response.AuthenticationResult.IdToken) as any;
      const user = {
        id: data.payload.sub,
        email: data.payload.email,
      }

      return {
        user: user as unknown as User,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
      };
    } catch (err) {
      logger.error('AWSUser.respondToChallenge', { message: err.message, type: err.constructor.name, stack: err.stack });

      switch (err.constructor) {
        case CodeMismatchException:
          throw new APIError({ message: 'Code does not match what was expected!', code: 400 });
        case ExpiredCodeException:
          throw new APIError({ message: 'Code has expired!', code: 400 });
        default:
          throw new APIError({ message: 'Unexpected error!', code: 400 });
      }
    }
  }

  public async signOut(refreshToken: string): Promise<unknown> {
    try {
      const response = await this.userService.signOut(refreshToken);

      return null;
    } catch (err) {
      logger.error('AWSUser.signOut', { message: err.message, type: err.constructor.name, stack: err.stack });
      
      switch (err.constructor) {
        case UnauthorizedException:
          throw new APIError({ message: 'Refresh token is not valid!', code: 400 });
        default:
          throw new APIError({ message: 'Unexpected error!', code: 400 });
      }  
    }
  }

  /**
   * 
   * @param username 
   * @returns 
   */
  public async forgotPassword(username: string): Promise<unknown> {
    try {
      const response = await this.userService.forgotPassword(username);

      return null;
    } catch (err) {
      logger.error('AWSUser.forgotPassword', { message: err.message, type: err.constructor.name, stack: err.stack });
      
      switch (err.constructor) {
        case UserNotFoundException:
          throw new APIError({ message: 'Refresh token is not valid!', code: 400 });
        default:
          throw new APIError({ message: 'Unexpected error!', code: 400 });
      }  
    }
  }

  /**
   * 
   * @param username 
   * @param password 
   * @param code 
   * @returns 
   */
  public async confirmForgotPassword(username: string, password: string, code: string): Promise<unknown> {
    try {
      const response = await this.userService.confirmForgotPassword(username, password, code);

      return null;
    } catch (err) {
      logger.error('AWSUser.confirmForgotPassword', { message: err.message, type: err.constructor.name, stack: err.stack });
      
      switch (err.constructor) {
        case CodeMismatchException:
          throw new APIError({ message: 'Code does not match what was expected!', code: 400 });
        default:
          throw new APIError({ message: 'Unexpected error!', code: 400 });
      }  
    }
  }

  /**
   * 
   * @param username 
   * @param accessToken 
   * @returns 
   */
  public async setupMFA(username: string, accessToken: string): Promise<unknown> {  
    try {
      const response: any = await this.userService.setupMFA(username, accessToken);

      return {
        secretCode: response.SecretCode,
      };
    } catch (err) {
      logger.error('AWSUser.setupMFA', { message: err.message, type: err.constructor.name, stack: err.stack });

      switch (err.constructor) {
        case NotAuthorizedException:
          throw new APIError({ message: 'User is not authorised!', code: 400 });
        default:
          throw new APIError({ message: 'Unable to setup MFA!', code: 400 });
      }
    }
  }

  /**
   * 
   * @param username 
   * @param code 
   * @param accessToken 
   * @param session 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/VerifySoftwareTokenCommand/
   */
  public async verifyMFA(username: string, code: string, accessToken: string, session: string): Promise<unknown> {
    try {
      const response = await this.userService.verifyMFA(username, code, accessToken, session);

      return null;
    } catch (err) {
      logger.error('AWSUser.verifyMFA', { message: err.message, type: err.constructor.name, stack: err.stack });

      switch (err.constructor) {
        case CodeMismatchException:
          throw new APIError({ message: 'Code does not match what was expected!', code: 400 });
        default:
          throw new APIError({ message: 'Unexpected error!', code: 400 });
      }
    }
  }
}

export default AWSUserController;
