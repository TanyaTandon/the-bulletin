import React from "react";

const BulletinPreview: React.FC<{ images: string[]; firstName: string }> = ({
  images,
  firstName,
}) => {
  return (
    <section className="w-[200px] h-[300px] border-2 border-black rounded-lg p-4 mr-auto ml-auto flex flex-col justify-between">
      <h1>{firstName}</h1>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[40%]">
        {images.slice(0, 16).map((image, index) => (
          <img
            key={index}
            src={image}
            alt="bulletin"
            className="w-full h-full object-cover rounded"
          />
        ))}
      </div>
      <img
        src="/textIcon.svg"
        alt="text"
        className="w-[100px] h-[100px] mr-auto ml-auto"
      />
    </section>
  );
};

export default BulletinPreview;
