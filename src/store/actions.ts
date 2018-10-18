import {ActionTree} from 'vuex';
import {MutationTypes} from './mutation-types';
import {State} from './state';
import { sendPost } from '../api/api';

declare function loginUser(email, pwd): any;
declare function forgotPassword(username): any;
declare function confirmPassword(username, code, newPassword): any;
declare function uploadFile(file);
declare var localStorage;


const actions: ActionTree<State, State> = {

  [MutationTypes.LOGIN_SUCCEEDED]: ({commit}) => {
    commit(MutationTypes.LOGIN_SUCCEEDED);
  },


  [MutationTypes.STRIPE_A1]: ({commit}, stripeData) => {

    sendPost('/stripe', stripeData,
      {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'origin, x-requested',
      'Access-Control-Request-Origin': 'https://foo.bar.org' })
    .then((res: any) => {
      console.log(res)
    })
    .catch((error: any) => {
      if (error.response && error.response.data) {
        console.log(error.response.data)
      } else {
        console.log(error.message)
      }
    })

  },

  [MutationTypes.LOGIN_USER]: ({commit}, loginData) => {
    const configString = localStorage.getItem('awsConfig');
    const config = JSON.parse(configString);
    if (config == null) {
      commit(MutationTypes.LOGIN_REQUESTED);
      loginUser(loginData.username, loginData.password).then(() => {
        commit(MutationTypes.LOGIN_SUCCEEDED);
      }).catch(err => {
        commit(MutationTypes.LOGIN_FAILED, err.message);
      });
    }
  },

  [MutationTypes.LOGOUT_USER]: ({commit}) => {
    commit(MutationTypes.LOGOUT_USER);
  },

  [MutationTypes.FORGOT_PASSWORD_REQUEST]: ({commit}, userData) => {
    const configString = localStorage.getItem('awsConfig');
    const config = JSON.parse(configString);
    if (config == null) {
      commit(MutationTypes.FORGOT_PASSWORD_REQUEST);
      forgotPassword(userData.username).then(() => {
        commit(MutationTypes.FORGOT_PASSWORD_SUCCEEDED);
      }).catch(err => {
        commit(MutationTypes.FORGOT_PASSWORD_FAILED, err.message);
      });
    }
  },

  [MutationTypes.CONFIRM_PASSWORD_REQUEST]: ({commit}, userData) => {
    const configString = localStorage.getItem('awsConfig');
    const config = JSON.parse(configString);
    if (config == null) {
      commit(MutationTypes.CONFIRM_PASSWORD_REQUEST);
      confirmPassword(userData.username, userData.code, userData.newPassword).then(() => {
        commit(MutationTypes.CONFIRM_PASSWORD_SUCCEEDED);
      }).catch(err => {
        commit(MutationTypes.CONFIRM_PASSWORD_FAILED, err.message);
      });
    }
  },

  [MutationTypes.SUBMIT_CONTACT_INFO]: ({commit}, contactInfo) => {
    // contactInfo = {"first_name": "Dave", "last_name": "Smith", "company_name": "Wrench.AI Test sssss 1", "phone_number": "888-555-1212", "email": "kevin@wrench.ai", "street_1": "555 Main St.", "street_2": "Apt 2B", "city": "Los Angeles", "state": "CA", "zip": "91203", "year": "1970", "month": "01", "day": "21"};
    sendPost('/contact_info', contactInfo,
      {
      'Content-Type': 'application/json',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'origin, x-requested',
      'Access-Control-Request-Origin': 'https://foo.bar.org' })
    .then((res: any) => {
      console.log(res)
      commit(MutationTypes.SUBMIT_CONTACT_INFO);
    })
    .catch((error: any) => {
      if (error.response && error.response.data) {
        console.log(error.response.data)
      } else {
        console.log(error.message)
      }
    })
  },

  [MutationTypes.GET_CONTACT_INFO]: ({ commit }, {callback}) => {
    // contactInfo = {"first_name": "Dave", "last_name": "Smith", "company_name": "Wrench.AI Test sssss 1", "phone_number": "888-555-1212", "email": "kevin@wrench.ai", "street_1": "555 Main St.", "street_2": "Apt 2B", "city": "Los Angeles", "state": "CA", "zip": "91203", "year": "1970", "month": "01", "day": "21"};
    sendPost('/get_contact_info', {},
      {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'origin, x-requested',
        'Access-Control-Request-Origin': 'https://foo.bar.org'
      })
      .then((res: any) => {
        if (callback) {
          callback(res.data.payload);
        }
      })
      .catch((error: any) => {
        if (error.response && error.response.data) {
          console.log(error.response.data)
        } else {
          console.log(error.message)
        }
      })
  },

  [MutationTypes.GET_PERSON_INFO]: ({ commit }, {payload, callback}) => {
    // contactInfo = {"first_name": "Dave", "last_name": "Smith", "company_name": "Wrench.AI Test sssss 1", "phone_number": "888-555-1212", "email": "kevin@wrench.ai", "street_1": "555 Main St.", "street_2": "Apt 2B", "city": "Los Angeles", "state": "CA", "zip": "91203", "year": "1970", "month": "01", "day": "21"};
    sendPost('/get_person_info', payload)
      .then((res: any) => {
        if (callback) {
          callback({
            status: 'success',
            data: res.data.payload,
          });
        }
      })
      .catch((error: any) => {
        if (error.response && error.response.data) {
          callback({
            status: 'error',
            msg: 'failed to fetch personal data',
          });
        } else {
          callback({
            status: 'error',
            msg: 'failed to fetch personal data',
          });
        }
      })
  },


  [MutationTypes.GET_CORPORA]: ({ commit }, {payload, callback}) => {
    sendPost('/get_corpora', {})
      .then((res: any) => {
        if (callback) {
          if (res.data === undefined) {
            callback({
              status: 'error',
              data: {},
            });
          }
          else {
            callback({
              status: 'success',
              data: res.data.payload,
            });
          }
        }
      })
      .catch((error: any) => {
        callback({
          status: 'error',
          msg: 'failed to fetch corpora',
        });
      })
  },

  [MutationTypes.UPLOAD_FILE]: ({commit}, file) => {
    console.log('********* file upload action ********');
    uploadFile(file).then(data => {
      console.log('*** done ***', data);
      commit(MutationTypes.UPLOAD_FILE);
    }).catch(error => {
      console.log('*** error ***', error);
    });
  },


  [MutationTypes.GET_CLIENT_NAME_REQUEST]: ({ commit }, {payload, callback}) => {
    sendPost('/get_client_name', payload)
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        callback({
          status: 'error',
          msg: 'Failed to fetch client name.',
        });
      });
  },


  [MutationTypes.CREATE_CORPUS_REQUEST]: ({ commit }, {payload, callback}) => {
    sendPost('/create_corpus', payload)
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        callback({
          status: 'error',
          msg: 'Failed to create campaign',
        });
      });
  },

  [MutationTypes.CREATE_ACCOUNT]: ({ commit }, {payload, callback}) => {
    sendPost('/create_account', payload)
      .then((res: any) => {
        callback(res.data);
      })
      .catch((error: any) => {
        callback({
          status: 'error',
          msg: 'Failed to create account'
        });
      });
  },

  [MutationTypes.GET_TOP_LINE]: ({ commit }, { payload, callback }) => {
    sendPost('/top_line', payload)
      .then((res: any) => {
        if (callback) {
          if (res.data === undefined) {
            callback({
              status: 'error',
              data: {},
            });
          }
          else {
            callback({
              status: 'success',
              data: res.data,
            });
          }
        }
      })
      .catch((error: any) => {
        callback({
          status: 'error',
          msg: 'Failed to get'
        });
      });
  },

  [MutationTypes.EXPORT_CONTACTS]: ({ commit }, { payload, callback }) => {
    sendPost('/export_contacts', payload)
      .then((res: any) => {
        if (callback) {
          if (res.data === undefined) {
            callback({
              status: 'error',
              data: {},
            });
          }
          else {
            callback({
              status: 'success',
              contactInfo: res.data.payload,
            });
          }
        }
      })
      .catch((error: any) => {
        callback({
          status: 'error',
          msg: 'Failed to get'
        });
      });
  }
};

export default actions;
