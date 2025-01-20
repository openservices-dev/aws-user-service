import aws from './aws';
import token from './token';
import iam from './iam';
import trace from './trace';
import ServiceDiscovery from './serviceDiscovery';
import config from '../config';

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

  get Trace(): Services.Trace {
    switch (config.services.trace.type) {
      case 'AWS_XRAY':
        return trace.AWSXRay;
      case 'CLS_HOOKED':
      default:
        return trace.CLSHooked;
    }
  },

  get ServiceDiscovery() {
    return new ServiceDiscovery();
  },
};

export default container;
