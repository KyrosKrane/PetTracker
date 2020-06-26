/**
 * @OnlyCurrentDoc
 */

Logger.log("At start of Access.gs");


//--------------------------------------------------------------------------------------


/*
    This function gets a named range. Shortcut for less typing...
*/
function GetRange(RangeName) 
{
  return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(RangeName);
} // GetRange()


//--------------------------------------------------------------------------------------


/*
    This function writes a value to a named range in the spreadsheet.
    Return value is the same as the value of the write attempt.
*/
// Can't enable this function because it triggers Google permission issues
/*
function WriteRange(RangeName, Value) 
{
  return SpreadsheetApp.getActiveSpreadsheet().getRangeByName(RangeName).getCell(1, 1).setValue(Value);
} // WriteRange()
*/

//--------------------------------------------------------------------------------------


/*
  This function accepts the name of a defined range and returns the value of the first cell in that range.
  Intended to retrieve the value of a one-cell named range.
*/
function ReadRange(RangeName)
{
  if (!RangeName) RangeName="ClientID";
  var value = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(RangeName).getCell(1, 1).getValue();
  Logger.log("In Read, for range name %s, value is %s", RangeName, value);
  return value;
} // ReadRange()
