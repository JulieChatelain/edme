app.controller('patientsCtrl', function($scope, $log, $state, $window,
		DBService, PatientService, RestService, Utils) {
	
	$scope.userId = "";
	
	$scope.confirmation = ""; 	// Confirmation messages go there.
	$scope.error = ""; 			// Error messages go there.

	$scope.open = {
			patientInfo : true,
			labResult: true
	};

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
	
	// Filters for the patient list
	$scope.patientsNameFilter = "";
	
	$scope.patientsGenderFilter = {
			women: true,
			men: true
	};
	
	/**
	 * Load the user's patient list from the database.
	 */
	$scope.loadPatientList = function(next) {
		DBService.findPatients($scope.userId, function(err, patients) {
			if (!err) {
				$scope.patients = patients;
				if($scope.patient){
					$scope.selectPatient($scope.patient._id);
				}
				$scope.$apply();
				next();
			} else {
				$scope.error = "Une erreur a été rencontrée lors du"
						+ " chargement de la liste des patients. (Erreur : "
						+ err + ")";
				next();
			}
		});
	};
	
	$scope.loadPatientList(function(){});
	
	/**
	 * Load all the data related to the patient (ex: observations, conditions...)
	 */
	$scope.loadPatientData = function(userId, patientId) {
		PatientService.getAllRelatedData(userId, patientId, function(err, patientData){
			if(!err){
				$scope.patientData = patientData;
				$scope.labResults = patientData.labResult;
				$scope.conditions = patientData.conditions;
				$scope.$apply();
			}
			else{
				$scope.error = "Erreur lors du chargenement des données du patient. ("+err+")";
				$scope.$apply();
			}
		});
		
	};
		
	/**
	 * Compute the age of the patient from his birthdate.
	 */
	$scope.age = function(birthdate){
		return Utils.calculateAge(birthdate);
	};
			
	/**
	 * Change the background color of the selected element in the list.
	 */
	$scope.bgColor= function(patientId){
		if($scope.patient){
			if($scope.patient._id == patientId)
				return '#e8f5e9';
			else
				return 'white';
		}else{
			return 'white';
		}
	};
	

	/**
	 * Find a specific patient in the list via his id and
	 * get all his data.
	 */
	$scope.selectPatient = function(patientId) {
		$scope.records = [];
		var len = $scope.patients.length;
		for(var i = 0 ; i < len; ++i){
			if($scope.patients[i]._id == patientId){
				$scope.patient = $scope.patients[i];
				$scope.loadPatientData($scope.userId, patientId);
				$scope.labRecordId = '';
				$scope.conditionRecordId = '';
				if($scope.patient.hasBeenShared){
					var len2 = $scope.patient.otherRecords.length;
					for(var k = 0; k < len2; ++k){
						RestService.getResource($scope.patient.otherRecords[k]
						,'Patient', $scope.patient.otherRecords[k], function(res){
							//$log.debug("record: " + JSON.stringify(res.data));
							if(res.data.identifier[0].assigner.reference != $scope.userOnServer.reference.practitionerId){
		    					$scope.records.push(res.data);            						
							}
						});
					}
				}
				//$log.debug("Patient: " + JSON.stringify($scope.patient));
			}
		}
	};
	
	/**
	 * Starts sharing the patient info with the server
	 */
	$scope.sharePatientInfo = function(){
		// Only share if connected to the server
		if($scope.serverConnection){	
			// If the patient has never been shared, create a new record on the server
			if(!$scope.patient.hasBeenShared){		
				//$log.debug("user : " + JSON.stringify($scope.user));
				RestService.sendPatientRecord($scope.userOnServer, $scope.patient, function(success, message, savedId){
					if(success){
						var id = savedId.split("/");
						// Don't forget to indicate the record is now shared
						DBService.patientSharing($scope.userId, $scope.patient, true
								, id[1], new Date(), function(err){
							if(err){
								$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
								$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
								$scope.$apply();				
							}else{
								$scope.loadPatientList(function(){	
									$scope.confirmation = "Le dossier a bien été envoyé sur le serveur.";
									$scope.$apply();													
								});			
							}
						});
					}else{
						$log.debug(message);
						$scope.error = message;
						$scope.$apply();
					}
				});				
			}
			// If the record has already been shared (then stopped sharing then reshared)
			else{
				// Check if there were updates while the sharing was stopped
				if($scope.patient.lastShared.getTime() < $scope.patient.lastUpdated){
					// If there was, send the update to the server
					RestService.updateResource($scope.userOnServer, $scope.patient, $scope.patient, 'Patient'
							, function(success, message){
						if(success){
							// Then note the date for last shared
							var lastShared = new Date();
							DBService.patientSharing($scope.userId, $scope.patient
									, true, $scope.patient.idOnServer, lastShared
							, function(err){
								$scope.patient.lastShared = lastShared;
								$scope.loadPatientList(function(){
									$scope.confirmation = "Le dossier a été mis à jour sur le serveur.";
									$scope.$apply();
								});									
							});
						}
					});		
				}
				// If no updates while the sharing was stopped, we just note that
				// the sharing has restarted.
				else{
					DBService.patientSharing($scope.userId, $scope.patient, true
							, $scope.patient.idOnServer, $scope.patient.lastShared, function(err){
						if(err){
							$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
							$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
							$scope.$apply();				
						}else{
							$scope.loadPatientList(function(){
								$scope.confirmation = "Le dossier est à jour sur le serveur.";
								$scope.$apply();
							});						
															
						}
					});
				}
			}
		}else{
			$scope.error = "Impossible de se connecter au serveur. Veuilez réinitialiser la connexion.";
			$scope.$apply();
		}
	};
	
	/**
	 * Stops sharing the patient information with the server
	 */
	$scope.unsharePatientInfo = function(){
		// Just note that we don't have to share it anymore
		DBService.patientSharing($scope.userId, $scope.patient, false
				, $scope.patient.idOnServer, $scope.patient.lastShared, function(err, numReplaced){
			if(err){
				$scope.error = "L'opération a échoué.";
				$scope.patient.shared = true;
				$scope.$apply();				
			}else{
				$scope.patient.shared = false;
				$scope.confirmation = "Le partage a été stoppé." 
					+ " Le dossier existe cependant toujours sur le serveur."
					+ " Mais vos prochaines mise à jour ne seront pas transmises.";
				$scope.$apply();								
			}
		});
	};
	
	$scope.upPatientInfoOnServer =  function(){
		RestService.updateResource($scope.userOnServer, $scope.patient, $scope.patient, 'Patient'
				, function(success, message){
			if(success){
				// note the date for last shared
				var lastShared = new Date();
				DBService.patientSharing($scope.userId, $scope.patient
						, true, $scope.patient.idOnServer, lastShared
				, function(err){
						$scope.patient.lastShared = lastShared;
						$scope.selectPatient($scope.patient._id);					
						$scope.confirmation = 'Dossier synchronisé.';		
					});
			}
		});
	}
	
	/**
	 * Remove a patient
	 */
	$scope.deletePatient = function(){
		// First, ask for confirmation
		BootstrapDialog.show({
            title: 'Supprimer ce dossier?',
            message: 'Êtes-vous certain de vouloir supprimer ce dossier?'
            	+ '<br>Il ne pourra pas être récupéré.',
            buttons: [{
                label: 'Supprimer',
                action: function(dialog) {
                	// then delete it
            		DBService.deletePatient($scope.userId, $scope.patient._id, function(err, numRemoved){
            			if(!err && numRemoved == 1) {
            				if($scope.patient.shared){
            					RestService.deleteResource($scope.patient.idOnServer, 'Patient'
            							, $scope.patient.idOnServer, function(res){});
            				}
            				$scope.confirmation = "Le patient a été correctement supprimé.";
            				$scope.loadPatientList(function(){});
            				$scope.patient = null;
            			}else{
            				$scope.error = "Une erreur s'est produite lors de" 
            					+ " la suppression du patient. Veuillez réessayer.";
            			}
            		});
                    dialog.close();
                },
                cssClass: 'btn-danger'
            }, {
                label: 'Annuler',
                action: function(dialog){
                    dialog.close();
                }
            }]
        });
	};
	
	
	// ------------------------------------------------------------------------
	// --------------------------- LAB RESULTS --------------------------------
	// ------------------------------------------------------------------------
	
	/**
	 * Removes an analysis result from the db.
	 */
	$scope.deleteLabResult = function(result){
		// First, ask for confirmation
		BootstrapDialog.show({
            title: 'Supprimer ce résultat?',
            message: 'Êtes-vous certain de vouloir supprimer ce résultat?'
            	+ '<br>Il ne pourra pas être récupéré.',
            buttons: [{
                label: 'Supprimer',
                action: function(dialog) {
                	// then delete it
					DBService.deleteObservation($scope.userId, result._id, function(err, numRemoved){
						if(!err && numRemoved == 1) {
							if(result.shared){
            					RestService.deleteResource($scope.patient.idOnServer, 'Observation'
            							, result.idOnServer, function(res){});
            				}
							$scope.confirmation = "Le résultat a été correctement supprimé.";
							$scope.loadPatientData($scope.userId, $scope.patient._id);
						}else{
							$scope.error = "Une erreur s'est produite lors de" 
								+ " la suppression du résultat. Veuillez réessayer.";
							$scope.$apply();
						}
					});
                    dialog.close();
                },
                cssClass: 'btn-danger'
            }, {
                label: 'Annuler',
                action: function(dialog){
                    dialog.close();
                }
            }]
        });
	};
	
	/**
	 * Send the lab result on the server to be shared
	 */
	$scope.shareLabResult = function(result){
		// Only share if connected to the server
		if($scope.serverConnection){	
			// If the result has never been shared, create a new one on the server
			if(!result.hasBeenShared){
				RestService.sendObservation($scope.userOnServer, $scope.patient, result, function(success, message, savedId){
					if(success){
						var id = savedId.split("/");
						DBService.observationSharing($scope.userId, result, true
								, id[1], new Date(), function(err){
							if(err){
								$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
								$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
								$scope.$apply();				
							}else{
								$scope.loadPatientData($scope.userId, $scope.patient._id);								
								$scope.confirmation = "Le résultat a bien été envoyé sur le serveur.";
								$scope.$apply();								
							}
						});
					}else{
						$log.debug(message);
						$scope.error = message;
						$scope.$apply();
					}
				});	
			}else{
				// Check if there were updates while the sharing was stopped
				if($scope.result.lastShared.getTime() < $scope.result.lastUpdated){
					// If there was, send the update to the server
					RestService.updateResource($scope.userOnServer, $scope.patient, result, 'Observation'
							, function(success, message){
						if(success){
							// Then note the date for last shared
							var lastShared = new Date();
							DBService.observationSharing($scope.userId, result, true
									, result.idOnServer, result.lastShared, function(err){
								if(err){
									$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
									$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
									$scope.$apply();				
								}else{
									$scope.loadPatientData($scope.userId, $scope.patient._id);								
									$scope.confirmation = "Le résultat a bien été mis à jour sur le serveur.";
									$scope.$apply();								
								}								
							});
						}
					});
				}else{

					DBService.observationSharing($scope.userId, result, true
							, result.idOnServer, result.lastShared, function(err){
						if(err){
							$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
							$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
							$scope.$apply();				
						}else{
							$scope.loadPatientData($scope.userId, $scope.patient._id);								
							$scope.confirmation = message;
							$scope.$apply();								
						}
					});
				}
			}
		}else{
			$scope.error = "Impossible de se connecter au serveur. Veuilez réinitialiser la connexion.";
			$scope.$apply();
		}
	};
	
	/**
	 * Stop sharing the result 
	 */
	$scope.unshareLabResult = function(result){
		DBService.observationSharing($scope.userId, result._id, false
				, result.idOnServer, result.lastShared, function(err){
			if(err){
				$scope.error = "L'opération a échoué. Vérifiez que vous êtes bien connecté au serveur.";
				result.shared = true;
				$scope.$apply();				
			}else{
				result.shared = false;
				$scope.confirmation = "Le partage a été stoppé." 
					+ " Le résultat existe cependant toujours sur le serveur."
					+ " Mais vos prochaines mise à jour ne seront pas transmises.";
				$scope.$apply();								
			}
		});
	};
	

	$scope.findOrigin = function(identifiers){
		if(identifiers){
			var i = identifiers.length - 1;
			return identifiers[i].assigner.display;	    			
		}else{
			return 'Moi';
		}	
	}
	
	$scope.labTabActive = function( tabRecordId){
		if(tabRecordId == $scope.labRecordId){
			return true;
		}else{
			return false;
		}
	}
	
	$scope.changeRecordForLab = function(pId){
		
		$scope.labRecordId = pId;
		
		if(pId == ''){
			$scope.labResults = $scope.patientData.labResult;
		}else{
			var id = pId.split("/")[1];
			RestService.getResources(id, 'Observation', function(res){
				//$log.debug("observ: " + JSON.stringify(res.data));
				$scope.labResults = res.data;
				//$log.debug("observ: " + JSON.stringify($scope.observations));
			});
		}
		
	};
	
	$scope.addObservationToEHR = function(observation){
		DBService.addCopiedLabResult($scope.userId, $scope.userOnServer, $scope.patient, observation, function(err, savedData){
			if (!err) {
				//$log.debug("savedData : " + JSON.savedData);
				$scope.confirmation = "Les données ont été correctement sauvées.";  
				$scope.labRecordId = '';
				$scope.loadPatientData($scope.userId, $scope.patient._id);
				
				$scope.$apply();
			}else {
				$scope.error = "Une erreur a été rencontrée lors de"
					+ " la copie de donnée. (Erreur : "
					+ err + ")";  
				$scope.$apply();
			} 
		});
	};


	// ------------------------------------------------------------------------
	// --------------------------- CONDITIONS ---------------------------------
	// ------------------------------------------------------------------------
	
	
	
	
	/**
	 * Removes a condition from the db.
	 */
	$scope.deleteCondition = function(condition){
		// First, ask for confirmation
		BootstrapDialog.show({
            title: 'Supprimer cette maladie?',
            message: 'Êtes-vous certain de vouloir supprimer cette maladie?'
            	+ '<br>Elle ne pourra pas être récupérée.',
            buttons: [{
                label: 'Supprimer',
                action: function(dialog) {
                	// then delete it
					DBService.deleteCondition($scope.userId, condition._id, function(err, numRemoved){
						if(!err && numRemoved == 1) {
							if(condition.shared){
            					RestService.deleteResource($scope.patient.idOnServer, 'Condition'
            							, condition.idOnServer, function(res){});
            				}
							$scope.confirmation = "Le résultat a été correctement supprimé.";
							$scope.loadPatientData($scope.userId, $scope.patient._id);
						}else{
							$scope.error = "Une erreur s'est produite lors de" 
								+ " la suppression du résultat. Veuillez réessayer.";
							$scope.$apply();
						}
					});
                    dialog.close();
                },
                cssClass: 'btn-danger'
            }, {
                label: 'Annuler',
                action: function(dialog){
                    dialog.close();
                }
            }]
        });
	};
	
	/**
	 * Send the condition on the server to be shared
	 */
	$scope.shareCondition = function(condition){
		// Only share if connected to the server
		if($scope.serverConnection){	
			// If the condition has never been shared, create a new one on the server
			if(!condition.hasBeenShared){
				RestService.sendResource($scope.userOnServer, $scope.patient, condition,'Condition', function(success, message, savedId){
					if(success){
						var id = savedId.split("/");
						DBService.conditionSharing($scope.userId, condition, true
								, id[1], new Date(), function(err){
							if(err){
								$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
								$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
								$scope.$apply();				
							}else{
								$scope.loadPatientData($scope.userId, $scope.patient._id);								
								$scope.confirmation = "Le résultat a bien été envoyé sur le serveur.";
								$scope.$apply();								
							}
						});
					}else{
						$log.debug(message);
						$scope.error = message;
						$scope.$apply();
					}
				});	
			}else{
				// Check if there were updates while the sharing was stopped
				if($scope.condition.lastShared.getTime() < $scope.condition.lastUpdated){
					// If there was, send the update to the server
					RestService.updateResource($scope.userOnServer, $scope.patient, condition, 'Condition'
							, function(success, message){
						if(success){
							// Then note the date for last shared
							var lastShared = new Date();
							DBService.conditionSharing($scope.userId, condition, true
									, condition.idOnServer, condition.lastShared, function(err){
								if(err){
									$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
									$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
									$scope.$apply();				
								}else{
									$scope.loadPatientData($scope.userId, $scope.patient._id);								
									$scope.confirmation = "Le résultat a bien été mis à jour sur le serveur.";
									$scope.$apply();								
								}								
							});
						}
					});
				}else{

					DBService.conditionSharing($scope.userId, condition, true
							, condition.idOnServer, condition.lastShared, function(err){
						if(err){
							$log.debug("Le partage de dossier n'a pas pu être noté dans la DB.");
							$scope.error = "Le partage de dossier n'a pas pu être noté dans la DB. Erreur: " + err;
							$scope.$apply();				
						}else{
							$scope.loadPatientData($scope.userId, $scope.patient._id);								
							$scope.confirmation = message;
							$scope.$apply();								
						}
					});
				}
			}
		}else{
			$scope.error = "Impossible de se connecter au serveur. Veuilez réinitialiser la connexion.";
			$scope.$apply();
		}
	};
	
	/**
	 * Stop sharing the condition
	 */
	$scope.unshareCondition = function(condition){
		DBService.conditionSharing($scope.userId, condition._id, false
				, condition.idOnServer, condition.lastShared, function(err){
			if(err){
				$scope.error = "L'opération a échoué. Vérifiez que vous êtes bien connecté au serveur.";
				result.shared = true;
				$scope.$apply();				
			}else{
				condition.shared = false;
				$scope.confirmation = "Le partage a été stoppé." 
					+ " Le résultat existe cependant toujours sur le serveur."
					+ " Mais vos prochaines mise à jour ne seront pas transmises.";
				$scope.$apply();								
			}
		});
	};
	

	$scope.findOrigin = function(identifiers){
		if(identifiers){
			var i = identifiers.length - 1;
			return identifiers[i].assigner.display;	    			
		}else{
			return 'Moi';
		}	
	}
	
	$scope.conditionTabActive = function( tabRecordId){
		if(tabRecordId == $scope.conditionRecordId){
			return true;
		}else{
			return false;
		}
	}
	
	$scope.changeRecordForCondition = function(pId){
		
		$scope.conditionRecordId = pId;
		
		if(pId == ''){
			$scope.conditions = $scope.patientData.conditions;
		}else{
			var id = pId.split("/")[1];
			RestService.getResources(id, 'Condition', function(res){
				//$log.debug("observ: " + JSON.stringify(res.data));
				$scope.conditions = res.data;
				//$log.debug("observ: " + JSON.stringify($scope.observations));
			});
		}
		
	};
	
	$scope.addConditionToEHR = function(condition){
		DBService.addCopiedCondition($scope.userId, $scope.userOnServer, $scope.patient, condition, function(err, savedData){
			if (!err) {
				//$log.debug("savedData : " + JSON.savedData);
				$scope.confirmation = "Les données ont été correctement sauvées.";  
				$scope.conditionRecordId = '';
				$scope.loadPatientData($scope.userId, $scope.patient._id);
				
				$scope.$apply();
			}else {
				$scope.error = "Une erreur a été rencontrée lors de"
					+ " la copie de donnée. (Erreur : "
					+ err + ")";  
				$scope.$apply();
			} 
		});
	};
	
	
	// ------------------------------------------------------------------------
	// ----------------------------- RECORDS ----------------------------------
	// ------------------------------------------------------------------------

	$scope.newEhr = {
			doctorName : "",
			givenName : "",
			familyName : "",
			code : ""
	};

	
	$scope.addRecord = function(form){
		RestService.requestAccess($scope.newEhr.code, $scope.newEhr.doctorName
				, $scope.newEhr.givenName, $scope.newEhr.familyName, function(success, id){
			
			if(success){
				DBService.addRecord($scope.userId, $scope.patient, id, function(){
					$scope.selectPatient($scope.patient._id);					
					$scope.confirmation = 'Dossier correctement récupéré.';				
				});
			}else{
				$log.debug(message);
				$scope.error = message;		
				$scope.$apply();					
			}
			
		});
	};
	
	$scope.revokeMyRightToRecord = function(recordId){
		var rID = recordId.split("/")[1];
		RestService.revokeOwnAccess(rID, function(success,message){
			if(success){
				DBService.removeRecord($scope.userId, $scope.patient, rID, function(){
					$state.transitionTo('patients');					
					$scope.confirmation = 'Opération réussie.';						
				});			
			}else{
				$log.debug(message);
				$scope.error = message;	   
				$scope.$apply();						
			}
		});
	};

});