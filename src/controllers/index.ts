import refreshToken from './refreshToken';
import userController from './user';

const container = {
  get User(): Controllers.UserController {
    return userController.AWSUser;
  },

  get RefreshToken(): Controllers.RefreshTokenController {
    return refreshToken.AWSCognitoRefreshToken;
  },
};

export default container;
