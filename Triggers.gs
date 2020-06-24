/**
 * @OnlyCurrentDoc
 */

Logger.log("At start of Triggers.gs");


//--------------------------------------------------------------------------------------


/*
  This function triggers whenever the user edits the sheet. We check if it's a specific cell. If it is, refresh the toon counts.
*/
function onEdit(e)
{
  var ManualUpdate = GetRange('ManualUpdate');
  var PeriodicUpdate = GetRange('PeriodicUpdate');
  var EditRange = e.range;
  
  if (RangeIntersect(ManualUpdate, EditRange) || RangeIntersect(PeriodicUpdate, EditRange))
  {
    // Can't use WriteRange because it triggers Google permissions flags
    SpreadsheetApp.getActiveSpreadsheet().getRangeByName('AutoUpdate').getCell(1, 1).setValue(Math.random());
  }
} // onEdit()


//--------------------------------------------------------------------------------------


/*
  This function is run when the sheet is opened.
  Use this to get the initial token and store it in the properties.
*/
function onOpen(e) 
{
  GetAPIToken();
} // onOpen()
