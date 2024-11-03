import AWSUser from './AWSUser';
import services from '../../services';

const container = {
  get AWSUser() {
    return new AWSUser(
      services.IAM,
      services.Token,
    );
  },
};

export default container;
