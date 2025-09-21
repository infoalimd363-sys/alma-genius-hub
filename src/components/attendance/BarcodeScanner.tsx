import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Barcode, CheckCircle } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) return;

      try {
        setIsScanning(true);
        setError("");

        // QrScanner can also detect barcodes
        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            setResult(result.data);
            onScan(result.data);
            scanner.stop();
            setIsScanning(false);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: "environment",
          }
        );

        scannerRef.current = scanner;
        await scanner.start();
      } catch (err) {
        setError("Failed to start camera. Please check camera permissions.");
        setIsScanning(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [onScan]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="h-5 w-5" />
          Barcode Scanner
        </CardTitle>
        <CardDescription>
          Position the barcode within the camera view to scan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-square max-w-md mx-auto bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-24 border-2 border-primary rounded animate-pulse" />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Successfully scanned! Barcode: {result}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-2">
          {isScanning ? (
            <Button disabled variant="outline">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </Button>
          ) : (
            <Button onClick={onClose} variant="outline">
              Close Scanner
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};