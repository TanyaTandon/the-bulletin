import React from "react";
import { animated, useSpring } from "@react-spring/web";
import styled from "styled-components";

const BUTTON_WIDTH = 240;
const BUTTON_HEIGHT = 56;
const BUTTON_RADIUS = 18;
const ACCENT_PATH =
  "M 26 14 C 10 20 12 40 38 40 S 110 20 150 24 S 208 42 196 50";

const StyledWrapper = styled.div`
  .type--A {
    --line_color: #555555;
    --back_color: #ffecf6;
  }
  .type--B {
    --line_color: #1b1919;
    --back_color: #e9ecff;
  }
  .type--C {
    --line_color: #00135c;
    --back_color: #9dbd99;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ButtonBase = styled(animated.button)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${BUTTON_WIDTH}px;
  height: ${BUTTON_HEIGHT}px;
  border: none;
  padding: 0;
  border-radius: ${BUTTON_RADIUS}px;
  background: transparent;
  color: var(--line_color);
  font-family: "WelcomeWeb";
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 2px;
  cursor: pointer;
  isolation: isolate;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--line_color);
    outline-offset: 4px;
  }
`;

const ButtonLabel = styled.span`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "WelcomeWeb";
  font-weight: inherit;
  font-size: inherit;
  color: currentColor;
`;

const TraceSvg = styled(animated.svg)`
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const AnimatedButton: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const outlineRef = React.useRef<SVGRectElement | null>(null);
  const accentRef = React.useRef<SVGPathElement | null>(null);

  const [outlineLength, setOutlineLength] = React.useState(1);
  const [accentLength, setAccentLength] = React.useState(1);

  React.useEffect(() => {
    if (outlineRef.current) {
      setOutlineLength(outlineRef.current.getTotalLength());
    }
    if (accentRef.current) {
      setAccentLength(accentRef.current.getTotalLength());
    }
  }, []);

  const hoverSpring = useSpring({
    translateY: isHovered ? -4 : 0,
    letterSpacing: isHovered ? 6 : 2,
    fillOpacity: isHovered ? 0.35 : 0,
    strokeDashoffset: isHovered ? 0 : outlineLength,
    accentOffset: isHovered ? 0 : accentLength,
    config: { mass: 1, tension: 240, friction: 22 },
  });

  const handleHoverChange = React.useCallback((value: boolean) => {
    setIsHovered(value);
  }, []);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      onClick();
    },
    [onClick]
  );

  return (
    <StyledWrapper>
      <Container>
        <ButtonBase
          type="button"
          className="button type--C"
          style={{
            transform: hoverSpring.translateY.to(
              (value: number) => `translateY(${value}px)`
            ),
            letterSpacing: hoverSpring.letterSpacing.to(
              (value: number) => `${value}px`
            ),
          }}
          onMouseEnter={() => handleHoverChange(true)}
          onMouseLeave={() => handleHoverChange(false)}
          onFocus={() => handleHoverChange(true)}
          onBlur={() => handleHoverChange(false)}
          onClick={handleClick}
        >
          <ButtonLabel>{children}</ButtonLabel>
          <TraceSvg
            viewBox={`0 0 ${BUTTON_WIDTH} ${BUTTON_HEIGHT}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <animated.rect
              x={6}
              y={6}
              width={BUTTON_WIDTH - 12}
              height={BUTTON_HEIGHT - 12}
              rx={BUTTON_RADIUS - 6}
              fill="var(--back_color)"
              style={{
                opacity: hoverSpring.fillOpacity,
              }}
            />
            <animated.rect
              ref={outlineRef}
              x={1.5}
              y={1.5}
              width={BUTTON_WIDTH - 3}
              height={BUTTON_HEIGHT - 3}
              rx={BUTTON_RADIUS}
              stroke="var(--line_color)"
              strokeWidth={3}
              strokeLinejoin="round"
              fill="none"
              style={{
                strokeDasharray: outlineLength,
                strokeDashoffset: hoverSpring.strokeDashoffset,
              }}
            />
            <animated.path
              ref={accentRef}
              d={ACCENT_PATH}
              stroke="var(--back_color)"
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: accentLength,
                strokeDashoffset: hoverSpring.accentOffset,
              }}
            />
          </TraceSvg>
        </ButtonBase>
      </Container>
    </StyledWrapper>
  );
};

export default AnimatedButton;
