import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScanIcon, CameraIcon, HistoryIcon } from 'lucide-react';

export function ScanTab() {
  const { toast } = useToast();
  const [scanMode, setScanMode] = useState<'barcode' | 'food'>('barcode');
  
  // Function to handle scanning (simulated)
  const handleScan = () => {
    toast({
      title: "Scanner activated",
      description: scanMode === 'barcode' 
        ? "Scanning for product barcode..." 
        : "Taking a photo for food recognition...",
    });
    
    // In a real app, this would activate the device camera
    setTimeout(() => {
      toast({
        title: "Scan feature",
        description: "This feature would use your camera to scan food or barcodes.",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <Card className="relative w-full max-w-xs aspect-square overflow-hidden mb-8">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5/6 aspect-square border-2 border-primary rounded-lg flex items-center justify-center">
              <div className="animate-pulse text-primary">
                <ScanIcon className="h-16 w-16" />
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4">
            <div className="text-center">
              <p className="text-foreground font-medium">
                {scanMode === 'barcode' ? 'Scan Barcode' : 'Scan Food'}
              </p>
              <p className="text-muted-foreground text-sm">Position the item in the camera view</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-poppins font-semibold mb-2">Scan to Track</h2>
        <p className="text-muted-foreground max-w-xs">
          Quickly add foods to your daily log by scanning barcodes or taking a photo of your meal
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button
          onClick={() => {
            setScanMode('barcode');
            handleScan();
          }}
          className={`flex-1 ${
            scanMode === 'barcode'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground'
          }`}
        >
          <ScanIcon className="mr-2 h-4 w-4" />
          Barcode
        </Button>
        
        <Button
          onClick={() => {
            setScanMode('food');
            handleScan();
          }}
          className={`flex-1 ${
            scanMode === 'food'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground'
          }`}
        >
          <CameraIcon className="mr-2 h-4 w-4" />
          Food
        </Button>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <p className="text-muted-foreground text-sm mb-2">Recent Scans</p>
        <div className="flex gap-2">
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
            <HistoryIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
            <HistoryIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
            <HistoryIcon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
