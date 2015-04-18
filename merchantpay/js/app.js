!function () {
	var app = angular.module('webapp', []);
    
    app.service('setting', ['$log', function ($log) {
        
        var	self = this,
            EPOCH = new Date('2015-04-14'),
            STORE = window.localStorage,
            privStoreFields = ['appId', 'secretKey', 'inst'],
            privScope = {}
       	;
        
        // Function to generate unique orderId
        function getTransactionId() {
        	var now = new Date(),
                dpart = Math.round((now - EPOCH)/(1000*60*60*24)),
                hpart = now.getHours(),
                spart = now.getMinutes() * now.getSeconds()
           	;
            
            return dpart + '-' + hpart + '-' + padString('0000', spart.toString());
        }
        
        function padString(template, input) {
            var inLen = input.length,
                tmpLen = template.length,
                diffLen = tmpLen - inLen;

            console.log('inLen, tmpLen, diffLen', inLen, tmpLen, diffLen);

            if (inLen > tmpLen) {
                return input.substr(0, tmpLen);
            } else {
                return template.substr(0, diffLen) + input;
            }
        }
        
        function b64urlEncode(inBytes) {
			var b64 = forge.util.encode64(inBytes),
                s1 = b64.replace(/\+/g, '-'),
                s2 = s1.replace(/\//g, '_');
            return s2;
		}

		function calcValidationHash() {
			var data = privScope.data;
            
            if (data.transactionId && data.currency && data.amount && data.secretKey) {
                var innerHash = forge.md.sha1.create(),
					validationHash = forge.md.sha1.create();
                
                innerHash.update(data.transactionId);
                innerHash.update(data.currency);
                innerHash.update(data.amount);
                innerHash.update(data.secretKey);

                var innerHashB64 = b64urlEncode(innerHash.digest().bytes());
                
                validationHash.update(data.appId);
                validationHash.update(innerHashB64);
                validationHash.update(data.secretKey);

                var validationHashB64 = b64urlEncode(validationHash.digest().bytes());

				data.innerHash = innerHashB64;
                data.validationHash = validationHashB64;
            }
		}

        this.calcHash = function () {
        	calcValidationHash();
        }
        
        this.save = function () {
            if (STORE) {
                var data = privScope.data;
                angular.forEach(privStoreFields, function (field) {
                	STORE.setItem(field, data[field]);
                });
            }
        }
        
        this.read = function () {  
          	if (STORE) {
                var data = privScope.data;
                angular.forEach(privStoreFields, function (field) {
                	data[field] = STORE.getItem(field);
                });
            }
        }

        this.initialize = function (scope) {
        	privScope = scope;
            
            // Set default data
            privScope.data = {
            	'transactionId': getTransactionId(),
                'currency': 'EUR',
                'amount': 1
            };
           	
            // Read stored data
            self.read();
            
            // Set installation options
            privScope.insts = {
            	'dev': {
                	'desc': 'Dev',
                    'postUrl': 'https://appdev.2pay.it/payapi/payment-request',
                    'jsUrl': 'https://appdev.2pay.it/payapi/js/core?key='
                },
                'qa': {
                	'desc': 'Sandbox',
                    'postUrl': 'https://appqas.2pay.it/payapi/payment-request',
                    'jsUrl': 'https://appqas.2pay.it/payapi/js/core?key='
                },
                'prod': {
                	'desc': 'Live',
                    'postUrl': 'https://app.2pay.it/payapi/payment-request',
                    'jsUrl': 'https://app.2pay.it/payapi/js/core?key='
                }
            };
            
            $log.log('Setting initialized');
        }
        
        this.getPostUrl = function () {
            if (privScope.insts && privScope.data.inst) {
            	return privScope.insts[privScope.data.inst].postUrl;
            }
        }
        
        this.getJsUrl = function () {
            if (privScope.insts && privScope.data.inst) {
            	return privScope.insts[privScope.data.inst].jsUrl;
            }
        }
        
    }]);
    
    app.controller('main_ctrl', function ($scope, setting, $location, $log) {
        setting.initialize($scope);
        $scope.read = setting.read;
        $scope.save = setting.save;
        $log.log('main_ctrl.data', $scope.data);
    	
        $scope.$watchGroup(['data.transactionId','data.amount'], function () {
			setting.calcHash();
		});
        
        // Load the data
        var data = $scope.data;
        if (data.inst && data && data.appId) {
        	var jsUrl = setting.getJsUrl(),
                script = document.createElement('script');
            
            // sessionIdField.textContent('loading...');
           	
            script.src = jsUrl + data.appId;
            document.body.appendChild(script);

            $log.log('Added js script tag to source app-id');
        }
        
    });
    

    /*
    app.controller('nav_ctrl', function ($scope, $log) {
        $log.log('nav_ctrl.data', $scope.insts);
    });
    
	app.controller('setting_ctrl', function ($scope, setting, $location, $log) {

	});
    */


}();