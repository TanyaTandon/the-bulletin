
import React from 'react';
import { Textarea } from './ui/textarea';

const BlurbInput = () => {
  return (
    <div className="flex flex-col items-center w-full">
      <h3 className="text-sm text-black mb-2 text-center w-full" style={{ fontFamily: 'Sometype Mono, monospace' }}>
        Add your monthly summary
      </h3>
      <Textarea 
        placeholder="April was so fucking LIT. I nommed nommed and crushed on my crush and biked on my bike"
        className="min-h-[100px] resize-none w-full max-w-3xl border-violet-200 focus:border-violet-400 focus:ring-violet-400"
        style={{ fontFamily: 'Sometype Mono, monospace' }}
      />
    </div>
  );
};

export default BlurbInput;
