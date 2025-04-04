
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MediaContentManager } from "./MediaContentManager";

interface MediaUploaderProps {
  mediaContent?: Record<string, string[]> | null;
  onMediaContentChange?: (mediaContent: Record<string, string[]>) => void;
}

export function MediaUploader({
  mediaContent = {},
  onMediaContentChange
}: MediaUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMediaContent, setCurrentMediaContent] = useState<Record<string, string[]>>(mediaContent || {});
  
  const handleChange = (updatedMediaContent: Record<string, string[]>) => {
    setCurrentMediaContent(updatedMediaContent);
  };
  
  const handleSave = () => {
    if (onMediaContentChange) {
      onMediaContentChange(currentMediaContent);
    }
    setIsOpen(false);
  };
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
        <ImageIcon className="mr-2 h-4 w-4" /> Manage Property Media
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Property Media Management</DialogTitle>
          </DialogHeader>
          
          <MediaContentManager 
            mediaContent={currentMediaContent}
            onChange={handleChange}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
