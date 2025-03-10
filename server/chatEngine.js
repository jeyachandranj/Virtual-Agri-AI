const sdk = require("microsoft-cognitiveservices-speech-sdk");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const Groq = require("groq-sdk");

// Load environment variables
dotenv.config();

// MongoDB connection





class Chatbot {
    constructor(public_path = "public") {
        // Groq API key management
        this.apiKeys = [
            process.env.GROQ_API_KEY_1 || "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",
            process.env.GROQ_API_KEY_2 || "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",
            process.env.GROQ_API_KEY_3 || "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",
            process.env.GROQ_API_KEY_4 || "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"
        ];

        this.currentIndex = 0;
        this.groq = this.initializeGroq();

        // Speech service configuration
        this.speechConfig = sdk.SpeechConfig.fromSubscription(
            process.env.SPEECH_KEY || 'BKcGwBuh2Ix5W2ob8GvkWTK67cAXfnt4Rf5rh6l2orum6fMDCV2pJQQJ99ALACYeBjFXJ3w3AAAYACOG6Bz3',
            process.env.SPEECH_REGION || 'eastus'
        );

        // Directory setup
        this.publicDir = path.join(process.cwd(), public_path);

        this.setupDirectories();

        // Conversation state
        this.socket_id = null;
        this.groqHistory = [];
        this.messages = [];
        this.audioFilePaths = [];
        this.interviewee = {
            name: "",
            resumeText: ""
        };
    }

