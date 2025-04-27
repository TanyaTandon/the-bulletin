import React from "react";
import { format } from "date-fns";
import { UploadedImage } from "./ImageUploadGrid";
import { CalendarNote } from "./BlurbInput";

interface ContentCardProps {
  images: UploadedImage[];
  blurb: string;
  savedNotes: CalendarNote[];
}

const ContentCard: React.FC<ContentCardProps> = ({ images, blurb, savedNotes }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Your Content</h2>

      {images.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-semibold">Images:</h3>
          <div className="flex overflow-x-auto space-x-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={image.url}
                alt={image.name}
                className="w-32 h-32 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}

      {blurb && (
        <div className="mb-4">
          <h3 className="text-md font-semibold">Blurb:</h3>
          <p className="text-gray-700">{blurb}</p>
        </div>
      )}

      {savedNotes.length > 0 && (
        <div>
          <h3 className="text-md font-semibold">Calendar Notes:</h3>
          <ul>
            {savedNotes.map((note, index) => (
              <li key={index} className="text-gray-700">
                {format(new Date(note.date), "MM/dd/yyyy")}: {note.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {images.length === 0 && !blurb && savedNotes.length === 0 && (
        <p className="text-gray-500">No content added yet.</p>
      )}
    </div>
  );
};

export default ContentCard;
