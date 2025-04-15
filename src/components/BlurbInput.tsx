
import React from 'react';
import { Textarea } from './ui/textarea';

const BlurbInput = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-sm text-muted-foreground mb-2 text-center w-full">Add your monthly summary</h3>
      <Textarea 
        placeholder="April was so fucking LIT. I nommed nommed and crushed on my crush and biked on my bike"
        className="min-h-[100px] resize-none w-full max-w-3xl"
      />
    </div>
  );
};

export default BlurbInput;
