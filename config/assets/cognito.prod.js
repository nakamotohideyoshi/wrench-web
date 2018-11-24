const cognitoUserPoolId = 'us-east-1_XG9JMRGxm';
const cognitoUserPoolClientId = '2btjskfmptccs5uoq80l2kd1uh';
const cognitoAwsRegion = 'us-east-1';
const cognitoFileUploadBucket = 'enrichment-file-drop-wrench-ai';
const cognitoIdentityPoolId = 'us-east-1:4baee7b3-4ea4-45a6-aeab-b2eac550a143';

//we have to hardcode the Logins key but we can't build this object when the page is first loaded because we don't have the token so we'll build it when it's needed with a function.
function buildCredentialsObject(tokenInfo) {
  credObj = {
    IdentityPoolId: cognitoIdentityPoolId,
    Logins: {
      'cognito-idp.us-east-1.amazonaws.com/us-east-1_XG9JMRGxm': tokenInfo['IdToken']['jwtToken'],
    }
  };
  return credObj;
}


var configString = localStorage.getItem("awsConfig");
var config = JSON.parse(configString);
if(config != null) {
  refreshAWSCredentials();
}

function clearStorage() {
  var firstLogin = localStorage.getItem('firstLogin');

  // Keep X,Y values whenever localstorage is cleared.
  var adopt_curve_x = localStorage.getItem('adopt_curve_x');
  var adopt_curve_y = localStorage.getItem('adopt_curve_y');
  var adopt_curve_limit = localStorage.getItem('adopt_curve_limit');
  var influencers_x = localStorage.getItem('influencers_x');
  var influencers_y = localStorage.getItem('influencers_y');
  var influencers_limit = localStorage.getItem('influencers_limit');

  localStorage.clear();
  if (firstLogin === 'no') localStorage.setItem('firstLogin', 'no');
  if (adopt_curve_x) localStorage.setItem('adopt_curve_x', adopt_curve_x);
  if (adopt_curve_y) localStorage.setItem('adopt_curve_y', adopt_curve_y);
  if (adopt_curve_limit) localStorage.setItem('adopt_curve_y', adopt_curve_limit);
  if (influencers_x) localStorage.setItem('influencers_x', influencers_x);
  if (influencers_y) localStorage.setItem('influencers_y', influencers_y);
  if (influencers_limit) localStorage.setItem('influencers_y', influencers_limit);
}

function loginUser(email, pwd) {
  return new Promise(function(resolve, reject) {
    var poolData = {
      UserPoolId : cognitoUserPoolId,
      ClientId : cognitoUserPoolClientId
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var authenticationData = {
      'Username': email,
      'Password': pwd
    };
    var userData = {
      Username : email,
      Pool : userPool
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        const sessionTokens = {
          IdToken: result.getIdToken(),
          AccessToken: result.getAccessToken(),
          RefreshToken: result.getRefreshToken()
        };
        const credObj = buildCredentialsObject(sessionTokens);
        localStorage.setItem('sessionTokens', JSON.stringify(sessionTokens));
        AWS.config.region = cognitoAwsRegion;
        AWS.config.credentials = new AWS.CognitoIdentityCredentials(credObj);
        localStorage.setItem('awsConfig', JSON.stringify(AWS.config));
        localStorage.setItem('email', email);
        resolve();
      },
      onFailure: function(err) {
        reject(err);
      },
    });
  });
}


