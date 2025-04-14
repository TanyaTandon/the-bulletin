
import React from 'react';
import { Textarea } from './ui/textarea';

const BlurbInput = () => {
  return (
    <div className="mb-8">
      <Textarea 
        placeholder="April was so fucking LIT. I nommed nommed and crushed on my crush and biked on my bike"
        className="min-h-[120px]"
      />
    </div>
  );
};

export default BlurbInput;
