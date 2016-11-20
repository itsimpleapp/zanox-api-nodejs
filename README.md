# Zanox API

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/andrehrf/zanox-api-nodejs/master/LICENSE)
[![npm version](https://badge.fury.io/js/zanox-api.svg)](https://badge.fury.io/js/zanox-api)

API integration with Zanox 

## Install

```bash
$ npm install zanox-api
```

## Get ConnectID and SecretKey

* Create account - https://marketplace.zanox.com/publisher-signup
* ConnectID and SecretKey - https://developer.zanox.com/blog?p_p_id=148_INSTANCE_n5kwq91nKP5Y&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&p_p_col_id=column-2&p_p_col_count=1&p_r_p_564233524_tag=publisher+api&p_r_p_564233524_resetCur=true
* Adspace Management - http://www.zanox.com/gb/publishers/faq/ad-space-management/
 
## Usage

```js
"use strict";

let Zanox = require("./index.js"),
    zanox = new Zanox("connectid", "secretkey");

zanox.programs({region: "BR"}, function(err, result){
    console.log(result.programItems.programItem);
});

zanox.programapplications({region: "BR"}, function(err, result){
    console.log(result.programApplicationItems.programApplicationItem);
});

zanox.deeplink("http://www.extra.com.br/", "adspace", function(err, url){
    console.log(url); //https://ad.zanox.com/ppc/?40352125C16456675&ULP=[[http://www.extra.com.br/?utm_source=zanox&utm_medium=deeplink&utm_campaign=deeplink]]
});
```

## License

  MIT
  
  Copyright (C) 2016 André Ferreira

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.