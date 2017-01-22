app.controller('menuCtrl', function ($scope, $log, $state, $window) {
	
    if(!$window.localStorage.token){
    	$scope.loggedIn = false;
    }else{
    	$scope.loggedIn = true;
    }
    
    $scope.logOut = function (){
    	delete $window.localStorage.token;
    	delete $window.localStorage.serverToken;
    	$state.transitionTo('login');
    };
    

    $scope.register = function (){
    	
    };
});