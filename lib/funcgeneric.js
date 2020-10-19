/*****************************************************************************************************
* 	Filename	: funcgeneric.js	
*	Author		: Sathrak Paldurai K
*	Date		: 26-07-2018	
******************************************************************************************************/
var mcrypt = require('mcrypt');
var MCrypt = mcrypt.MCrypt;

// Set up salt and IV
var DECRYPTKEY = 'kiarudlapkarhtas';
	
exports.empty = function (mixedVar) {
    // *     example 3: empty([]);
    // *     returns 3: true
    var undef
    var key
    var i
    var len
    var emptyValues = [undef, null, false, 0, '', '0']
    for (i = 0, len = emptyValues.length; i < len; i++) {
        if (mixedVar === emptyValues[i]) {
            return true
        }
    }
    if (typeof mixedVar === 'object') {
        for (key in mixedVar) {
            if (mixedVar.hasOwnProperty(key)) {
                return false
            }
        }
        return true
    }
    return false
}

exports.UnixTimeStamp = function () {
    return Math.floor(new Date().getTime() / 1000);
}

exports.millisecTime = function () {
    return new Date().getTime();
}


exports.trim = function(str, charlist) {
	// *     example 1: trim('    bharat matrimony    ');
	// *     returns 1: 'bharat matrimony'
	var whitespace, l = 0,
		i = 0;
	str += '';

	if (!charlist) {
		// default list
		whitespace = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
	} else {
		// preg_quote custom list
		charlist += '';
		whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
	}

	l = str.length;
	for (i = 0; i < l; i++) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(i);
			break;
		}
	}

	l = str.length;
	for (i = l - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(0, i + 1);
			break;
		}
	}

	return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}

exports.count = function(mixed_var, mode) {
	var key, cnt = 0;
	if (JSON.stringify(mixed_var) == "['']" || JSON.stringify(mixed_var) == '[""]' || mixed_var === null || typeof mixed_var === 'undefined') {
		return 0;
	} else if (mixed_var.constructor !== Array && mixed_var.constructor !== Object) {
		return 1;
	}

	if (mode === 'COUNT_RECURSIVE') {
		mode = 1;
	}
	if (mode != 1) {
		mode = 0;
	}

	for (key in mixed_var) {
		if (mixed_var.hasOwnProperty(key)) {
			cnt++;
			if (mode == 1 && mixed_var[key] && (mixed_var[key].constructor === Array || mixed_var[key].constructor === Object)) {
				cnt += this.count(mixed_var[key], 1);
			}
		}
	}
	return cnt;
}

/**
 * 
 * Function for Enrypt the UserId and Password and support to php decrypt to encrypt.  
 */
exports.encrypt = function(input){
	// Set algorithm and mode
	var rijndaelEcb = new MCrypt('rijndael-128', 'ecb');

	var ivSize = rijndaelEcb.getIvSize();
	var encval = pkcs5_pad(input,ivSize);

    var iv = rijndaelEcb.generateIv();           
	rijndaelEcb.open(DECRYPTKEY, iv);
 
	/** ENCRYPTION **/
	var cipher = rijndaelEcb.encrypt(encval);	 
	var cipherConcat = cipher.toString('base64');           
	console.log('Encrypted: ' + cipherConcat);
	return cipher.toString('base64');
}

exports.sencrypt = function(str,sKey){
	// Set algorithm and mode
	var rijndaelEcb = new MCrypt('rijndael-128', 'ecb');

	var ivSize = rijndaelEcb.getIvSize();
	var encval = pkcs5_pad(str,ivSize);

    var iv = rijndaelEcb.generateIv();           
	rijndaelEcb.open(sKey, iv); 
	/** ENCRYPTION **/
	var cipher = rijndaelEcb.encrypt(encval);
	return cipher.toString('base64');
}

/**
 * 
 * Function for Decrypt the UserId and Password and support to php encrypt to decrypt.  
 */
exports.decrypt = function(input){	
	// Set algorithm and mode
	var rijndaelEcb = new MCrypt('rijndael-128', 'ecb');

	var iv = rijndaelEcb.generateIv();           
	rijndaelEcb.open(DECRYPTKEY, iv);

	// Convert back from base64
	var ivAndCipherText = new Buffer(input, 'base64');

	var decrypted = rijndaelEcb.decrypt(ivAndCipherText).toString();
            
	var dec_s = strlen(decrypted);		
	var padding = ord(decrypted[dec_s-1]); 
	var decrypted = substr(decrypted, 0, -padding);
	console.log('Decrypted: ' + decrypted);
	return decrypted;
}

function pkcs5_pad (text, blocksize) { 
	var pad = blocksize - (strlen(text) % blocksize); 
	return text + str_repeat(chr(pad), pad); 
}

function chr (codePt) {		
	//   example 1: chr(75) === 'K'
	//   example 1: chr(65536) === '\uD800\uDC00'
	//   returns 1: true
	//   returns 1: true
  
	if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
	  //   enough for the UTF-16 encoding (JavaScript internal use), to
	  //   require representation with two surrogates (reserved non-characters
	  //   used for building other characters; the first is "high" and the next "low")
	  codePt -= 0x10000
	  return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF))
	}
	return String.fromCharCode(codePt)
}

function str_repeat (input, multiplier) { 
	//   example 1: str_repeat('-=', 10)
	//   returns 1: '-=-=-=-=-=-=-=-=-=-='
  
	var y = ''
	while (true) {
	  if (multiplier & 1) {
		y += input
	  }
	  multiplier >>= 1
	  if (multiplier) {
		input += input
	  } else {
		break
	  }
	}
	return y
}

