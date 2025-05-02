import axios from "axios";
const logsnagKey = "6a5c6f1b3867bed8826afa2959022cd7";
export default async function sendError(phoneNumber, location, error, body) {
  const datass = {
    event: `${phoneNumber} encountered an error!`,
    project: "dollarydoo",
    channel: "errorlog",
    description: `User : ${phoneNumber}\nAt : ${location}\nError : ${error}\nPassed data : ${body}`,
    icon: "🚫",
    notify: true,
  };
  const configs = {
    headers: {
      Authorization: `Bearer ${logsnagKey}`,
      "Content-Type": "application/json",
    },
  };
  axios.post("https://api.logsnag.com/v1/log", datass, configs);
}
