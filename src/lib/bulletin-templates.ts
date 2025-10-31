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
  // alert(`textWidthAtBaseSize: ${textWidthAtBaseSize}`);

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

const Xbutton =
  '<svg class="buttonSvg" xmlns="http://www.w3.org/2000/svg" viewBox="-70 -70 400 400"><rect width="400" height="400" fill="none"/><line x1="200" y1="56" x2="56" y2="200" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="200" y1="200" x2="56" y2="56" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>';

const TrashButton =
  '<svg class="buttonSvg" xmlns="http://www.w3.org/2000/svg" viewBox="-70 -70 400 400"><rect width="400" height="400" fill="none"/><line x1="216" y1="56" x2="40" y2="56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="104" y1="104" x2="104" y2="168" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="152" y1="104" x2="152" y2="168" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>';

const EditButton =
  '<svg class="buttonSvg" xmlns="http://www.w3.org/2000/svg" viewBox="-70 -70 400 400"><rect width="400" height="400" fill="none"/><path d="M96,216H48a8,8,0,0,1-8-8V163.31a8,8,0,0,1,2.34-5.65L165.66,34.34a8,8,0,0,1,11.31,0L221.66,79a8,8,0,0,1,0,11.31Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="216" y1="216" x2="96" y2="216" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/><line x1="136" y1="64" x2="192" y2="120" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/></svg>';

