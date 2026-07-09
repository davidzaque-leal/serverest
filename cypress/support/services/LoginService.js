import BaseService from './BaseService';

/** Service object for the authentication endpoint (POST /login). */
class LoginService extends BaseService {
  constructor() {
    super('/login');
  }

  /**
   * Authenticates a user and returns the response (token in body.authorization).
   * @param {string} email
   * @param {string} password
   */
  login(email, password) {
    return this.request({ method: 'POST', body: { email, password } });
  }
}

export default new LoginService();
