app.controller('parametersCtrl', function ($scope, $log, $state, $window, RestService, DBService) {
	
	$scope.userId = "";
	
	$scope.confirmation = ""; 	// Confirmation messages go there.
	$scope.error = ""; 			// Error messages go there.

	// Check if the user is correctly connected.
	// Get the user id
	if (!$window.localStorage.token) {
		$scope.loggedIn = false;
		$state.transitionTo('login');
	} else {
		$scope.loggedIn = true;
		$scope.userId = $window.localStorage.token;
		DBService.findUserById($scope.userId, function(err, user){
			if(err || !user){
				$log.debug("Erreur lors du chargement des données utilisateurs.");
				$scope.error = "Erreur lors du chargement des données utilisateurs.";
				$scope.$apply();
			}else{
				$scope.user = user;
				$scope.$apply();			
			}			
		});
	}
	
	if($window.localStorage.serverToken){
		$scope.serverConnection = true;
        $scope.userOnServer = RestService.decodeToken($window.localStorage.serverToken);
	}else{
		$scope.serverConnection = false;
	}
	
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	// ------------------------------------------------------------------------
	
	$scope.serverEmail = "";
	$scope.serverPassword = "";
	$scope.familyName = "";
	$scope.givenName = "";
	
	$scope.register = function(){
		if($scope.serverEmail != '' || $scope.serverPassword != '' 
			|| $scope.familyName != '' || $scope.givenName != ''){
			
			if($scope.serverPassword.length < 8){
				$scope.error = "Le mot de passe doit faire au moins 8 caractères.";
			}else{
				
				RestService.register($scope.serverPassword, $scope.serverEmail
						, $scope.givenName, $scope.familyName
						, function(success, message, userOnServer, token){
					
					if(success){
						$window.localStorage.serverToken = token;
						$scope.serverConnection = true;
						
						DBService.addServerAccount($scope.user, $scope.serverPassword
								, $scope.serverEmail, userOnServer._id
								, $scope.familyName, $scope.givenName, function(err, numReplaced){
							
							if(err || numReplaced == 0){
								$scope.error = "La connexion a été établie mais "+
								+"n'a pas pu être sauvée dans la base de donnée.";
								$scope.$apply();				
							}else{
								$state.transitionTo('parameters');
							}
						});
					}else{
						$log.debug(message);
						$scope.error = message;
						$scope.$apply();						
					}
				});
			}
		}else{
			$scope.error = "Veuillez remplir tous les champs.";
		}
	};
	
	$scope.login = function(){
		RestService.login($scope.serverPassword, $scope.serverEmail, function(success, message, userOnServer, token){			
			if(success){
				$window.localStorage.serverToken = token;
				$scope.serverConnection = true;
				$scope.confirmation = "La connexion a été réinitialisée.";
			}else{
				$log.debug(message);
				$scope.error = message;					
			}
		});
	};
	

});