const ImageScriptLogic = `<script>
        document.addEventListener('DOMContentLoaded', function() {
  
        // Button Arc System - Inline version
        class ButtonArcSystem {
          constructor(config = {}) {
            this.config = {
              arcRadius: config.arcRadius || 120,
              arcSpread: config.arcSpread || 120,
              buttonSize: config.buttonSize || 48,
              animationDuration: config.animationDuration || 300,
              staggerDelay: config.staggerDelay || 80,
              closeButtonLabel: config.closeButtonLabel || '×',
              ...config,
            };
  
            this.container = document.getElementById('button-arc-container');
            this.buttons = [];
            this.isVisible = false;
            this.currentImageIndex = null;
          }
  
          getArcDirection(clickX, clickY, viewportWidth, viewportHeight) {
            const { arcRadius, buttonSize } = this.config;
            const buffer = buttonSize;
            
            // Check vertical space available
            const spaceAbove = clickY;
            const spaceBelow = viewportHeight - clickY;
            const spaceLeft = clickX;
            const spaceRight = viewportWidth - clickX;
            
            // Determine if we have enough space above or below
            const canGoUp = spaceAbove > (arcRadius + buffer);
            const canGoDown = spaceBelow > (arcRadius + buffer);
            
            // Prefer direction with more space, default to up if both work
            let direction = 'up';
            if (!canGoUp && canGoDown) {
              direction = 'down';
            } else if (canGoUp && canGoDown) {
              direction = spaceAbove > spaceBelow ? 'up' : 'down';
            } else if (!canGoUp && !canGoDown) {
              // If neither direction has enough space, choose based on more available space
              direction = spaceAbove > spaceBelow ? 'up' : 'down';
            }
            
            // Check horizontal constraints and adjust arc center angle if needed
            const horizontalBias = this.getHorizontalBias(clickX, spaceLeft, spaceRight, arcRadius, buffer);
            
            return { direction, horizontalBias };
          }
  
          getHorizontalBias(clickX, spaceLeft, spaceRight, arcRadius, buffer) {
            // If we're too close to the left edge, bias the arc to the right
            if (spaceLeft < arcRadius + buffer) {
              return 'left';
            }
            // If we're too close to the right edge, bias the arc to the left
            if (spaceRight < arcRadius + buffer) {
              return 'right';
            }
            return 'center';
          }
  
          getArcPosition(index, totalButtons, direction = 'up', horizontalBias = 'center') {
            const { arcRadius, arcSpread } = this.config;
            
            // When arc goes down, we need to invert the horizontal bias
            // because the arc is flipped vertically
            let effectiveBias = horizontalBias;
            if (direction === 'down' && horizontalBias !== 'center') {
              effectiveBias = horizontalBias === 'right' ? 'left' : 'right';
            }
            
            // Adjust the base angle based on horizontal bias
            let baseAngle = 180; // Center (pointing straight up or down)
            if (effectiveBias === 'right') {
              baseAngle = 135; // Bias towards right
            } else if (effectiveBias === 'left') {
              baseAngle = 225; // Bias towards left
            }
            
            const startAngle = direction === 'up' 
              ? baseAngle + (180 - arcSpread) / 2 
              : baseAngle - 180 + (180 - arcSpread) / 2;
            
            const angleStep = arcSpread / (totalButtons - 1);
            const angle = startAngle + angleStep * index;
            const rad = (angle * Math.PI) / 180;
  
            return {
              x: Math.cos(rad) * arcRadius,
              y: Math.sin(rad) * arcRadius * (direction === 'up' ? -1 : 1),
            };
          }
  
          show(x, y, imageIndex, buttonConfigs) {
            if (this.isVisible) {
              this.hide();
              setTimeout(() => this.show(x, y, imageIndex, buttonConfigs), this.config.animationDuration + 50);
              return;
            }
            
            this.isVisible = true;
            this.currentImageIndex = imageIndex;
  
            const { direction, horizontalBias } = this.getArcDirection(x, y, window.innerWidth, window.innerHeight);
            const actionButtons = buttonConfigs.filter(btn => btn.id !== 'close');
            
            // Create close button
            this.createButton({
              id: 'close',
              label: this.config.closeButtonLabel,
              html: '${Xbutton}',
              isClose: true,
            }, x, y, 0, 0, 0, direction);
  
            // Create action buttons
            actionButtons.forEach((btnConfig, index) => {
              const pos = this.getArcPosition(index, actionButtons.length, direction, horizontalBias);
              this.createButton(btnConfig, x, y, pos.x, pos.y, index, direction);
            });
          }
  
          createButton(config, centerX, centerY, toX, toY, index, direction) {
            const button = document.createElement('button');
            button.className = \`arc-button \${config.isClose ? 'close-button' : ''}\`;
            button.setAttribute('data-button-id', config.id);
            button.title = config.label || '';
  
            if (config.content) {
              button.textContent = config.content;
            } else if (config.html) {
              button.innerHTML = config.html;
            }
  
            const halfSize = this.config.buttonSize / 2;
            button.style.left = \`\${centerX - halfSize}px\`;
            button.style.top = \`\${centerY - halfSize}px\`;
  
            const fromY = direction === 'up' ? 30 : -30;
            button.style.setProperty('--from-x', '0px');
            button.style.setProperty('--from-y', \`\${fromY}px\`);
            button.style.setProperty('--to-x', \`\${toX}px\`);
            button.style.setProperty('--to-y', \`\${toY}px\`);
  
            button.addEventListener('click', (e) => {
              e.stopPropagation();
              if (config.isClose) {
                this.hide();
              } else {
                // Send message to parent with button action
                window.parent.postMessage({
                  type: 'BUTTON_CLICKED',
                  buttonId: config.id,
                  imageIndex: this.currentImageIndex,
                }, '*');
                
                if (config.onClick) {
                  config.onClick(config.id, e);
                }
              }
            });
  
            this.container.appendChild(button);
            this.buttons.push(button);
  
            setTimeout(() => {
              button.classList.add('animate-in');
            }, index * this.config.staggerDelay);
          }
  
          hide() {
            if (!this.isVisible) return;
            this.isVisible = false;
            this.currentImageIndex = null;
  
            this.buttons.forEach((button, index) => {
              button.classList.remove('animate-in');
              button.classList.add('animate-out');
              
              setTimeout(() => {
                button.remove();
              }, this.config.animationDuration);
            });
  
            setTimeout(() => {
              this.buttons = [];
            }, this.config.animationDuration + 50);
          }
        }
  
        // Initialize the button arc system
        const buttonArcSystem = new ButtonArcSystem({
          arcRadius: 75,
          arcSpread: 75,
          staggerDelay: 80,
        });
  
        const buttonConfigs = [
          { id: 'edit', label: 'Edit', html: '${EditButton}' },
          { id: 'delete', label: 'Delete', html: '${TrashButton}' },
        ];
  
         document.querySelectorAll('.img').forEach(function(element) {
            element.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              const imageIndex = parseInt(this.getAttribute('data-image-index'));
              
              buttonArcSystem.show(e.clientX, e.clientY, imageIndex, buttonConfigs);
              
              window.parent.postMessage({
                type: 'IMAGE_CLICKED',
                imageIndex: imageIndex,
                x: e.clientX,
                y: e.clientY
              }, '*');
            });
          });

          document.querySelectorAll('.arc-button').forEach(function(element) {
            element.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              window.parent.postMessage({
                type: 'BUTTON_CLICKED',
              }, '*');
            });
          });
  
          document.querySelector('.text').addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.parent.postMessage({
              type: 'TEXT_CLICKED',
            }, '*');
          });
  
          document.addEventListener('click', function(e) {
            if (!e.target.closest('.arc-button') && !e.target.closest('.img')) {
              buttonArcSystem.hide();
            }
          });
  
          window.addEventListener('message', (event) => {
            if (event.data.type === 'HIDE_BUTTONS') {
              buttonArcSystem.hide();
            } else if (event.data.type === 'UPDATE_BUTTON_CONFIG') {
              buttonConfigs = event.data.buttons;
            }
          });
        });
      </script>`;

