

import React, { useMemo, useEffect, useState } from "react";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const TamilTTS = ({ response }) => {
  const [audioSrc, setAudioSrc] = useState("");

  const text_content = response?.response; // Get the Tamil text response

  useEffect(() => {
    if (!text_content) return;

	let speechConfig = sdk.SpeechConfig.fromSubscription('BKcGwBuh2Ix5W2ob8GvkWTK67cAXfnt4Rf5rh6l2orum6fMDCV2pJQQJ99ALACYeBjFXJ3w3AAAYACOG6Bz3', 'eastus');

    speechConfig.speechSynthesisVoiceName = "ta-IN-PallaviNeural"; // Female Tamil voice

    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    synthesizer.speakTextAsync(
      text_content,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          console.log("Speech synthesis successful.");
          // You can set an audio URL if saving the file is required
        }
        synthesizer.close();
      },
      (error) => {
        console.error("Speech synthesis error:", error);
        synthesizer.close();
      }
    );
  }, [text_content]);

  return (
    <div>
      <p>{text_content}</p>
      {audioSrc && <audio src={audioSrc} controls autoPlay />}
    </div>
  );
};

export default TamilTTS;

