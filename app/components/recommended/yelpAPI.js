/**
 * Created by Sedar on 11/03/2015.
 */

angular.module("geoAnalysis")
    .factory("MyYelpAPI", function($http) {
        function randomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
            return result;
        }
    return {
        "retrieveYelp": function(bounds, c, off, callback) {
            var method = 'GET';
            var url = 'http://api.yelp.com/v2/search';
            var callbackId = angular.callbacks.counter.toString(36);
            var params = {
                callback: 'angular.callbacks._'+ callbackId,
                bounds:bounds[0][1]+','+bounds[0][0]+'|'+bounds[1][1]+','+bounds[1][0],
                offset: 20+ off*20,
                oauth_consumer_key: '2oQ8t43Tfpx5lCkM94fjKA', //Consumer Key
                oauth_token: 'kpZXatv-M4km2ZoiW7FHFNS3yjV7qq8V', //Token
                oauth_signature_method: "HMAC-SHA1",
                oauth_timestamp: new Date().getTime(),
                oauth_nonce: randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                term: 'food'
            };
            var consumerSecret = 'UQpFHsFbgUkncg5Ac53h8-e6FpI'; //Consumer Secret
            var tokenSecret = 'vGrq83nyqH4peePiR9u4SXcVrOE'; //Token Secret
            var signature = oauthSignature.generate(method, url, params, consumerSecret, tokenSecret, { encodeSignature: false});
            params['oauth_signature'] = signature;
            $http.jsonp(url, {params: params})
                .success(function(data){
                    callback(data);
                })
                .error(function(data, status, headers, config) {
               console.log(status);
            });
        }
    }
});
