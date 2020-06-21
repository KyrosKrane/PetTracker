/**
 * @OnlyCurrentDoc
 */

Logger.log("At start of Code.gs");


//--------------------------------------------------------------------------------------

/* Documentation overview

How to check for a pet

Step 1: Get character details
Step 2: Get pet name
Step 3: Check if a current copy of the character is cached.
Step 3a: if not cached, then refresh from API (see sub process)
Step 3b: if not cached and not found via API, return an error
Step 4: Get count of known pets by that name
Step 5: return the value

*/

//--------------------------------------------------------------------------------------


// Set up some data for testing the script
var TestCharacter = 'Christiane';
var TestRealm = 'Bloodhoof';
var TestRegion = 'US';

var TestBlizzard_CharInfo = '{"_links":{"self":{"href":"https://us.api.blizzard.com/profile/wow/character/bloodhoof/christiane/collections/pets?namespace=profile-us"}},"pets":[{"species":{"key":{"href":"https://us.api.blizzard.com/data/wow/pet/1152?namespace=static-8.3.0_32861-us"},"name":"Chrominius","id":1152},"level":25,"quality":{"type":"RARE","name":"Rare"},"stats":{"breed_id":6,"health":1644,"power":276,"speed":260},"is_favorite":true,"creature_display":{"key":{"href":"https://us.api.blizzard.com/data/wow/media/creature-display/46925?namespace=static-8.3.0_32861-us"},"id":46925},"id":102220891},{"species":{"key":{"href":"https://us.api.blizzard.com/data/wow/pet/1149?namespace=static-8.3.0_32861-us"},"name":"Corefire Imp","id":1149},"level":25,"quality":{"type":"RARE","name":"Rare"},"stats":{"breed_id":8,"health":1400,"power":289,"speed":289},"creature_display":{"key":{"href":"https://us.api.blizzard.com/data/wow/media/creature-display/46923?namespace=static-8.3.0_32861-us"},"id":46923},"id":117541659}],"unlocked_battle_pet_slots":3}';
var TestPetName = ["Chrominius", "Corefire Imp", "Fake Pet", "Broot"];


//--------------------------------------------------------------------------------------


/*
 Gets an empty character info structure
*/
function GetEmptyCharInfo()
{
  return {'Pets':{}};
} // GetEmptyCharInfo()


//--------------------------------------------------------------------------------------


/*
  This function parses the API data returned by Blizzard and returns the pet info in string-encoded JSON format.
*/
function ParseCharacterInfo(Blizzard_CharInfo)
{
  // For testing, supply a dummy API response.
  if (!Blizzard_CharInfo) Blizzard_CharInfo = TestBlizzard_CharInfo;
  
  Logger.log('In ParseCharacterInfo, length of Blizzard_CharInfo is ' + Blizzard_CharInfo.length);
  
  // Convert API response to JS object
  var Blizzard_CharInfo_JSON = JSON.parse(Blizzard_CharInfo);
  
  // Read the info we need and store it in a Javascript style map, with the pet name as the key.
  var CharInfo = GetEmptyCharInfo();
  
  // Keep a count of total and unique pets for debugging
  var TotalPets = 0;
  var UniquePets = 0;

  for (var Key in Blizzard_CharInfo_JSON.pets)
  {
    var PetName = Blizzard_CharInfo_JSON.pets[Key].species.name;
    // too spammy unless debugging is needed
    // Logger.log('Found key = ' + Key + ', PetName = ' + PetName);
    
    if (! CharInfo.Pets[PetName])
    {
      CharInfo.Pets[PetName] = 1;
      UniquePets++;
    }
    else
    {
      CharInfo.Pets[PetName]++;
    }
    TotalPets++;
    
  } // foreach pet in API response
  
  Logger.log('In ParseCharacterInfo, detected %s unique pets and %s total pets.', UniquePets, TotalPets);

  // Convert the pet info to a string for storage
  var CharInfoString = JSON.stringify(CharInfo);
  
  // Log for debugging
  // Logger.log('In ParseCharacterInfo, CharInfoString is ' + CharInfoString);
  
  // Send back the string.
  return CharInfoString;

} // ParseCharacterInfo()


//--------------------------------------------------------------------------------------

/*
  This function searches a character's parsed info for a given pet and returns the number owned.
  PetName can also be an array of pet names.
*/
function GetPetCount(PetName, CharInfo)
{
  // If the user passed in a range, call the function for each pet in the range.
  if (typeof PetName.map === "function") 
  {
    Logger.log("In GetPetCount, range detected. Mapping.");
    return PetName.map(
      function(x) { return GetPetCount(x, CharInfo); }
    );
  } // If multiple values passed in.
  
  // Else it's one pet name only
 
  // Check for a blank pet name and return if so
  if (!PetName || "" == PetName) 
  {
    Logger.log("In GetPetCount, Blank pet name. Returning empty string.");
    return "";
  }
  // Parse the cache to find the pet count
  if (CharInfo.Pets[PetName])
  {
    Logger.log('In GetPetCount, Found match for %s, returning value %s', PetName, CharInfo.Pets[PetName]);
    return CharInfo.Pets[PetName];
  }
  // If we get here, the desired pet wasn't found.
  Logger.log("In GetPetCount, pet %s not found, returning 0.", PetName);
  return 0;
} // GetPetCount()


//--------------------------------------------------------------------------------------


/*
  This function updates a given toon's info from Blizzard, then checks how many of a specific pet that toon has learned.
  PetName can also be an array of pet names.
  Note that ChangeChecker is not used in the function. It's just there to force Google Sheets to recalculate periodically.
*/
function CheckPet(PetName, Region, Realm, Character, ChangeChecker)
{
  Logger.log('Starting CheckPet');
  
  // Check for a blank toon name and return if so
  if (PetName && ! (Region && Realm && Character)) 
  {
    Logger.log("In CheckPet, Blank or incomplete toon but pet name supplied. Returning empty string.");
    return "";
  }
    
  // Debug values for testing
  if (!PetName) PetName = TestPetName;
  if (!Region) Region = TestRegion;
  if (!Realm) Realm = TestRealm;
  if (!Character) Character = TestCharacter;
  
  Logger.log('In CheckPet, PetName is ' + PetName);
  Logger.log('In CheckPet, Region is ' + Region);
  Logger.log('In CheckPet, Realm is ' + Realm);
  Logger.log('In CheckPet, Character is ' + Character);

  // get the pet details
  var CharInfoString = GetCharInfoFromBlizz(Region, Realm, Character);
  
  // Make sure we have a valid data set - if not, it usually means the character doesn't exist.
  if (!CharInfoString || 404 == CharInfoString)
  {
    Logger.log('Did not find stored info for %s', Character);
    return "Invalid Character";
  }
  else if (999 == CharInfoString)
  {
    Logger.log('Got out of date error');
    return "Reload spreadsheet";
  } 
  Logger.log('Found stored info for %s', Character);
  // too spammy unless debugging is needed
  // Logger.log('Stored info is %s', CharInfoString);
  
  // If we get here, the toon has been found and the cache is current.
  Logger.log('Parsing data into object');
  var CharInfo = JSON.parse(CharInfoString);
  
  // Get and return the actual counts
  return GetPetCount(PetName, CharInfo)
} // CheckPet()


