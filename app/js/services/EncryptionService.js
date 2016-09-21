app.service('EncryptionService', function() {

	var bcrypt 		= require("bcrypt-nodejs");
	var CryptoJS 	= require("crypto-js");
	var cryptoKey 	= '31N1hlyvExzsxPHu';
	
	return {
		encryptWithSalt : function(data, salt) {
			return bcrypt.hashSync(data, salt);
		},
		encrypt : function(data) {
			return CryptoJS.AES.encrypt(JSON.stringify(data), cryptoKey);
		},
		decrypt : function(data) {
			var bytes  = CryptoJS.AES.decrypt(data.toString(), cryptoKey);
			return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
		},
		salt : function() {
			return bcrypt.genSaltSync(12);
		}
	}
});