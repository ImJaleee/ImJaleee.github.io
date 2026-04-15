/**
 * TO DEPLOY:
 * 1. Create a new Google Spreadsheet
 * 2. Add Headers to row 1: Timestamp | Name | Message
 * 3. Go to Extensions > Apps Script
 * 4. Paste this code.
 * 5. Click "Deploy" > "New Deployment"
 * 6. Select type: "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Copy the generated Web App URL and paste it into `js/comments.js` -> `SCRIPT_URL`
 */

const SHEET_NAME = 'Sheet1';

// Handle GET Request (Fetch Comments)
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  // Get all data
  const data = sheet.getDataRange().getValues();
  
  const comments = [];
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1]) {
      comments.push({
        timestamp: row[0],
        name: row[1],
        message: row[2]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(comments))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST Request (Add Comment) - Allow form-urlencoded data to bypass CORS issues on JS fetch occasionally
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const timestamp = e.parameter.timestamp || new Date().toISOString();
    const name = e.parameter.name || 'Anonymous';
    const message = e.parameter.message || '';
    
    // Append to sheet
    sheet.appendRow([timestamp, name, message]);
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error",
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
