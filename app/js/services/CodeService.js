app.service('CodeService', [ '$log', function($log) {

	this.HbA1c_test = function(){
		return {
			system : "http://snomed.info/sct",
			code : "43396009",
			display : "HbA1c - Hemoglobin A1c level"
		};
	};
	
	this.BNP_test = function(){
		return {
			system: "http://snomed.info/sct",
            code: "390917008",
            display: "Brain natriuretic peptide level"
		};
	};
	

	this.NTproBNP_test = function(){
		return {
			system: "http://snomed.info/sct",
            code: "414799001",
            display: "N-terminal pro-brain natriuretic peptide level"
		};
	};
	
	this.labResult = function(){
		return {
			system: "http://hl7.org/fhir/observation-category",
	         code: "laboratory",
	         display: "Laboratoire"
		};
	};
	
	this.findCodeLabResult = function(dataType){
		var codeResult = {};
		switch (dataType){
			case 'HbA1c' : codeResult = {
					coding: [ this.HbA1c_test()],
			        text: "Niveau de hémoglobine A1c"
			};break;
			case 'BNP' : codeResult = {
					coding: [ this.BNP_test()],
			        text: "Niveau de BNP"
			}; break;
			case 'NT-proBNP' : codeResult = {
					coding: [ this.NTproBNP_test()],
			        text: "Niveau de NT-proBNP"
			}; break;	
		}
		return codeResult;
	};

} ]);