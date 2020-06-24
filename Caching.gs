/**
 * @OnlyCurrentDoc
 */

Logger.log("At start of Caching.gs");


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

