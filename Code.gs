function doGet() {
  return HtmlService.createHtmlOutputFromFile('chat'); // 'chat' refers to your HTML file
}

function getBotResponse(userMessage) {
  // Get the data from your Google Sheet
  var sheet = SpreadsheetApp.openById("1Ni-VGYiVmLUiu1a-d2CXM2nh8jSPOfHow9VXeCek21w").getActiveSheet();
  var data = sheet.getDataRange().getValues();  

  // Prepare the entire sheet's data as context
  var context = '';
  for (var i = 1; i < data.length; i++) {
    // Loop through each row and concatenate all columns as context
    context += 'Row ' + (i + 1) + ': ';
    for (var j = 0; j < data[i].length; j++) {
      context += data[i][j] + ' '; // Add each cell's content
    }
    context += '\n';  // Separate rows
  }

  // Pass the entire sheet context along with the user's message to ChatGPT
  var aiResponse = getAIResponse(userMessage, context);
  return { response: aiResponse };
}

function getAIResponse(userMessage, context) {
  // Your OpenAI API key (use your actual API key)
  var apiKey = "<Your-API-Key>"; // Replace with your actual API key

  // Set up the API request payload
  var prompt = "You are a helpful assistant. Below is the data from the user's Google Sheet:\n" + context +
               "User has asked: " + userMessage + "\n\nYour response:";

  var payload = {
    "model": "gpt-3.5-turbo",  // Use the appropriate model
    "messages": [
      {"role": "system", "content": "You are a helpful assistant that can respond based on the provided data."},
      {"role": "user", "content": prompt}
    ],
    "max_tokens": 150
  };

  // Make the HTTP request to the OpenAI API
  var options = {
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    "payload": JSON.stringify(payload)
  };

  // Send the request and parse the response
  var response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
  var jsonResponse = JSON.parse(response.getContentText());

  // Extract and return the AI's response
  return jsonResponse.choices[0].message.content;
}
