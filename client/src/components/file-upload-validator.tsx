import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { triggerBotResponse } from "./thecueroom-bot";
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Music, 
  Image as ImageIcon,
  FileX 
} from "lucide-react";

interface FileValidationProps {
  onFileAccepted: (file: File, preview?: string) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
  className?: string;
}

const SUPPORTED_FORMATS = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/flac'],
  video: ['video/mp4', 'video/webm', 'video/mov']
};

const BLOCKED_FORMATS = [
  'application/x-msdownload',  // .exe
  'application/x-dosexec',     // .exe
  'application/zip',           // .zip
  'application/x-rar',         // .rar
  'application/x-7z-compressed', // .7z
  'application/octet-stream',   // Binary files
  'application/x-shockwave-flash', // .swf
  'application/java-archive',   // .jar
  'text/x-script.phps',        // .php
  'application/x-httpd-php',   // .php
  'text/javascript',           // .js files (security)
  'application/javascript'     // .js files (security)
];

export default function FileUploadValidator({ 
  onFileAccepted, 
  acceptedTypes = ['image/*', 'audio/*'],
  maxSizeMB = 5,
  className = ""
}: FileValidationProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = async (file: File): Promise<{ isValid: boolean; error?: string; preview?: string }> => {
    setValidationStatus('validating');
    setUploadProgress(0);

    // Simulate validation progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 20, 90));
    }, 100);

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
    clearInterval(progressInterval);
    setUploadProgress(100);

    // File size validation
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      triggerBotResponse.fileUploadAttempt(file.size, file.type);
      return {
        isValid: false,
        error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds ${maxSizeMB}MB limit. Keep it underground-friendly!`
      };
    }

    // Blocked format check
    if (BLOCKED_FORMATS.includes(file.type)) {
      triggerBotResponse.fileUploadAttempt(file.size, file.type);
      return {
        isValid: false,
        error: 'This file type is not allowed. Underground servers only accept media files!'
      };
    }

    // File type validation
    const allSupportedTypes = [...SUPPORTED_FORMATS.images, ...SUPPORTED_FORMATS.audio, ...SUPPORTED_FORMATS.video];
    if (!allSupportedTypes.includes(file.type)) {
      triggerBotResponse.fileUploadAttempt(file.size, file.type);
      return {
        isValid: false,
        error: 'Unsupported file format. Only images, audio, and video files keep the vibe alive!'
      };
    }

    // Create preview for images with error handling
    let preview = '';
    if (file.type.startsWith('image/')) {
      try {
        preview = URL.createObjectURL(file);
      } catch (error) {
        console.error('Failed to create preview URL:', error);
        // Continue without preview - not critical
      }
    }

    return { isValid: true, preview };
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage('');
    
    const validation = await validateFile(file);
    
    if (validation.isValid) {
      setValidationStatus('success');
      onFileAccepted(file, validation.preview);
      toast({
        title: "File accepted!",
        description: `${file.name} is ready for upload`,
      });
    } else {
      setValidationStatus('error');
      setErrorMessage(validation.error || 'File validation failed');
      toast({
        title: "Upload blocked",
        description: validation.error,
        variant: "destructive"
      });
    }

    setTimeout(() => {
      setUploadProgress(0);
      setValidationStatus('idle');
    }, 2000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const getFileTypeIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-400" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5 text-green-400" />;
    return <FileX className="w-5 h-5 text-gray-400" />;
  };

  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'validating':
        return <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={className}>
      <Card 
        className={`border-2 border-dashed transition-all duration-200 ${
          isDragging 
            ? 'border-purple-400 bg-purple-900/20' 
            : validationStatus === 'success'
            ? 'border-green-400 bg-green-900/20'
            : validationStatus === 'error'
            ? 'border-red-400 bg-red-900/20'
            : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            
            {/* Status Icon */}
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>

            {/* Upload Area */}
            <div className="space-y-2">
              <h3 className="text-white font-medium">
                {validationStatus === 'validating' ? 'Validating file...' :
                 validationStatus === 'success' ? 'File accepted!' :
                 validationStatus === 'error' ? 'Upload failed' :
                 'Drop your underground content here'}
              </h3>
              
              <p className="text-sm text-gray-400">
                {validationStatus === 'idle' && `Max ${maxSizeMB}MB • Images, Audio & Video only`}
                {validationStatus === 'validating' && 'Checking file format and size...'}
                {validationStatus === 'success' && selectedFile?.name}
                {validationStatus === 'error' && errorMessage}
              </p>
            </div>

            {/* Progress Bar */}
            {validationStatus === 'validating' && (
              <Progress value={uploadProgress} className="w-full" />
            )}

            {/* File Info */}
            {selectedFile && validationStatus !== 'error' && (
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-800 rounded-lg">
                {getFileTypeIcon(selectedFile.type)}
                <div className="text-left">
                  <div className="text-sm text-white font-medium">{selectedFile.name}</div>
                  <div className="text-xs text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)}MB • {selectedFile.type}
                  </div>
                </div>
                {validationStatus === 'success' && (
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    Validated
                  </Badge>
                )}
              </div>
            )}

            {/* Upload Button */}
            <div className="space-y-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={validationStatus === 'validating'}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {validationStatus === 'validating' ? 'Validating...' : 'Choose File'}
              </Button>
              
              <div className="text-xs text-gray-500">
                or drag and drop
              </div>
            </div>

            {/* Supported Formats */}
            <div className="pt-4 border-t border-gray-700">
              <div className="text-xs text-gray-400 space-y-1">
                <div className="font-medium">Supported formats:</div>
                <div className="flex flex-wrap gap-1 justify-center">
                  {['JPG', 'PNG', 'WebP', 'MP3', 'WAV', 'OGG', 'MP4'].map(format => (
                    <Badge key={format} variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {format}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleInputChange}
            accept={acceptedTypes.join(',')}
            className="hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
}