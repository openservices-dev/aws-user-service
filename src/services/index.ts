import aws from './aws';
import token from './token';
import iam from './iam';

const container = {
  get Token(): Services.Token {    
    return token.AWSCognito;
  },

  get AWS() {
    return aws();
  },

  get IAM(): Services.IAM {
    return iam.AWSCognito;
  },
};

export default container;
