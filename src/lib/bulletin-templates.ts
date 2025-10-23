// Measure text width using canvas for precise calculations
const measureTextWidth = (
  text: string,
  fontSize: number,
  fontFamily: string = "Delight",
  fontWeight: string = "900"
): number => {
  // Create a temporary canvas element to measure text
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return text.length * fontSize * 0.6; // Fallback estimation

  // Set the font properties to match the CSS exactly
  context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Measure the text width
  const metrics = context.measureText(text);

  // Account for letter-spacing: -0.02em (which is -0.02 * fontSize)
  const letterSpacing = -0.02 * fontSize;
  const adjustedWidth = metrics.width + (text.length - 2) * letterSpacing;

  return adjustedWidth;
};

// Calculate appropriate font size based on actual text width measurement
export const calculateFontSize = (
  name: string,
  maxWidth: number = 500
): number => {
  const baseFontSize = 180;
  const minFontSize = 25;

  // Measure the actual width of the text at base font size
  const textWidthAtBaseSize = measureTextWidth(name, baseFontSize);

  console.log(`Font calculation for "${name}":`, {
    textWidthAtBaseSize,
    maxWidth,
    baseFontSize,
    fits: textWidthAtBaseSize <= maxWidth,
  });

  // If it fits at base size, return base size
  if (textWidthAtBaseSize <= maxWidth) {
    console.log(`Using base font size: ${baseFontSize}px`);
    return baseFontSize;
  }

  // Calculate the scale factor needed to fit within max width
  const scaleFactor = maxWidth / textWidthAtBaseSize;
  const calculatedFontSize = Math.floor(baseFontSize * scaleFactor);
  const finalFontSize = Math.max(calculatedFontSize, minFontSize);

  console.log(
    `Scaling font: ${baseFontSize}px → ${finalFontSize}px (scale factor: ${scaleFactor.toFixed(
      3
    )})`
  );

  return finalFontSize;
};

export const Nick = (
  images: string[],
  bodyText: string,
  name: string,
  fontSize: number = 180
) => `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 30px;
        background: #f5f1eb;
        font-family: "Welcome Web", sans-serif;
        height: 100vh;
        overflow: hidden;
        box-sizing: border-box;
      }
      h1 {
        font-family: "Delight", sans-serif;
        font-weight: 400;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        height: calc(100vh - 60px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .photos-top {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
      }
      .photo {
        width: 140px;
        height: 110px;
        background: #666;
        border-radius: 8px;
        background-size: cover;
        background-position: center;
      }
      .text {
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        margin-bottom: 20px;
        text-align: left;
        flex: 1;
        overflow: hidden;
      }
      .photos-bottom {
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        justify-content: center;
      }
      .photo-large {
        width: 240px;
        height: 210px;
        background: #666;
        border-radius: 8px;
        flex: 1;
        max-width: 280px;
        background-size: cover;
        background-position: center;
      }
      .name {
        font-size: ${fontSize}px;
        font-weight: 900;
        color: #000;
        text-align: left;
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 0.8;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="photos-top">
        <div class="photo" style="background-image: url('${images[0]}')"></div>
        <div class="photo" style="background-image: url('${images[1]}')"></div>
        <div class="photo" style="background-image: url('${images[2]}')"></div>
        <div class="photo" style="background-image: url('${images[3]}')"></div>
      </div>
      <div class="text">
        ${bodyText}
      </div>
      <div class="photos-bottom">
        <div class="photo-large" style="background-image: url('${
          images[4]
        }')"></div>
        <div class="photo-large" style="background-image: url('${
          images[5]
        }')"></div>
      </div>
      <h1 class="name" id="nameElement">${name.toLowerCase()}</h1>
    </div>
  </body>
  </html>`;

