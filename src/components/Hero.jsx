import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import centerImage from "../assets/hero_assets/hero_center.png";
import bgImage from "../assets/hero_assets/bg.png";

const Hero = ({ onPreloadComplete }) => {
  const [text, setText] = useState('Gopishankar');
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const perspectiveRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Lock scroll during animation
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';

    const target = "Developer";
    const start = "Gopishankar";
    let iterations = 0;
    let intervalId;
    let timeoutId;

    const imageLoadPromise = new Promise((resolve) => {
      const img = new window.Image();
      img.src = centerImage;
      if (img.complete) {
        resolve();
      } else {
        img.onload = resolve;
        img.onerror = resolve;
      }
    });

    const delayPromise = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, 1000);
    });

    let isMounted = true;

    Promise.all([imageLoadPromise, delayPromise]).then(() => {
      if (!isMounted) return;

      intervalId = setInterval(() => {
        setText(() => {
          let newText = target.split("").map((letter, index) => {
            if (index < Math.floor(iterations)) {
              return target[index]; // Target letter
            }
            if (index < start.length) {
              return start[index]; // Original letter
            }
            return "";
          }).join("");
          return newText;
        });

        if (iterations >= target.length) {
          clearInterval(intervalId);

          // GSAP Animation Sequence
          const tl = gsap.timeline({
            onComplete: () => {
              document.body.style.overflow = 'auto'; // Unlock scroll
              if (onPreloadComplete) onPreloadComplete(); // Unlock rest of the website
            }
          });

          // 1. Move the central text container up from 50% to its resting place
          const isMobile = window.innerWidth < 768;
          tl.to(containerRef.current, {
            top: isMobile ? "20%" : "45%",
            duration: 1.5,
            ease: "power3.inOut"
          }, "+=0.2"); // slight delay after scramble finishes

          // 1b. 3D flip-reveal of the title itself
          tl.fromTo(textRef.current,
            { rotateX: -70, y: 40, opacity: 0.4, transformPerspective: 1000 },
            { rotateX: 0, y: 0, opacity: 1, duration: 1.4, ease: "power4.out" },
            "-=1.5"
          );

          // 2. Fade and slide up the Subtitle and Buttons
          tl.fromTo([subtitleRef.current, buttonsRef.current],
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power3.out" },
            "-=1.0" // start animating these while the text is still moving up
          );

          // 3. Slide the image upward to the center (no fading)
          tl.fromTo(imageRef.current,
            { y: "100vh" }, // start entirely offscreen at the bottom
            { y: 0, duration: 1.5, ease: "power3.out" },
            "-=1.2" // start sliding up around the same time
          );
        }
        iterations += 1 / 3; // Controls the speed of the letter swap
      }, 50); // 50ms per step
    });

    return () => {
      isMounted = false;
      document.body.style.overflow = 'auto';
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, []);

  // Continuous subtle 3D tilt following the cursor for a "front-facing" letterpress feel
  useEffect(() => {
    const el = perspectiveRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(textRef.current, "rotateY", { duration: 0.6, ease: "power3.out" });
    const yTo = gsap.quickTo(textRef.current, "rotateX", { duration: 0.6, ease: "power3.out" });

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      xTo(relX * 14);
      yTo(-relY * 10);
    };

    const handleLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-end justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `radial-gradient(circle, rgba(34,34,34,0.55) 0%, rgba(0,0,0,0.92) 80%), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      <div
        ref={containerRef}
        className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none flex flex-col items-start w-max"
      >
        <div
          ref={perspectiveRef}
          className="pointer-events-none"
          style={{ perspective: '1200px' }}
        >
          <h1
            ref={textRef}
            className="text-[16vw] md:text-[10rem] lg:text-[14rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 pr-4 md:pr-8 leading-none uppercase will-change-transform"
            style={{
              fontFamily: "'Candara', 'Arial Unicode MS', 'Lucida Sans', 'Lucida Sans Unicode', sans-serif",
              transformStyle: 'preserve-3d',
              textShadow:
                '0px 1px 0 rgba(255,255,255,0.18), 1px 2px 0 rgba(255,255,255,0.14), 2px 3px 0 rgba(204,255,0,0.30), 3px 4px 0 rgba(204,255,0,0.40), 4px 6px 10px rgba(0,0,0,0.55), 8px 12px 26px rgba(0,0,0,0.55)',
              filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.35))',
            }}
          >
            {text}
          </h1>
        </div>

        <p
          ref={subtitleRef}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-12 md:left-8 text-white text-base md:text-2xl lg:text-4xl drop-shadow-md z-10 opacity-0 w-max pointer-events-none"
        >
          <span className="font-bold">Full-Stack Java </span> <span className="font-light italic text-gray-300">Developer</span>
        </p>

        <div
          ref={buttonsRef}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:-bottom-12 md:left-auto md:right-20 flex items-center gap-2 md:gap-4 pointer-events-auto z-10 opacity-0 w-max"
        >
          <a href="#contact" className="group w-8 h-8 md:w-12 md:h-12 rounded-full border border-gray-400/30 flex items-center justify-center backdrop-blur-md bg-black/20 hover:bg-white/10 hover:border-gray-400/50 transition-all duration-300 cursor-pointer">
            <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-300 transition-transform duration-300 group-hover:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17H16M7 17V8" />
            </svg>
          </a>

          <a href="#contact" className="px-4 py-1.5 md:px-6 md:py-2.5 rounded-full border border-gray-400/30 flex items-center justify-center backdrop-blur-md bg-black/20 hover:bg-white/10 hover:border-gray-400/50 transition-all cursor-pointer">
            <span className="text-gray-300 text-xs md:text-base italic font-light tracking-wider">Contact</span>
          </a>
        </div>
      </div>

      <div
        ref={imageRef}
        className="relative z-10 text-center text-white flex flex-col items-center w-full pointer-events-none translate-y-[100vh]"
      >
        <img
          src={centerImage}
          alt="Hero Center Graphic"
          className="w-full max-w-md object-contain drop-shadow-[0_50px_50px_rgba(0,0,0,0.5)]"
        />
      </div>
    </section>
  );
};

export default Hero;
