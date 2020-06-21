/**
 * @OnlyCurrentDoc
 */


Logger.log("At start of Caching.gs");

// Constants
// If we use the const keyword instead of var, Google bugs out and thinks we're redeclaring them. Have to keep as var.
var DELIMITER = '-';
var AllowedCacheTime = 300000; // 5 * 60 * 1000; // five minutes, in milliseconds


//--------------------------------------------------------------------------------------


/*
  Functions to simplify saving and retrieving data in Google's script properties store.
*/
function Get(key)
{
  return PropertiesService.getScriptProperties().getProperty(key);
}


function Set(key, value)
{
  PropertiesService.getScriptProperties().setProperty(key, value);
}


//--------------------------------------------------------------------------------------


/*
  This function checks whether a character's information is already in the cache and returns it.
  If it's not in the cache, it calls another function to fetch the info from Blizz's data, then caches the response.
*/
function CachingGetCharacterInfoString(Region, Realm, Character)
{
  var ToonID = [Region, Realm, Character].join(DELIMITER);
  
  // Check if this toon ID is already cached, and return if so
  var cache = CacheService.getScriptCache();
  var cached = cache.get(ToonID);
  if (cached != null) {
    return cached;
  }
  
  // Cache miss - get the data from the external source
  var result = GetInfoFromBlizz(Region, Realm, Character);
  
  // Save to cache and return the result.
  cache.put(ToonID, result, 5 * 60); // cache for 5 minutes, represented in seconds
  return result;
} // GetCharacterInfoString()


//--------------------------------------------------------------------------------------


/* 
  This function removes the cache for a given key, forcing an update from Blizz's servers.
*/
function RemoveCache(Region, Realm, Character)
{
  // Test setup
  if (!Region && !Realm && !Character) 
  {
    Region = TestRegion;
    Realm = TestRealm;
    //Character = TestCharacter;
    Character = 'Blowmer';
  } // if
  
  var ToonID = [Region, Realm, Character].join(DELIMITER);

  var cache = CacheService.getScriptCache();
  cache.remove(ToonID);
} // RemoveCache()


//--------------------------------------------------------------------------------------


/*
  Testing only function to delete all my toons from the cache
*/
function RemoveMyToons()
{
  var cache = CacheService.getScriptCache();
  cache.removeAll(['US-Bloodhoof-Cayana', 'US-Bloodhoof-Blowmer', 'US-Bloodhoof-Christiane']);
} // RemoveMyToons()



