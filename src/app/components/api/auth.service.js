(function() {
  'use strict';

  angular.module('app.components')
    .factory('auth', auth);
    
    auth.$inject = ['$http', '$window', 'Restangular', '$rootScope', 'AuthUser'];
    function auth($http, $window, Restangular, $rootScope, AuthUser) {

    	var user = {
        token: null,
        data: null
      };

      //wait until http receptor is added to Restangular
      setTimeout(function() {
    	  initialize();
      }, 1000);

    	var service = {
        isAuth: isAuth,
        setCurrentUser: setCurrentUser,
        getCurrentUser: getCurrentUser,
        saveToken: saveToken,
        login: login,
        logout: logout,
        recoverPassword: recoverPassword,
        getResetPassword: getResetPassword,
        patchResetPassword: patchResetPassword
    	};
    	return service;
      
      //////////////////////////

      function initialize() {
        setCurrentUser();
      }
      //run on app initialization so that we have cross-session auth
      function setCurrentUser() {
        user.token = $window.localStorage.getItem('smartcitizen.token');
        if(!user.token) return;
        getCurrentUserInfo()
          .then(function(data) {
            user.data = new AuthUser(data);
            $rootScope.$broadcast('loggedIn');
            console.log('user', user);
          });
      }

      function getCurrentUser() {
        return user;
      }

      function isAuth() {
        return !!$window.localStorage.getItem('smartcitizen.token');
      }
      //save to localstorage and 
      function saveToken(token) {
        $window.localStorage.setItem('smartcitizen.token', token);
        setCurrentUser();
      }

      function login(loginData) {
        return Restangular.all('sessions').post(loginData);
      }

      function logout() {
        $window.localStorage.removeItem('smartcitizen.token');
      }

      function getCurrentUserInfo() {
        return Restangular.all('').customGET('me');
        /*return $http({
          method: 'GET',
          url: 'https://new-api.smartcitizen.me/v0/me',
          headers: {
            'Authorization': 'Bearer ' + user.token
          }
        });*/
      }

      function recoverPassword(data) {
        return Restangular.all('password_resets').post(data);
      }

      function getResetPassword(code) {
        return Restangular.one('password_resets', code).get();
      }
      function patchResetPassword(code, data) {
        return Restangular.one('password_resets', code).patch(data);
      }
    }
})();
