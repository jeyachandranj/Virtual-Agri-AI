import { io } from "socket.io-client";

class ChatbotService {
  constructor() {
    //this.socket = io();

    // this.socket = io("https://interviewserver.thinklogics.in");
    this.socket = io("http://localhost:3000");


  }

  async init(settings) {
    const lang = localStorage.getItem('language');

   
    this.socket.emit("init",{language:lang});

    let response = await new Promise((resolve, reject) => {
      this.socket.on("responseInit", (response) => {
        if (response) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    });

    return response;
  }

  async sendMessage(message) {

    this.socket.emit("message", { question: message});

    let response = await new Promise((resolve, reject) => {
      this.socket.on("responseMessage", (response) => {
        if (response) {
          resolve(response);
        } else {
          reject(response);
        }
      });
    });

    return response;
  }
}

export const chatbotService = new ChatbotService();


	
