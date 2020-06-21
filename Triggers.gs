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
  WriteRange('AutoUpdate', Math.random())
} // ForceUpdate()


//--------------------------------------------------------------------------------------


/*
  This function updates a hidden cell to a random value; that value is then passed to GetAPIToken() to force an update periodically.
  It's invoked by an external trigger that runs on a set schedule.
*/
function ForceTokenUpdate()
{
  WriteRange('TokenAutoUpdate', Math.random())
} // ForceTokenUpdate()


//--------------------------------------------------------------------------------------


/*
  This function is executed when the sheet is opened.
*/
function onOpen(e) 
{
  WriteRange('TokenAutoUpdate', Math.random());
  WriteRange('AutoUpdate', Math.random());
} // onOpen()

/*
function onSelectionChange(e)
{
  GetAPIToken(ReadRange('AutoUpdate'));
} // onSelectionChange()

function onEdit(e)
{
  GetAPIToken(ReadRange('AutoUpdate'));
} // onEdit()
*/
