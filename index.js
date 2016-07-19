"use strict";

const url = require("url"),
      http = require("http"),
      https = require("https"),
      crypto = require('crypto'),
      request = require("request"),
      hat = require("hat"),
      md5 = require("md5");

module.exports = function(connectid, secretkey) {
    return {
        /**
         * Function to create the API authentication signature
         *
         * @see https://developer.zanox.com/web/guest/authentication/zanox-oauth/oauth-rest
         * @see http://www.ietf.org/rfc/rfc2104.txt
         * @param string verb (GET, POST, PUT, DELETE)
         * @param string uri (example: https://api.zanox.com/json/2011-03-01/adspaces, uri = /adspaces)
         * @param integer timestamp (new Date().toGMTString())
         * @param integer nonce (this.nonce())
         * @return string
         */
        signature: function(verb, uri, timestamp, nonce) {
            let signature = verb + uri + timestamp + nonce;
            return crypto.createHmac("sha1", secretkey).update(signature).digest("base64");
        },

        /**
         * Function for generating the nonce
         *
         * @return string
         */
        nonce: function () {
            return hat(4 * 20);
        },

        /**
         * Function to generate the API request
         *
         * @param string URL (exemple: https://api.zanox.com/json/2011-03-01/adspaces)
         * @param string URI (exemple: /adspaces)
         * @param function cb
         */
        getinapi: function (URL, URI, cb) {
            let nonce = this.nonce();
            const timestamp = new Date().toGMTString();
            let signature = this.signature("GET", URI, timestamp, nonce);

            let options = {
                url: URL,
                headers: {
                    "Authorization": "ZXWS "+connectid+":"+signature,
                    "Date": timestamp,
                    "nonce": nonce
                }
            };

            request(options, (error, response, body) => { cb(error, JSON.parse(body)); });
        },

        /**
         * Function to generate application link
         *
         * @see http://stackoverflow.com/questions/22678346/convert-javascript-object-to-url-parameters
         * @param string URLbase
         * @param object params
         * @return string
         */
        createurl: function (URLbase, params) {
            let paramsStr = Object.keys(params).map(function(k) {
              return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
            }).join('&');

            return URLbase + ((URLbase.indexOf("?") >= 0) ? "" : "?") + paramsStr;
        },
        
        /**
         * Get your profile information
         * 
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-profiles
         * @param function cb
         */
        profile: function(cb) {
            this.getinapi("https://api.zanox.com/json/2011-03-01/profiles ", "/profiles", cb);
        },

        /**
         * Access your AdSpace information
         *
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-adspaces
         * @param function cb
         */
        adspaces: function(cb) {
            this.getinapi("https://api.zanox.com/json/2011-03-01/adspaces", "/adspaces", cb);
        },

        /**
         * Get banners and links, including tracking links 
         *
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-admedia
         * @param object params         *
         * program: Limits results to a particular program
         * region: Limits results to a particular region
         * format: Limits results to an ad media format ()
         * admediumtype: Limits results to an ad media type (html, script, image, imagetext, text)
         * purpose: Limits results to a type of link to the advertiser shop (startpage, productdeeplink, categorydeeplink)
         * partnership: Limits results to either programs to whom the publisher has successfully applied ("direct"), or to those who belong to zanox's publicly available ad pool ("indirect")
         * category: Limits results to one of the program's ad media categories. Ad media categories are defined by each advertiser for their program, and can be retrieved using GetAdmediumCategories
         * adspace: Limits results to tracking links associated with this ad space
         * items: Total maximum of records that must be returned
         * page: Starting position records
         * @param function cb
         */
        admedia: function(params, cb) {
            let URL = this.createurl("https://api.zanox.com/json/2011-03-01/admedia", params);
            this.getinapi(URL, "/admedia", cb);
        },
        
        /**
         * Get coupons and other incentives
         *
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-incentives
         * @param object params
         * program: Limits results to a particular program
         * adspace: Limits results to incentives that have tracking links associated with this AdSpace
         * incentiveType: Limits results to one of the following incentive types (coupons, samples, bargains, freeProducts, noShippingCosts, lotteries)
         * region: Limits results to a particular region
         * items: Total maximum of records that must be returned
         * page: Starting position records
         * @param function cb
         */
        incentives: function(params, cb) {
            let URL = this.createurl("http://api.zanox.com/json/2011-03-01/incentives", params);
            this.getinapi(URL, "/incentives", cb);
        },
        
        /**
         * Get products, including their tracking links
         * 
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-products
         * @param object params
         * q: Limits results to products associated with this search string
         * searchtype: Specifies whether you want to make a phrase search or contextual search (phrase, contextual)
         * region: Limits results to a particular region
         * minprice: Limits results to products with a minimum, currency-independent price
         * maxprice: Limits results to products with a maximum, currency-independent price
         * programs: Comma-separated list of programs. Returns products from those programs. When no program IDs are provided, the API will return results from all programs where your publisher is confirmed.
         * hasimages: Limits results to products with images
         * adspace: Limits results to tracking links associated with this ad space
         * partnership: Enables search in all product data, regardless of whether you are confirmed by the advertiser or not. Result does not include tracking links, so the search is only an indicator of which products are available from which advertisers
         * ean: The international article number, or the barcode number of the product. Will limit the results to the specific product/model only. It is possible that you will get multiple results if several merchants have the same item for sale. note that not all merchants provide EANs for their product data feeds, therefore not all products in our database can be found using their article number
         * items: Total maximum of records that must be returned
         * page: Starting position records
         * @param function cb
         */
        product: function(params, cb) {
            let URL = this.createurl("https://api.zanox.com/json/2011-03-01/products", params);
            this.getinapi(URL, "/products", cb);
        },
        
        /**
         * Retrieve a list of your leads transactions tracked by zanox
         * 
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-leads-date
         * @param string date (YYYY-MM-DD)
         * date: URL path parameter. Request leads for this date (YYYY-MM-DD)
         * datetype: Request leads according to when they were tracked ("tracking_date"), when they were last modified in any way ("modified_date") or when the review state was changed ("review_state_changed_date"). Default is tracking_date
         * program: Limits results to those that are associated with a particular program
         * adspace: Limits results to those that are associated with a particular Adspace
         * state: Limits results to leads having one of the following review states (confirmed, open, approved, rejected)
         * items: Total maximum of records that must be returned
         * page: Starting position records
         * @param object params
         * @param function cb
         */
        leads: function(date, params, cb) {
            let URL = this.createurl("https://api.zanox.com/json/2011-03-01/reports/leads/date/" + date, params);
            this.getinapi(URL, "/reports/leads/date", cb);
        },
        
        /**
         * Retrieve a list of your sales transactions tracked by zanox
         * 
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-sales-date
         * @param string date (YYYY-MM-DD)
         * date: URL path parameter. Request leads for this date (YYYY-MM-DD)
         * datetype: Request leads according to when they were tracked ("tracking_date"), when they were last modified in any way ("modified_date") or when the review state was changed ("review_state_changed_date"). Default is tracking_date
         * program: Limits results to those that are associated with a particular program
         * adspace: Limits results to those that are associated with a particular Adspace
         * state: Limits results to leads having one of the following review states (confirmed, open, approved, rejected)
         * items: Total maximum of records that must be returned
         * page: Starting position records
         * @param object params
         * @param function cb
         */
        sales: function(date, params, cb) {
            let URL = this.createurl("https://api.zanox.com/json/2011-03-01/reports/sales/date/" + date, params);
            this.getinapi(URL, "/reports/sales/date", cb);
        },
        
        /**
         * Returns basic statistics of clicks, views, leads and sales
         * 
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-reportbasic
         * @param object params
         * fromdate: start date of the timeperiod to get a report. startdate is inclusive. ie. transactions of this date will be in the result
         * todate: to date of the timeperiod to get a report. enddate is inclusive. ie. transactions of this date will be in the result
         * datetype: datetype specifies the date parameter above. Currently only the TRACKING_DATE is supported
         * currency: The API does not do any currency conversion; only results from the selected currency will be displayed
         * program: filter your reports for specified programs 
         * admedium: filter your reports for specified admedia 
         * adspace: filter your reports for specified adspace
         * state: filter your reports for specified state
         * groupby: a list of grouping parameters defines for which parameters the reports should be grouped.(CURRENCY, ADMEDIUM, PROGRAM, ADSPACE, LINK_FORMAT, MEDIA_SLOT, MONTH, DAY, YEAR)
         * @param function cb
         */
        reportbasic: function(params, cb) {
            let URL = this.createurl("https://api.zanox.com/json/2011-03-01/reports/basic", params);
            this.getinapi(URL, "/reports/basic", cb);
        },

        /**
         * Get advertiser programs
         *
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-programs
         * @param object params         *
         * q: Limits results to products associated with this search string
         * startdate: Limits results to programs activated after this date
         * region: Limits results to a particular region
         * partnership: Limits results to programs with mandatory direct applications ("DIRECT") or not requiring direct application ("INDIRECT")
         * industry: Limit results to programs that belong to the specified industry (see table below under section Industry Values to Use)
         * isexclusive: Limits results to programs with products
         * items: Total maximum of records that must be returned
         * page: Starting position records
         * @param function cb
         */
        programs: function(params, cb) {
            let URL = this.createurl("https://api.zanox.com/json/2011-03-01/programs", params);
            this.getinapi(URL, "/programs", cb);
        },
        
        /**
         * Apply to advertiser programs, get your applications, end partnerships
         *
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-programapplications
         * @param object params
         * program: Limits results to a particular program
         * adspace: Limits results to incentives that have tracking links associated with this ad space
         * status: Restrict results to program applications with one of the following statuses
         * items: Total maximum of records that must be returned
         * page: Starting position records
         * @param function cb
         */
        programapplications: function(params, cb) {
            let URL = this.createurl("http://api.zanox.com/json/2011-03-01/programapplications", params);
            this.getinapi(URL, "/programapplications", cb);
        },     
        
        /**
         * Get account balances
         * 
         * @see https://developer.zanox.com/web/guest/publisher-api-2011/get-payments-balances
         * @param object params
         * items: Total maximum of records that must be returned
         * page: Starting position records 
         * @param function cb
         */
        accountbalances: function(params, cb) {
            let URL = this.createurl("https://api.zanox.com/json/2011-03-01/payments/balances", params);
            this.getinapi(URL, "/payments/balances", cb);
        }
    }
}
