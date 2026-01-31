import React, { useEffect } from "react";

interface Props {
  onTranscript: (text: string) => void;
  listening: boolean;
  setListening: (value: boolean) => void;
}

type SpeechRecognitionType =
  | (typeof window & {
      webkitSpeechRecognition?: any;
      SpeechRecognition?: any;
    })["SpeechRecognition"]
  | any;

export const VoiceControls: React.FC<Props> = ({
  onTranscript,
  listening,
  setListening
}) => {
  useEffect(() => {
    // Stop any active recognition on unmount.
    return () => {
      const AnyWindow = window as any;
      const Recognition =
        AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;
      if (Recognition && (Recognition as any).instance) {
        (Recognition as any).instance.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    const AnyWindow = window as any;
    const Recognition: SpeechRecognitionType =
      AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;

    if (!Recognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (listening) {
      (Recognition as any).instance?.stop();
      setListening(false);
      return;
    }

    const recognition = new Recognition();
    (Recognition as any).instance = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    setListening(true);
  };

  return (
    <div className="voice-controls">
      <button
        type="button"
        className={`secondary-button ${listening ? "secondary-button-active" : ""}`}
        onClick={toggleListening}
      >
        {listening ? "Listening… tap to stop" : "Hold a voice conversation"}
      </button>
      <p className="voice-hint">
        Uses your browser&apos;s speech recognition and text-to-speech where available.
      </p>
    </div>
  );
};

