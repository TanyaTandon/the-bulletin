
import axios from "axios";

const logsnagKey = "6a5c6f1b3867bed8826afa2959022cd7";

export default async function sendError(phoneNumber, location, error, body) {
  try {
    // Convert error object to string if it's an object
    const errorString = typeof error === 'object' ? 
      JSON.stringify(error, Object.getOwnPropertyNames(error)) : 
      String(error);
    
    // Convert body to string if it's an object
    const bodyString = typeof body === 'object' ? 
      JSON.stringify(body) : 
      String(body);
    
    const datass = {
      event: `${phoneNumber} encountered an error!`,
      project: "dollarydoo",
      channel: "errorlog",
      description: `User : ${phoneNumber}\nAt : ${location}\nError : ${errorString}\nPassed data : ${bodyString}`,
      icon: "🚫",
      notify: true,
    };
    
    const configs = {
      headers: {
        Authorization: `Bearer ${logsnagKey}`,
        "Content-Type": "application/json",
      },
    };
    
    await axios.post("https://api.logsnag.com/v1/log", datass, configs);
    return true;
  } catch (logError) {
    console.error("Failed to send error log:", logError);
    return false;
  }
}
