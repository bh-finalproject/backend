const cookie = require('cookie');

function cookienize(token){
    const secureCookie = true;
    const httpOnlyCookie = true;
    const cookieOptions = {
      secure: secureCookie,
      httpOnly: httpOnlyCookie,
    };
  
    const cookieString = cookie.serialize('access_token', 'Bearer '+ token, cookieOptions);

    return cookieString
}

function decookienize(str){
    const res = cookie.parse(str)

    return res

}


module.exports = {cookienize, decookienize}