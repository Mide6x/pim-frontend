import { debounce } from "lodash";
import { message } from "antd";

const useSpeechRecognition = (onTranscript) => {
  const handleMicrophoneClick = debounce(() => {
    if (!("webkitSpeechRecognition" in window)) {
      message.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("")
        .replace(/\.$/, "");

      onTranscript(transcript);
    };

    recognition.start();

    recognition.onend = () => {
      recognition.stop();
    };

    recognition.onerror = () => {
      message.error("Speech recognition error occurred.");
    };
  }, 300);

  return handleMicrophoneClick;
};

export default useSpeechRecognition; 