function refreshAWSCredentials(callback) {
  var poolData = {
    UserPoolId : cognitoUserPoolId,
    ClientId : cognitoUserPoolClientId
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var cognitoUser = userPool.getCurrentUser();
  if (cognitoUser != null) {
    cognitoUser.getSession(function(err, result) {
      if (result) {
        cognitoUser.refreshSession(result.getRefreshToken(), function(err, result) {
          if (err) {
            console.log('Session refresh failed.');
            console.log(JSON.stringify(err));
          }
          else {
            console.log('Session refreshed ' + new Date());
            localStorage.setItem('awsConfig', JSON.stringify(AWS.config));
            var sessionTokens = {
              IdToken: result.getIdToken(),
              AccessToken: result.getAccessToken(),
              RefreshToken: result.getRefreshToken()
            };
            localStorage.setItem("sessionTokens", JSON.stringify(sessionTokens));
            if (typeof callback === 'function') {
              callback();
            }
          }
        });
      }
      else {
        console.log('No session found on user.')
      }
    });
  }
  else {
    console.log('No current user found in pool.')
  }
}

function uploadFile(file) {
  return new Promise(function(resolve, reject) {
    var tokenInfo = {};
    if (localStorage.getItem('sessionTokens')) {
      tokenInfo = JSON.parse(localStorage.getItem('sessionTokens'))
    }
    const credentialsObject = buildCredentialsObject(tokenInfo);
    AWS.config.region = cognitoAwsRegion;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(credentialsObject);
    AWS.config.credentials.get(function(err){
        console.log('doing file upload');
        if (err !== null) {
          console.log('authentication failed.');
          console.log('err obj: ' + JSON.stringify(err));
          reject(err);
        }
        else {
          var s3 = new AWS.S3();
          const longFileName = tokenInfo['IdToken']['payload']['email'] + ' || ' + tokenInfo['IdToken']['payload']['sub'] + ' || ' + file.name;
          const obj = {
            Key: longFileName,
            Bucket: cognitoFileUploadBucket,
            Body: file,
            ContentType: file.type
          };
          s3.upload(obj).on('httpUploadProgress', function(evt) {
          }).send(function(err, data) {
            if (err) {
              reject(err);
            }
            else {
              resolve(data);
            }
          });
        }
    });
  });
}


function getSubjectId() {
  if (localStorage.getItem('sessionTokens')) {
    const tokenInfo = JSON.parse(localStorage.getItem('sessionTokens'));
    sub_id = tokenInfo['IdToken']['payload']['sub'];
    return sub_id;
  }
  else {
    return 'log in token not found';
  }
}

function registeringRequest (email, pw, fname, lname, company) {
  var poolData = {
    UserPoolId : cognitoUserPoolId,
    ClientId : cognitoUserPoolClientId
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  var attributeList = [];
  var dataEmail = {
      Name : 'email',
      Value : email
  };
  var dataFirstName = {
    Name : 'given_name',
    Value : fname
  };
  var dataLastName = {
    Name : 'family_name',
    Value : lname
  };
  var dataCompany = {
    Name: 'middle_name',
    Value: company
  };
  var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
  var attributeFirstName = new AmazonCognitoIdentity.CognitoUserAttribute(dataFirstName);
  var attributeLastName = new AmazonCognitoIdentity.CognitoUserAttribute(dataLastName);
  var attributeCompany = new AmazonCognitoIdentity.CognitoUserAttribute(dataCompany);
  attributeList.push(attributeEmail);
  attributeList.push(attributeFirstName);
  attributeList.push(attributeLastName);
  attributeList.push(attributeCompany);
  return new Promise(function(resolve, reject) {
    userPool.signUp(email, pw, attributeList, null, function(err, result){
      if (err) {
        reject(err);
      }
      else {
        cognitoUser = result.user;
        console.log(cognitoUser);
        localStorage.setItem('email', email);
        resolve();
      }
    });
  })
}

function registeringWithCode(confirmCode){
  return new Promise(function(resolve, reject) {
    var poolData = {
      UserPoolId : cognitoUserPoolId,
      ClientId : cognitoUserPoolClientId
    };
    var userName = localStorage.getItem('email');
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username : userName,
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(confirmCode, true, function(err, result) {
      if (result === 'SUCCESS') {
        resolve();
      }
      else if (err) {
        reject(err.message);
      }
    });
  });
}

function forgotPassword (username) {
  return new Promise(function(resolve, reject) {
    var poolData = {
      UserPoolId : cognitoUserPoolId,
      ClientId : cognitoUserPoolClientId
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
      Username : username,
      Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.forgotPassword({
      onFailure: function(err) {
        reject(err);
      },
      inputVerificationCode: function() {
        resolve();
      }
    });
  });
}

function confirmPassword (username, code, newPassword) {
  return new Promise(function(resolve, reject) {
    var poolData = {
      UserPoolId : cognitoUserPoolId,
      ClientId : cognitoUserPoolClientId
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
      Username : username,
      Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: function () {
        resolve();
      },
      onFailure: function(err) {
        reject(err);
      }
    });
  });
}
