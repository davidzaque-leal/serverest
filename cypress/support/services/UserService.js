import BaseService from './BaseService';

/** Service object for the users resource (/usuarios). */
class UserService extends BaseService {
  constructor() {
    super('/usuarios');
  }

  /**
   * Creates a user. `failOnStatusCode` defaults to false (inherited) so
   * negative scenarios (e.g. duplicate e-mail -> 400) can also be asserted.
   * @param {object} user
   */
  create(user) {
    return this.request({ method: 'POST', body: user });
  }

  /** Lists all registered users. */
  list() {
    return this.request({ method: 'GET', failOnStatusCode: true });
  }

  /** Fetches a user by id. */
  getById(id) {
    return this.request({ method: 'GET', url: `${this.resourceUrl}/${id}` });
  }

  /** Deletes a user by id (used for test data cleanup). */
  delete(id) {
    return this.request({ method: 'DELETE', url: `${this.resourceUrl}/${id}` });
  }
}

export default new UserService();