function ord(string) {
	//    input by: incidence
	//   example 1: ord('K')
	//   returns 1: 75
	//   example 2: ord('\uD800\uDC00'); //create a single Unicode character
	//   returns 2: 65536
	var str = string + '';
	var code = str.charCodeAt(0);
	if (code >= 0xD800 && code <= 0xDBFF) {
		// High surrogate (could change last hex to 0xDB7F to treat
		// high private surrogates as single characters)
		var hi = code
		if (str.length === 1) {
			// This is just a high surrogate with no following low surrogate,
			// so we return its value;
			return code
			// we could also throw an error as it is not a complete character,
			// but someone may want to know
		}
		var low = str.charCodeAt(1)
		return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
	}
	if (code >= 0xDC00 && code <= 0xDFFF) {
		// Low surrogate
		// This is just a low surrogate with no preceding high surrogate,
		// so we return its value;
		return code;
		// we could also throw an error as it is not a complete character,
		// but someone may want to know
	}
	return code;
}


function substr(str, start, len) {
	// *       example 1: substr('abcdef', 0, -1);
	// *       returns 1: 'abcde'
	var i = 0,
		allBMP = true,
		es = 0,
		el = 0,
		se = 0,
		ret = '';
	str += '';
	var end = str.length;

	// BEGIN REDUNDANT
	this.php_js = this.php_js || {};
	this.php_js.ini = this.php_js.ini || {};
	// END REDUNDANT
	switch ((this.php_js.ini['unicode.semantics'] && this.php_js.ini['unicode.semantics'].local_value.toLowerCase())) {
		case 'on':
			// Full-blown Unicode including non-Basic-Multilingual-Plane characters
			// strlen()
			for (i = 0; i < str.length; i++) {
				if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
					allBMP = false;
					break;
				}
			}

			if (!allBMP) {
				if (start < 0) {
					for (i = end - 1, es = (start += end); i >= es; i--) {
						if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
							start--;
							es--;
						}
					}
				} else {
					var surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
					while ((surrogatePairs.exec(str)) != null) {
						var li = surrogatePairs.lastIndex;
						if (li - 2 < start) {
							start++;
						} else {
							break;
						}
					}
				}

				if (start >= end || start < 0) {
					return false;
				}
				if (len < 0) {
					for (i = end - 1, el = (end += len); i >= el; i--) {
						if (/[\uDC00-\uDFFF]/.test(str.charAt(i)) && /[\uD800-\uDBFF]/.test(str.charAt(i - 1))) {
							end--;
							el--;
						}
					}
					if (start > end) {
						return false;
					}
					return str.slice(start, end);
				} else {
					se = start + len;
					for (i = start; i < se; i++) {
						ret += str.charAt(i);
						if (/[\uD800-\uDBFF]/.test(str.charAt(i)) && /[\uDC00-\uDFFF]/.test(str.charAt(i + 1))) {
							se++; // Go one further, since one of the "characters" is part of a surrogate pair
						}
					}
					return ret;
				}
				break;
			}
		// Fall-through
		case 'off':
		// assumes there are no non-BMP characters;
		//    if there may be such characters, then it is best to turn it on (critical in true XHTML/XML)
		default:
			if (start < 0) {
				start += end;
			}
			end = typeof len === 'undefined' ? end : (len < 0 ? len + end : len + start);
			// PHP returns false if start does not fall within the string.
			// PHP returns false if the calculated end comes before the calculated start.
			// PHP returns an empty string if start and end are the same.
			// Otherwise, PHP returns the portion of the string from start to end.
			return start >= str.length || start < 0 || start > end ? !1 : str.slice(start, end);
	}
	return undefined;
}

function strlen(string) {
	// *     example 1: strlen('bharat van Fieldstudy');
	// *     returns 1: 19
	var str = string + '';
	var i = 0,
		chr = '',
		lgth = 0;

	if (!this.php_js || !this.php_js.ini || !this.php_js.ini['unicode.semantics'] || this.php_js.ini['unicode.semantics'].local_value.toLowerCase() !== 'on') {
		return string.length;
	}

	var getWholeChar = function (str, i) {
		var code = str.charCodeAt(i);
		var next = '',
			prev = '';
		if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
			if (str.length <= (i + 1)) {
				throw 'High surrogate without following low surrogate';
			}
			next = str.charCodeAt(i + 1);
			if (0xDC00 > next || next > 0xDFFF) {
				throw 'High surrogate without following low surrogate';
			}
			return str.charAt(i) + str.charAt(i + 1);
		} else if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
			if (i === 0) {
				throw 'Low surrogate without preceding high surrogate';
			}
			prev = str.charCodeAt(i - 1);
			if (0xD800 > prev || prev > 0xDBFF) { //(could change last hex to 0xDB7F to treat high private surrogates as single characters)
				throw 'Low surrogate without preceding high surrogate';
			}
			return false; // We can pass over low surrogates now as the second component in a pair which we have already processed
		}
		return str.charAt(i);
	};

	for (i = 0, lgth = 0; i < str.length; i++) {
		if ((chr = getWholeChar(str, i)) === false) {
			continue;
		} // Adapt this line at the top of any loop, passing in the whole string and the current iteration and returning a variable to represent the individual character; purpose is to treat the first part of a surrogate pair as the whole character and then ignore the second part
		lgth++;
	}
	return lgth;
}
