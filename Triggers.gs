/**
 * @OnlyCurrentDoc
 */

Logger.log("At start of Triggers.gs");


//--------------------------------------------------------------------------------------


/*
  This function updates a hidden cell to a random value; that value is then passed to CheckPet() to force an update periodically.
  It's invoked by an external trigger that runs on a set schedule.
*/
function ForceUpdate()
{
  Set('AutoUpdate', Math.random())
} // ForceUpdate()

