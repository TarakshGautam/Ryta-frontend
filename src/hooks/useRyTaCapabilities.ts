// frontend/src/hooks/useRyTaCapabilities.ts (Frontend Hook for Voice, Location & Metadata)
import { useState, useEffect } from "react";

export function useRyTaCapabilities() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [metadata, setMetadata] = useState<any>({});
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");

    useEffect(() => {
        // 1. Capture Metadata
        setMetadata({
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.innerWidth}x${window.innerHeight}`
        });

        // 2. Capture Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.log("Location access denied or unavailable", error)
            );
        }
    }, []);

    // 3. Speech-to-Text (Microphone Input)
    const startListening = (onResult: (text: string) => void) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            onResult(text);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    // 4. Text-to-Speech (Voice Output)
    const speakText = (text: string) => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel(); // Stop any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    return {
        location,
        metadata,
        isListening,
        transcript,
        startListening,
        speakText
    };
}