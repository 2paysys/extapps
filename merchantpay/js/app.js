!function () {
	var app = angular.module('webapp', []);

	app.controller('main_ctrl', function ($scope, $log) {
		$scope.appId = 'OPWSTJR7VtBavtHbvnAcDC1oSHFrhjVBz-ivlxJBlbg=';
		$scope.secretKey = 'uMVvkwUpJUcs6GmJNZeKLGTmwdmatgVVlEZ9hRbES5M=';
		$scope.secureKey = 'jwF6itjToE3UiRYti2hvaDzerWkB2bXuc0ku5ZxfxHY=';
		$scope.transactionId = '1';
		$scope.currency = "EUR";
		$scope.amount = "12.0";
		// $scope.validationHash = '2mU0SP002683fVIUGOXa0Imot2w=';


		function b64urlEncode(inBytes) {
			var b64 = forge.util.encode64(inBytes),
                s1 = b64.replace(/\+/g, '-'),
                s2 = s1.replace(/\//g, '_');
            return s2;
		}

		function calcValidationHash() {
			var innerHash = forge.md.sha1.create(),
				validationHash = forge.md.sha1.create();

			innerHash.update($scope.transactionId);
			innerHash.update($scope.currency);
			innerHash.update($scope.amount);
			innerHash.update($scope.secretKey);

			var innerHashB64 = b64urlEncode(innerHash.digest().bytes());

			$log.log('innerHashB64: ', innerHashB64);

			validationHash.update($scope.appId);
			// validationHash.update(innerHash.digest().bytes());
			validationHash.update(innerHashB64);
			validationHash.update($scope.secretKey);

			var validationHashB64 = b64urlEncode(validationHash.digest().bytes());

			$log.log('validationHashB64', validationHashB64);


			$scope.validationHash = validationHashB64;
		}

		calcValidationHash();

		$scope.$watchGroup(['transactionId','amount'], function () {
			calcValidationHash();
		});

	});


}();