export const Lila = (
  images: string[],
  bodyText: string,
  name: string,
  fontSize: number = 180
) => `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 30px;
        background: #f5f1eb;
        font-family: "Welcome Web", sans-serif;
        height: 100vh;
        overflow: hidden;
        box-sizing: border-box;
      }
      h1 {
        font-family: "Delight", sans-serif;
        font-weight: 400;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        height: calc(100vh - 60px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .main-content {
        display: flex;
        gap: 40px;
        flex: 1;
        margin-bottom: 30px;
      }
      .photos-column {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .photo {
        width: 240px;
        height: 240px;
        background: #666;
        border-radius: 8px;
        background-size: cover;
        background-position: center;
      }
      .text {
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        text-align: left;
        flex: 1;
        overflow: hidden;
      }
      .name {
        font-size: 180px;
        font-weight: 900;
        color: #000;
        text-align: right;
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 0.8;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="main-content">
        <div class="photos-column">
          <div class="photo" style="background-image: url('${
            images[0]
          }')"></div>
          <div class="photo" style="background-image: url('${
            images[1]
          }')"></div>
        </div>
        <div class="text">
          ${bodyText}
        </div>
      </div>
      <h1 class="name" id="nameElement">${name.toLowerCase()}</h1>
    </div>
  </body>
  </html>`;

export const Tanya = (
  images: string[],
  bodyText: string,
  name: string,
  fontSize: number = 180
) => `<!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 30px;
        background: #f5f1eb;
        font-family: "Welcome Web", sans-serif;
        height: 100vh;
        overflow: hidden;
        box-sizing: border-box;
      }
      h1 {
        font-family: "Delight", sans-serif;
        font-weight: 400;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        height: calc(100vh - 60px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .main-content {
        display: flex;
        gap: 20px;
        flex: 1;
        margin-bottom: 30px;
      }
      .left-column {
        flex: 3;
        display: flex;
        flex-direction: column;
      }
      .right-column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .large-photo {
        width: 240px;
        height: 240px;
        background: #666;
        border-radius: 8px;
        margin-bottom: 20px;
        align-self: flex-start;
        background-size: cover;
        background-position: center;
      }
      .small-photo {
        width: 100%;
        height: 100px;
        background: #666;
        border-radius: 8px;
        aspect-ratio: 1;
        background-size: cover;
        background-position: center;
      }
      .text {
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        text-align: right;
        flex: 1;
        overflow: hidden;
      }
      .name {
        font-size: 180px;
        font-weight: 900;
        color: #000;
        text-align: center;
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 0.8;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="main-content">
        <div class="left-column">
          <div class="large-photo" style="background-image: url('${
            images[0]
          }')"></div>
          <div class="text">
            ${bodyText}
          </div>
        </div>
        <div class="right-column">
          <div class="small-photo" style="background-image: url('${
            images[1]
          }')"></div>
          <div class="small-photo" style="background-image: url('${
            images[2]
          }')"></div>
          <div class="small-photo" style="background-image: url('${
            images[3]
          }')"></div>
          <div class="small-photo" style="background-image: url('${
            images[4]
          }')"></div>
        </div>
      </div>
      <h1 class="name" id="nameElement">${name.toLowerCase()}</h1>
    </div>
    <script>
    function adjustFontSize() {
      const nameElement = document.getElementById('nameElement');
      const container = nameElement.parentElement;
      let fontSize = 180;
      
      nameElement.style.fontSize = fontSize + 'px';
      
      // Compare scrollWidth of the element to its own offsetWidth (not container)
      while (nameElement.scrollWidth > nameElement.offsetWidth && fontSize > 75) {
        fontSize -= 5;
        nameElement.style.fontSize = fontSize + 'px';
      }
    }
    
    window.addEventListener('load', adjustFontSize);
    window.addEventListener('resize', adjustFontSize);
  </script>
  </body>
  </html>`;

export const defaultBodyValue =
  "April filled my heart with so much joy. I ordained my best friend's wedding, and everybody laughed and cried (as God and my speech intended). I loved building the bulletin with my best friends all day, every day, when I wasn't working at my big-girl job. !!";
