import logger from '../../logger';
import APIError from '../../errors/APIError';
import JWT from '../../services/token/JWT';

class AWSCognitoRefreshTokenController implements Controllers.RefreshTokenController {
  constructor(
    protected iamService: Services.IAM,
  ) {}

  /**
   * 
   * @throws BaseError
   */
  public async create(): Promise<{ accessToken: string, refreshToken: string }> {
    throw new Error('Unsupported operation!');
  }

  /**
   * 
   * @param refreshToken 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/InitiateAuthCommand/
   */
  public async renew(refreshToken: string): Promise<{ user: User | any, accessToken: string, refreshToken: string }> {
    try {
      const response: any = await this.iamService.renewTokens(refreshToken);

      const idToken = response.AuthenticationResult.IdToken;
      const jwt = new JWT('');
      const { payload }: any = jwt.decode(idToken);

      const user = {
        id: payload.sub,
        username: payload.email,
        meta: {
          name: payload.name,
        },
        groups: payload['cognito:groups'],
      };

      return {
        user,
        accessToken: response.AuthenticationResult.AccessToken,
        refreshToken: refreshToken,
      };
    } catch (err) {
      logger.error('AWSCognitoRefreshToken.renew', { message: err.message, type: err.constructor.name, stack: err.stack });

      throw new APIError({ message: 'Unable to renew token!', code: 400 });
    }
  }

  /**
   * 
   * @param refreshToken 
   * @returns 
   * @see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/cognito-identity-provider/command/RevokeTokenCommand/
   */
  public async delete(refreshToken: string): Promise<RefreshToken> {
    try {
      const response = await this.iamService.deleteToken(refreshToken);

      return null;
    } catch (err) {
      logger.error('AWSCognitoRefreshToken.delete', { message: err.message, type: err.constructor.name, stack: err.stack });

      throw new APIError({ message: 'Unable to delete token!', code: 400 });
    }
  }
}

export default AWSCognitoRefreshTokenController;
