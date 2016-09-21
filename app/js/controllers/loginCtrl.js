app.controller('loginCtrl', function ($scope, $log, $state, $window) {
	$scope.user = {
			login: "",
			password : ""
	};
	
	$scope.login = function(){
		console.log("test!!");
		 $window.localStorage.token = $scope.user.login;
		 $state.transitionTo('dashboard');
	};
	
	// If a token exists, redirect to dashboard
    if($window.localStorage.token){
        $state.transitionTo('dashboard');
    }
});