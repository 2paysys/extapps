define(['angularAMD', 'forge', 'notificationAAMD'], function (angularAMD, forge) {
	angularAMD.service('Setting', ['Notification', '$log', function (Notification, $log) {
        var	self = this,
            EPOCH = new Date('2015-04-14'),
            STORE = window.localStorage,
            privStoreFields = ['appId', 'secretKey', 'inst', 'appName', 'accountNumber'],
            privScope = {}
       	;
        
        /*
        PRIVATE: Generate transaction id
        */
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
        
        function getTransactionId() {
        	var now = new Date(),
                dpart = Math.round((now - EPOCH)/(1000*60*60*24)),
                hpart = now.getHours(),
                spart = now.getMinutes() * now.getSeconds()
           	;
            
            return dpart + '-' + hpart + '-' + padString('0000', spart.toString());
        }
        

        /*
        PRIVATE: base64 url
        */
        function b64urlEncode(inBytes) {
			var b64 = forge.util.encode64(inBytes),
                s1 = b64.replace(/\+/g, '-'),
                s2 = s1.replace(/\//g, '_');
            return s2;
		}

        /*
        Calculate the validation hahs
        */
		this.calcValidationHash = function () {
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

        /*
        Save and read from localStorage
        */
        this.save = function () {
            if (STORE) {
                var data = privScope.data;
                angular.forEach(privStoreFields, function (field) {
                    var saveData = data[field];
                    // $log.log('saveData for "' + field + '": ', saveData);
                    
                    if (saveData) {
                        STORE.setItem(field, saveData);
                    } else {
                    	STORE.removeItem(field);
                    }
                	
                });
                Notification.showMessage('Data saved.');
            }
        };
        
        this.read = function () {  
          	if (STORE) {
                var data = privScope.data,
                    toReadData = true;
                angular.forEach(privStoreFields, function (field) {
                	var readData = STORE.getItem(field);
                    // $log.log('readData for "' + field + '": ', readData);
                    // If appId is not return, assume that no data is saved
                    if (field === 'appId' && !readData) {
                    	toReadData = false;
                    }
                    // Only read the data if flag is set
                    if (toReadData) {
                    	data[field] = readData
                    }
                });
                Notification.showMessage('Data loaded.');
            }
        };
        
        /*
        Force load the script
        */
        this.loadScript = function (appId) {
            if (appId) {
                var jsUrl = self.getJsUrl(),
                    scriptId = '2pay-script',
                    script = document.getElementById(scriptId);
               	
                $log.log('script element:', script);
                if (script) {
                	script = document.createElement('script');
                    script.id = "2pay-script";
                    document.body.appendChild(script);
                }
                
                script.onload = function () {
                	$log.log('2pay-script loadig...');
                }
                
                // sessionIdField.textContent('loading...');
                script.src = jsUrl + data.appId;

                $log.log('Added js script tag to source app-id');
            }
        };

        /*
        Initialization
        */
        this.initialize = function (scope) {
        	privScope = scope;
            
            // Set default data
            privScope.data = {
            	'transactionId': getTransactionId(),
                'currency': 'EUR',
                'amount': "1.5",
                'appName': 'Mock Merchant',
                'inst': 'dev',
                'cartContent': [{
                	'id': 12345,
                    'desc': 'Candy',
                    'quantity': 1,
                    'price': 1.5,
                    'amount': 1.5
                }]
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
            
            // Bind read and save methods
            privScope.save = self.save;
            privScope.read = self.read;
            
            $log.log('Setting initialized');
        }
        
        this.getPostUrl = function () {
            if (privScope.insts && privScope.data.inst) {
                var data = privScope.insts[privScope.data.inst];
                if (data) {
                	return data.postUrl;
                }
            }
        }
        
        this.getJsUrl = function () {
            if (privScope.insts && privScope.data.inst) {
                var data = privScope.insts[privScope.data.inst];
                if (data) {
                	return data.jsUrl + privScope.data.appId;
                }
            }
        };
        
        this.setSessionId = function (sessionId) {
            privScope.data.sessionId = sessionId
        };
        
    }]);
});
