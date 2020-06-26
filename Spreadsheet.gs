/**
 * @OnlyCurrentDoc
 */

Logger.log("At start of Spreadsheet.gs");


//--------------------------------------------------------------------------------------


/*
  This function returns true if two given ranges intersect, false otherwise.
  Taken from https://stackoverflow.com/questions/36358955/google-app-script-check-if-range1-intersects-range2
*/
function RangeIntersect(R1, R2) 
{
  var LR1 = R1.getLastRow();
  var Ro2 = R2.getRow();
  if (LR1 < Ro2) return false;


  var LR2 = R2.getLastRow();
  var Ro1 = R1.getRow();
  if (LR2 < Ro1) return false;

  var LC1 = R1.getLastColumn();
  var C2 = R2.getColumn();
  if (LC1 < C2) return false;

  var LC2 = R2.getLastColumn();
  var C1 = R1.getColumn();
  if (LC2 < C1) return false;

  return true;
} // RangeIntersect()
