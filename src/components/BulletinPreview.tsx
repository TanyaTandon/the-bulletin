import React from "react";

const BulletinPreview: React.FC<{
  images: string[];
  firstName: string;
  className?: string;
}> = ({ images, firstName, className }) => {
  return (
    <section
      className={`w-[200px] h-[300px] border-2 border-black rounded-lg p-4 mr-auto ml-auto flex flex-col justify-between ${className}`}
    >
      <h1>{firstName}</h1>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[40%] items-center">
        <p>march</p>
        {Array.from({ length: 3 }, (_, index) =>
          images[index] ? (
            <img
              key={index}
              src={images[index]}
              alt="bulletin"
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div
              key={index}
              className="w-full h-full border-2 border-black rounded-[6px]"
            />
          )
        )}
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