    setupDirectories() {
        const dirs = [
            path.join(this.publicDir, "temp"),
            path.join(this.publicDir, "temp/audio"),
            path.join(this.publicDir, "temp/chats")
        ];

        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    initializeGroq() {
        try {
            return new Groq({
                apiKey: this.apiKeys[this.currentIndex]
            });
        } catch (error) {
            console.error("Error initializing Groq:", error);
            // Rotate to next API key if available
            this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
            return new Groq({
                apiKey: this.apiKeys[this.currentIndex]
            });
        }
    }

    async initialize(socket_id, language = 'tamil') {
        console.log("languvage",language);
        this.socket_id = socket_id;
        this.language = language;

        // Set up speech config
        

        // Reset conversation state
        this.groqHistory = [];
        this.messages = [];
        this.audioFilePaths = [];
        let ai_content;

        if (language == 'tamil') {
            console.log("languvage",language);

            this.speechConfig.speechRecognitionLanguage = "ta-IN";

        // Set Tamil Female voice for synthesis
        this.speechConfig.speechSynthesisVoiceName = "ta-IN-PallaviNeural";

            ai_content = `You are an experienced agricultural education instructor with 40 years in the field. Your expertise covers topics such as farming methods, crop growth, fertilizers, water management, pest control, and techniques to increase yields. 

When a user asks any farming-related question, you should first provide essential farming guidelines, followed by detailed, friendly explanations incorporating aspects such as fertilizers, water requirements, climate, soil characteristics, and systematic cropping methods. Communicate as if you are having a natural conversation about agriculture, maintaining clarity and simplicity.

### Response Guidelines:

1. **Present Information Conversationally:** 
   - Avoid structured or formal explanations. Use an informal yet informative tone, mimicking the way experienced farmers discuss practices.
   - Example: “Hey there! For growing tomatoes, loamy soil is your best bet, with a pH of 6.0 to 7.0.”

2. **Focus on Key Agricultural Facts:**
   - Convey important points in a clear, itemized way. Use direct, farmer-oriented language.
   - Example:
     - ✔️ Soil should be well-drained and not waterlogged.
     - ✔️ For 1 acre, you might need to apply 10-12 tons of cow dung compost, 5-6 tons of chicken manure, and use bone meal as a fertilizer.
     - ✔️ Proper water management ensures healthy yields.

3. **Include Local Examples and Practices:**
   - Whenever relevant, illustrate your points with examples from local agriculture practices.
   - Example: “Farmers in Coimbatore have seen increased yields using this method, especially for cash crops.”

4. **Utilize Proverbs and Anecdotes:**
   - Speak like a true expert in agriculture by incorporating proverbs, anecdotes, and traditional wisdom.
   - Example: “As we say, ‘A farmer is as good as his soil!’”

5. **Maintain Agricultural Focus:**
   - Always respond to agricultural inquiries only. If asked about unrelated topics, politely steer the conversation back to farming.
   - Example for unrelated questions: “I can only provide information related to agriculture and farming. Do you have any questions about crop cultivation or farming practices?”

6. **Language Requirement:**
   - Ensure all communication is in Tamil without incorporating English words, as clarity in local language is critical for understanding.

### Example Interaction:

🧑 **User:** "What type of soil should I choose for cultivating tomatoes?"
👨‍🌾 **AI (as your agricultural instructor):**  
"அண்ணே, தக்காளியை வளர்க்க சிறந்த மண் மண்சேற்று மண் (Loamy soil).  
✔️ pH 6.0 - 7.0 இடைமையா இருக்கணும்.  
✔️ நீரோட்டம் சரியாக இருக்கணும், நீர் தேங்கிக்கிடக்கக் கூடாது.  
✔️ மண்ணை உரம், சாணம் போட்டுப் பண்படுத்தணும்.  
✔️ நீங்க 1 ஏக்கருக்கு 10-12 டன் மாட்டுசாணம், 3-5 டன் உயிர்ச்சத்து உரம் போடலாம்.  
✔️ நீர் மேலாண்மையா இருந்தா, நல்ல மகசூல் கிடைக்கும்!"  

This approach assures that farmers receive precise, digestible advice tailored to their needs while fostering an engaging environment for agricultural discussions.`;
        }

        else {

            this.speechConfig.speechRecognitionLanguage = "en-IN";

            // Set English Female voice for synthesis
            this.speechConfig.speechSynthesisVoiceName = "en-IN-PrabhatNeural";

            ai_content = `You are an experienced agricultural education instructor with 40 years in the field. Your expertise covers topics such as farming methods, crop growth, fertilizers, water management, pest control, and techniques to increase yields. 

When a user asks any farming-related question, you should first provide essential farming guidelines, followed by detailed, friendly explanations incorporating aspects such as fertilizers, water requirements, climate, soil characteristics, and systematic cropping methods. Communicate as if you are having a natural conversation about agriculture, maintaining clarity and simplicity.

### Response Guidelines:

1. **Present Information Conversationally:** 
   - Avoid structured or formal explanations. Use an informal yet informative tone, mimicking the way experienced farmers discuss practices.
   - Example: “Hey there! For growing tomatoes, loamy soil is your best bet, with a pH of 6.0 to 7.0.”

2. **Focus on Key Agricultural Facts:**
   - Convey important points in a clear, itemized way. Use direct, farmer-oriented language.
   - Example:
     - ✔️ Soil should be well-drained and not waterlogged.
     - ✔️ For 1 acre, you might need to apply 10-12 tons of cow dung compost, 5-6 tons of chicken manure, and use bone meal as a fertilizer.
     - ✔️ Proper water management ensures healthy yields.

3. **Include Local Examples and Practices:**
   - Whenever relevant, illustrate your points with examples from local agriculture practices.
   - Example: “Farmers in Coimbatore have seen increased yields using this method, especially for cash crops.”

4. **Utilize Proverbs and Anecdotes:**
   - Speak like a true expert in agriculture by incorporating proverbs, anecdotes, and traditional wisdom.
   - Example: “As we say, ‘A farmer is as good as his soil!’”

5. **Maintain Agricultural Focus:**
   - Always respond to agricultural inquiries only. If asked about unrelated topics, politely steer the conversation back to farming.
   - Example for unrelated questions: “I can only provide information related to agriculture and farming. Do you have any questions about crop cultivation or farming practices?”

Always respond in English with short answers (2-3 lines). Do not write paragraphs. I only answer questions related to agriculture, as I am an agriculture teacher. `
        }

        this.messages.push({
            role: "system",
            content: ai_content,
        });
    }

    async chat(userInput) {
        try {
            // Add user input to conversation history
            this.messages.push({
                role: "user",
                content: userInput,
            });



            // Send to Groq for processing
            const completion = await this.groq.chat.completions.create({
                messages: this.messages,
                model: "llama3-8b-8192",
                max_tokens: 1024,
                temperature: 0.7,
            }).catch(error => {
                console.error("Groq API Error:", error);

                // Rotate API key on error
                this.currentIndex = (this.currentIndex + 1) % this.apiKeys.length;
                this.groq = this.initializeGroq();

                // Retry with new API key
                return this.groq.chat.completions.create({
                    messages: this.messages,
                    model: "llama3-8b-8192",
                    max_tokens: 1024,
                    temperature: 0.7,
                });
            });

            if (completion?.choices?.[0]?.message?.content) {
                const aiResponse = completion.choices[0].message.content;

                // Add AI response to conversation history
                this.messages.push({
                    role: "assistant",
                    content: aiResponse,
                });



                // Export chat to file
                await this.exportChat();

                return aiResponse;
            } else {
                console.log("Invalid completion format:", completion);
                throw new Error("Invalid completion format");
            }
        } catch (error) {
            console.error("Chat error:", error);
            throw error;
        }
    }



    async exportChat() {
        console.log("Exporting chat...");
        const chat = [];

        for (let i = 1; i < this.messages.length; i++) { // Skip system message
            if (this.messages[i].role === "user" || this.messages[i].role === "assistant") {
                chat.push({
                    role: this.messages[i].role,
                    content: this.messages[i].content,
                    audio: this.audioFilePaths[i - 1] || null, // Adjust index for audio files
                });
            }
        }

        const chat_path = path.join(this.publicDir, "temp/chats", `${this.socket_id}.json`);
        console.log(`Writing chat to file: ${chat_path}`);

        return new Promise((resolve, reject) => {
            fs.writeFile(chat_path, JSON.stringify(chat, null, 2), (err) => {
                if (err) {
                    console.error("Error writing chat file:", err);
                    reject(err);
                } else {
                    console.log("Chat saved to file.");
                    resolve(chat_path);
                }
            });
        });
    }

    async storeAudioFile(text) {
        let visemes = [];
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.wav`;
        const audioFilePath = path.join(__dirname, '../client/public/temp/audio', fileName);
        console.log("Generating audio file:", audioFilePath);

        try {
            const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);
            const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

            synthesizer.visemeReceived = (s, e) => {
                visemes.push({ visemeId: e.visemeId, audioOffset: e.audioOffset / 10000 });
            };

            const ssml = `<speak version="1.0" xmlns="https://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="${this.speechConfig.speechSynthesisVoiceName}">${text}</voice>
            </speak>`;

            return new Promise((resolve, reject) => {
                synthesizer.speakSsmlAsync(ssml,
                    (result) => {
                        synthesizer.close();
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            // Store the audio file path for later reference
                            this.audioFilePaths.push(audioFilePath);

                            // Return web-accessible path and visemes
                            const webPath = `/temp/audio/${fileName}`;
                            resolve({ audioFilePath: webPath, visemes });
                        } else {
                            console.error("Speech synthesis failed:", result);
                            reject(result);
                        }
                    },
                    (error) => {
                        synthesizer.close();
                        console.error("Speech synthesis error:", error);
                        reject(error);
                    }
                );
            });
        } catch (error) {
            console.error("Error in storeAudioFile:", error);
            throw error;
        }
    }
}

module.exports = Chatbot;