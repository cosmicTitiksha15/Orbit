
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface VoiceProcessorProps {
  onTranscriptComplete: (text: string) => void;
}

const VoiceProcessor: React.FC<VoiceProcessorProps> = ({ onTranscriptComplete }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startListening = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
            sessionRef.current = { scriptProcessor, stream, source };
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setIsListening(false);
              stopListening();
            }
          },
          onerror: (e) => console.error('Gemini Voice Error:', e),
          onclose: () => setIsListening(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

      setIsListening(true);
    } catch (error) {
      console.error('Failed to start voice capture:', error);
    }
  };

  const stopListening = () => {
    if (sessionRef.current) {
      sessionRef.current.stream.getTracks().forEach((track: any) => track.stop());
      sessionRef.current.scriptProcessor.disconnect();
      sessionRef.current.source.disconnect();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    onTranscriptComplete(transcript);
    setIsListening(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative">
        <button 
          onClick={isListening ? stopListening : startListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isListening ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20'
          }`}
        >
          {isListening ? (
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          ) : (
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        {isListening && (
           <div className="absolute -inset-4 border-2 border-purple-500/30 rounded-full animate-[ping_2s_infinite]"></div>
        )}
      </div>
      <div className="w-full text-center">
        <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Neural Link Status</p>
        <div className="glass p-4 rounded-2xl min-h-[60px] text-sm text-gray-300 italic border-white/5">
          {transcript || (isListening ? "Listening to your frequency..." : "Awaiting voice command...")}
        </div>
      </div>
    </div>
  );
};

export default VoiceProcessor;
