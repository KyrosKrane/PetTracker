/**
 * @OnlyCurrentDoc
 */


Logger.log("At start of Blizzard.gs");


// This variable is a check for whether a token update is in progress, to prevent excessive calls to the Blizzard token API.
var TokenUpdateInProgress = false;


/*
    This function requests an API token from Blizzard.
    If a valid token is still cached, that's returned directly.
    Note that ChangeChecker is not used in the function. It's just there to force Google Sheets to recalculate periodically.
*/
function GetAPIToken(ChangeChecker)
{
  Logger.log("In GetAPIToken, Starting.");
  // Check if a token already exists and is valid.
  var StoredToken = ReadRange('Token');
  var StoredTokenExpiry = ReadRange('TokenExpiry');
  var Now = (new Date).getTime() + 10000; // add ten seconds to "now" to account for round trip time on the request and response.
  
  if (StoredToken && StoredTokenExpiry && StoredTokenExpiry > Now)
  {
    // Token is good, nothing to do
    Logger.log("Existing Token is good.");
    return ["", StoredToken, StoredTokenExpiry];
  }
  
  // Check if another call is already updating the token, and if not, set the flag
  if (TokenUpdateInProgress)
  {
    Logger.log("Token update already in progress, exiting early.");
    return;
  }
  TokenUpdateInProgress = true;
  
    // If we reach here, we need a new token.
    Logger.log("In GetAPIToken, Getting new token.");
  
    const ClientId = ReadRange('ClientId');
    const ClientSecret = ReadRange('ClientSecret');
  
    // Set the authentication credentials
    var headers = {
      "Authorization" : "Basic " + Utilities.base64Encode(ClientId + ':' + ClientSecret)
    };
  
    // Make a POST request with form data.
    var formData = {
      'grant_type': 'client_credentials'
    };
  
    // Assemble the parameters
    // Because payload is a JavaScript object, it is interpreted as
    // as form data. (No need to specify contentType; it automatically
    // defaults to either 'application/x-www-form-urlencoded'
    // or 'multipart/form-data')
    var params  = {
      'method' : 'post',
      'headers' : headers,
      'payload' : formData
      // , 'muteHttpExceptions': true // disabled for testing, should probably enable for prod
    };
  
    // Set the URL for the request
    var Token_URL = 'https://us.battle.net/oauth/token';
  
    // Make the request and get the response.
    var response = UrlFetchApp.fetch(Token_URL, params);
    Logger.log("In GetAPIToken, response = " + response);
  
    // Parse the response.
    var TokenObj = JSON.parse(response);
    var Token = TokenObj.access_token;
    var TokenExpiry = TokenObj.expires_in * 1000 + (new Date).getTime() - 5000;
    Logger.log("In GetAPIToken, Token = " + Token);
    Logger.log("In GetAPIToken, TokenExpiry = " + TokenExpiry);
  
  // Mark that we are no longer updating the token
  TokenUpdateInProgress = false;
  
  // Store the token for reuse
  return(["", Token, TokenExpiry]);
  //WriteRange('Token', Token);
  //WriteRange('TokenExpiry', TokenExpiry);
  
  
  // @TODO: No error handling at all!
  
} // GetAPIToken()


//--------------------------------------------------------------------------------------


/*
  This function marks the token we have from Blizzard as expired to force a reauthorization.
*/
function InvalidateToken()
{
  WriteRange('TokenExpiry', 1); // set the token expiry to be in the past (in 1970!)
} // InvalidateToken()


//--------------------------------------------------------------------------------------


/*
  This function gets the data from the Blizzard API
*/
function GetCharInfoFromBlizz(Region, Realm, Character, Recursion)
{
  Logger.log('Starting GetCharInfoFromBlizz');
  
  // Debug values for testing
  if (!Region) Region = TestRegion;
  if (!Realm) Realm = TestRealm;
  if (!Character) Character = TestCharacter;
  
  // Set the level of recursion
  if (!Recursion) Recursion = 0;
  
  Logger.log('In GetCharInfoFromBlizz, Region is ' + Region);
  Logger.log('In GetCharInfoFromBlizz, Realm is ' + Realm);
  Logger.log('In GetCharInfoFromBlizz, Character is ' + Character);

  // US,EU,KR,TW,CN
  var Domain, Namespace;
  var Locale = "en_US";
  if ("US" == Region)
  {
    Domain = "us.api.blizzard.com";
    Namespace = "profile-us";
  }
  else  if ("EU" == Region)
  {
    Domain = "eu.api.blizzard.com";
    Namespace = "profile-eu";
  }
  else  if ("KR" == Region)
  {
    Domain = "kr.api.blizzard.com";
    Namespace = "profile-kr";
  }
  else  if ("TW" == Region)
  {
    Domain = "tw.api.blizzard.com";
    Namespace = "profile-tw";
  }
  else if ("CN" == Region)
  {
    Domain = "gateway.battlenet.com.cn";
    Namespace = "profile-cn";
  }
  Logger.log('In GetCharInfoFromBlizz, Domain is ' + Domain);
  
  // Clean up the server name. Apostrophes removed. Spaces converted to dashes.
  Realm = Realm.replace("'", "");
  Realm = Realm.replace(" ", "-");javascript:;
  Logger.log('In GetCharInfoFromBlizz, after cleanup, Realm is ' + Realm);
  
  
  // Assemble the request URL
  var URL = 'https://' + Domain + '/profile/wow/character/' + Realm.toLowerCase() + '/' + Character.toLowerCase() + '/collections/pets?locale=' + Locale + '&namespace=' + Namespace + '&access_token=' + ReadRange("Token");
  Logger.log('In GetCharInfoFromBlizz, URL is ' + URL);

  // Set the requested type of response.
  var headers = {
    "Accept" : "application/json"
  };
  
  // Assemble the parameters
  var params  = {
    'method' : 'get',
    'headers' : headers,
    'muteHttpExceptions': true // disabled for testing, should probably enable for prod
  };
  
  // Make the request and get the response.
  var response = UrlFetchApp.fetch(URL, params);
  Logger.log("response = " + response.getContentText().substr(1,500));
  Logger.log("ResponseCode = " + response.getResponseCode());
  
  // Check the response to make sure it's OK.
  if (response.getResponseCode() == 200)
  {
    Logger.log("Got valid response");
    // Figure out what Blizz just told us and pass it back!
    return ParseCharacterInfo(response.getContentText());
  } // valid toon
  
  else if (response.getResponseCode() == 404)
  {
    Logger.log("Character was not found; storing an empty character set.");
    // Return an empty object to indicate no pets
    return 404;
  } // toon not found
  
  else
  {
    // One of the following happened:
    // We got a 401 response, indicating the token expired
    // Unknown error
    
    // In either case, the only solution is to ask the user to reload (which updates the token) and try again.
    Logger.log("Unhandled response, asking user to reload");
    return 999;
  } // Unhandled response
} // GetCharInfoFromBlizz()
