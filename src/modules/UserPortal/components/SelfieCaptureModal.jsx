import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SelfieCaptureModal = ({ isOpen, onClose, onCapture, title = "Selfie Verification" }) => {
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                setImgSrc(imageSrc);
            } else {
                toast.error("Failed to capture image. Please try again.");
            }
        }
    }, [webcamRef]);

    const handleConfirm = () => {
        if (imgSrc) {
            onCapture(imgSrc);
            onClose();
            setImgSrc(null);
        }
    };

    const handleRetake = () => {
        setImgSrc(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Camera size={18} className="text-blue-500" />
                        {title}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col items-center">
                    {!imgSrc ? (
                        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                videoConstraints={{ facingMode: "user" }}
                                onUserMedia={() => setCameraError(null)}
                                onUserMediaError={(err) => {
                                    console.error("Webcam Error:", err);
                                    setCameraError(err.name === 'NotAllowedError' ? "Camera access denied. Please enable it in your browser settings." : "Camera not found or busy.");
                                }}
                            />

                            {cameraError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gray-900/90">
                                    <AlertCircle size={40} className="text-red-500 mb-2" />
                                    <p className="text-sm font-medium">{cameraError}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold"
                                    >
                                        Reload Page
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={capture}
                                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full p-1 shadow-lg active:scale-90 transition-transform flex items-center justify-center"
                                >
                                    <div className="w-full h-full rounded-full border-4 border-red-500"></div>
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl border-4 border-blue-500/30">
                            <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                                <CheckCircle size={16} />
                            </div>
                        </div>
                    )}

                    <div className="mt-6 w-full space-y-3">
                        {imgSrc ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRetake}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <RefreshCw size={16} />
                                    Retake
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 transition-transform"
                                >
                                    Confirm & Start
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-center text-gray-500 font-medium italic">
                                * A clear face photo is required for attendance verification
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelfieCaptureModal;
