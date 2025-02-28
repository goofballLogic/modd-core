import { Hub } from "./hub.js";

function Alerter() {
  
  return (messageType, message) => {
  
    console.log(messageType, message);

  };

}

const main = Hub("main",
    new Alerter()
);

main(
  Symbol("Greeting"), 
  "Hello, world!"
);