export const Nick = (
  images: string[],
  bodyText: string,
  name: string,
  fontSize: number = 180
) => `<!DOCTYPE html>
    <html>
    <head>
    <link rel="preload" as="font" crossorigin>
      <style>
        /* Ensure fonts load inside the iframe */
        @font-face {
          font-family: "Welcome Web";
          src: url('/fonts/Welcomeweb-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }
        @font-face {
          font-family: "Delight";
          src: url('/fonts/delight-regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: block;
        }
        @font-face {
          font-family: "Delight";
          src: url('/fonts/delight-black.woff2') format('woff2');
          font-weight: 900;
          font-style: normal;
          font-display: block;
        }
        body {
          margin: 0;
          padding: 30px;
          background: #f5f1eb;
          font-family: "Welcome Web", sans-serif;
          height: 100vh;
          overflow: hidden;
          box-sizing: border-box;
        }
          .buttonSvg {
          margin: 0 auto;
          display: block;
          width: 50px;
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
          transition: transform 0.2s, box-shadow 0.2s;

        }
        .text {
          transition: background-color 0.2s;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
          margin-bottom: 20px;
          text-align: left;
          flex: 1;
          overflow: hidden;
        }
        .text:hover{
          background-color: rgba(169,225,162,0.3);
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
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .photo-large:hover, .photo:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  
        /* Button Arc Styles */
        .arc-button {
          position: absolute;
          width: 75px;
          height: 75px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          font-size: 20px;
          opacity: 0;
          transform-origin: center;
          transition: transform 0.4s ease-in-out; 
        }
  
        .arc-button:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          transform: scale(1.1) translate(var(--to-x), var(--to-y));
        }
  
        .arc-button.close-button {
          font-size: 28px;
          font-weight: 300;
          color: #374151;
        }
  
        .arc-button.animate-in {
          animation: buttonSlideIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
  
        .arc-button.animate-out {
          animation: buttonSlideOut 300ms cubic-bezier(0.25, 0, 1, 2) forwards;
        }

        .arc-button:not(.animate-in):not(.animate-out) {
          transform: translate(var(--to-x), var(--to-y)) scale(1);
        }
  
        @keyframes buttonSlideIn {
          from {
            opacity: 0;
            transform: translate(var(--from-x), var(--from-y)) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(var(--to-x), var(--to-y)) scale(1);
          }
        }
  
        @keyframes buttonSlideOut {
          from {
            opacity: 1;
            transform: translate(var(--to-x), var(--to-y)) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(var(--from-x), var(--from-y)) scale(0.8);
          }
        }
  
        #button-arc-container {
          position: fixed;
          pointer-events: none;
          z-index: 10000;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="photos-top">
          <div class="photo img" data-image-index="0" style="background-image: url('${
            images[0]
          }')"></div>
          <div class="photo img" data-image-index="1" style="background-image: url('${
            images[1]
          }')"></div>
          <div class="photo img" data-image-index="2" style="background-image: url('${
            images[2]
          }')"></div>
          <div class="photo img" data-image-index="3" style="background-image: url('${
            images[3]
          }')"></div>
        </div>
        <div class="text">
          ${bodyText}
        </div>
        <div class="photos-bottom">
          <div class="photo-large img" data-image-index="4" style="background-image: url('${
            images[4]
          }')"></div>
          <div class="photo-large img" data-image-index="5" style="background-image: url('${
            images[5]
          }')"></div>
        </div>
        <h1 class="name" id="nameElement">${name.toLowerCase()}</h1>
      </div>
  
      <div id="button-arc-container"></div>
  
      ${ImageScriptLogic}
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
  <link rel="preload" as="font" crossorigin>
    <style>
      /* Ensure fonts load inside the iframe */
      @font-face {
        font-family: "Welcome Web";
        src: url('/fonts/Welcomeweb-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: "Delight";
        src: url('/fonts/delight-regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: "Delight";
        src: url('/fonts/delight-black.woff2') format('woff2');
        font-weight: 900;
        font-style: normal;
        font-display: block;
      }
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
        font-size: ${fontSize}px;
        font-weight: 900;
        color: #000;
        text-align: right;
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 0.8;
        white-space: nowrap;
      }

      /* Button Arc Styles */
        .arc-button {
          position: absolute;
          width: 75px;
          height: 75px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          font-size: 20px;
          opacity: 0;
          transform-origin: center;
          transition: transform 0.4s ease-in-out; 
        }
  
        .arc-button:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          transform: scale(1.1) translate(var(--to-x), var(--to-y));
        }
  
        .arc-button.close-button {
          font-size: 28px;
          font-weight: 300;
          color: #374151;
        }
  
        .arc-button.animate-in {
          animation: buttonSlideIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
  
        .arc-button.animate-out {
          animation: buttonSlideOut 300ms cubic-bezier(0.25, 0, 1, 2) forwards;
        }

        .arc-button:not(.animate-in):not(.animate-out) {
          transform: translate(var(--to-x), var(--to-y)) scale(1);
        }
  
        @keyframes buttonSlideIn {
          from {
            opacity: 0;
            transform: translate(var(--from-x), var(--from-y)) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(var(--to-x), var(--to-y)) scale(1);
          }
        }
  
        @keyframes buttonSlideOut {
          from {
            opacity: 1;
            transform: translate(var(--to-x), var(--to-y)) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(var(--from-x), var(--from-y)) scale(0.8);
          }
        }
  
        #button-arc-container {
          position: fixed;
          pointer-events: none;
          z-index: 10000;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="main-content">
        <div class="photos-column">
          <div class="photo img" data-image-index="0" style="background-image: url('${
            images[0]
          }')"></div>
          <div class="photo img" data-image-index="1" style="background-image: url('${
            images[1]
          }')"></div>
        </div>
        <div class="text">
          ${bodyText}
        </div>
      </div>
      <h1 class="name" id="nameElement">${name.toLowerCase()}</h1>
    </div>
    <div id="button-arc-container"></div>
    ${ImageScriptLogic}
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
  <link rel="preload" as="font" crossorigin>
    <style>
      /* Ensure fonts load inside the iframe */
      @font-face {
        font-family: "Welcome Web";
        src: url('/fonts/Welcomeweb-Regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: "Delight";
        src: url('/fonts/delight-regular.woff2') format('woff2');
        font-weight: 400;
        font-style: normal;
        font-display: block;
      }
      @font-face {
        font-family: "Delight";
        src: url('/fonts/delight-black.woff2') format('woff2');
        font-weight: 900;
        font-style: normal;
        font-display: block;
      }
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
        font-size: ${fontSize}px;
        font-weight: 900;
        color: #000;
        text-align: center;
        margin: 0;
        letter-spacing: -0.02em;
        line-height: 0.8;
        white-space: nowrap;
      }
        /* Button Arc Styles */
        .arc-button {
          position: absolute;
          width: 75px;
          height: 75px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          pointer-events: auto;
          font-size: 20px;
          opacity: 0;
          transform-origin: center;
          transition: transform 0.4s ease-in-out; 
        }
  
        .arc-button:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
          transform: scale(1.1) translate(var(--to-x), var(--to-y));
        }
  
        .arc-button.close-button {
          font-size: 28px;
          font-weight: 300;
          color: #374151;
        }
  
        .arc-button.animate-in {
          animation: buttonSlideIn 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
  
        .arc-button.animate-out {
          animation: buttonSlideOut 300ms cubic-bezier(0.25, 0, 1, 2) forwards;
        }

        .arc-button:not(.animate-in):not(.animate-out) {
          transform: translate(var(--to-x), var(--to-y)) scale(1);
        }
  
        @keyframes buttonSlideIn {
          from {
            opacity: 0;
            transform: translate(var(--from-x), var(--from-y)) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(var(--to-x), var(--to-y)) scale(1);
          }
        }
  
        @keyframes buttonSlideOut {
          from {
            opacity: 1;
            transform: translate(var(--to-x), var(--to-y)) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(var(--from-x), var(--from-y)) scale(0.8);
          }
        }
  
        #button-arc-container {
          position: fixed;
          pointer-events: none;
          z-index: 10000;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="main-content">
        <div class="left-column">
          <div class="large-photo img" style="background-image: url('${
            images[0]
          }')"></div>
          <div class="text">
            ${bodyText}
          </div>
        </div>
        <div class="right-column">
          <div class="small-photo img" style="background-image: url('${
            images[1]
          }')"></div>
          <div class="small-photo img" style="background-image: url('${
            images[2]
          }')"></div>
          <div class="small-photo img" style="background-image: url('${
            images[3]
          }')"></div>
          <div class="small-photo img" style="background-image: url('${
            images[4]
          }')"></div>
        </div>
      </div>
      <h1 class="name" id="nameElement">${name.toLowerCase()}</h1>
    </div>
    <div id="button-arc-container"></div>

    ${ImageScriptLogic}
  </body>
  </html>`;

export const defaultBodyValue =
  "April filled my heart with so much joy. I ordained my best friend's wedding, and everybody laughed and cried (as God and my speech intended). I loved building the bulletin with my best friends all day, every day, when I wasn't working at my big-girl job. !!";
