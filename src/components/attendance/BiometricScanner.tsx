import { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Fingerprint, CheckCircle, Loader2 } from "lucide-react";

interface BiometricScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  type: 'facial' | 'fingerprint';
}

export const BiometricScanner = ({ onScan, onClose, type }: BiometricScannerProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async () => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsProcessing(true);
        
        // Simulate biometric processing
        setTimeout(() => {
          // In production, this would send to a biometric API
          const mockBiometricId = `bio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          onScan(mockBiometricId);
          setIsProcessing(false);
          setIsCapturing(false);
        }, 2000);
      }
    }
  };

  const handleRetry = () => {
    setCapturedImage("");
    setIsCapturing(false);
    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'facial' ? <Camera className="h-5 w-5" /> : <Fingerprint className="h-5 w-5" />}
          {type === 'facial' ? 'Facial Recognition' : 'Fingerprint Scanner'}
        </CardTitle>
        <CardDescription>
          {type === 'facial' 
            ? 'Position your face within the frame and click capture'
            : 'Place your finger on the scanner to authenticate'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === 'facial' ? (
          <>
            {!capturedImage ? (
              <div className="relative aspect-square max-w-md mx-auto">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full rounded-lg"
                  videoConstraints={{
                    facingMode: "user",
                    width: 640,
                    height: 480
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-primary/50 w-48 h-48 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="relative aspect-square max-w-md mx-auto">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full rounded-lg object-cover"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Processing biometric data...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="aspect-square max-w-md mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Fingerprint className="h-24 w-24 mx-auto mb-4 text-primary animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Fingerprint scanner simulation
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                (Hardware integration required for actual scanning)
              </p>
            </div>
          </div>
        )}

        {!isProcessing && capturedImage && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Biometric data captured successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-2">
          {!capturedImage && type === 'facial' ? (
            <Button onClick={handleCapture} disabled={isCapturing}>
              {isCapturing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Capture
                </>
              )}
            </Button>
          ) : type === 'fingerprint' ? (
            <Button onClick={() => {
              setIsProcessing(true);
              setTimeout(() => {
                const mockBiometricId = `fingerprint_${Date.now()}`;
                onScan(mockBiometricId);
                setIsProcessing(false);
              }, 2000);
            }} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Scan Fingerprint
                </>
              )}
            </Button>
          ) : null}
          
          {capturedImage && !isProcessing && (
            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
          )}
          
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};