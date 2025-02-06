function doGet() {
  var properties = PropertiesService.getUserProperties();
  
  // Clear the conversation context when the page is loaded
  properties.deleteProperty('conversationContext');

  return HtmlService.createHtmlOutputFromFile('chat'); // 'chat' refers to your HTML file
}

function getBotResponse(userMessage) {
  var properties = PropertiesService.getUserProperties();

  // Retrieve the current context (conversation memory)
  var currentContext = properties.getProperty('conversationContext') || '';  // If there's no context, start with an empty string

  // Get the data from your Google Sheet
  var sheet = SpreadsheetApp.openById("1Ni-VGYiVmLUiu1a-d2CXM2nh8jSPOfHow9VXeCek21w").getActiveSheet();
  var data = sheet.getDataRange().getValues();  

  // Prepare the sheet's data as context (this can be limited to only relevant information)
  var sheetContext = '';
  for (var i = 1; i < data.length; i++) {
    sheetContext += 'Row ' + (i + 1) + ': ';
    for (var j = 0; j < data[i].length; j++) {
      sheetContext += data[i][j] + ' ';
    }
    sheetContext += '\n'; // Separate rows
  }

  // Combine the user's message with the context from the sheet
  var newContext = currentContext + '\n' + 'User: ' + userMessage + '\nBot:';

  // Send the combined context and user message to get the AI's response
  var aiResponse = getAIResponse(userMessage, sheetContext + newContext);

  // Save the updated context for the next request
  properties.setProperty('conversationContext', newContext + ' ' + aiResponse);

  return { response: aiResponse };
}

function getAIResponse(userMessage, context) {
  var apiKey = "<your-api-key>"; // Replace with your actual API key

  var prompt = "You are a helpful assistant. Below is the data from the user's Google Sheet:\n" + context +
               "User has asked: " + userMessage + "\n\nYour response:";

  var payload = {
    "model": "gpt-3.5-turbo", 
    "messages": [
      {"role": "system", "content": "You are a helpful assistant that can respond based on the provided data."},
      {"role": "user", "content": prompt}
    ],
    "max_tokens": 150
  };

  var options = {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    "payload": JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
  var jsonResponse = JSON.parse(response.getContentText());

  return jsonResponse.choices[0].message.content;
}
