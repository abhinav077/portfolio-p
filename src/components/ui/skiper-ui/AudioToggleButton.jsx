'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import useSound from 'use-sound';

import styles from './AudioToggleButton.module.scss';

const BAR_COUNT = 5;
const BAR_KEYS = ['left', 'left-center', 'center', 'right-center', 'right'];

function getRandomHeights() {
  return Array.from({ length: BAR_COUNT }, () => Math.random() * 0.8 + 0.2);
}

function AudioToggleButton() {
  const [heights, setHeights] = useState(() => Array(BAR_COUNT).fill(0.1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [play, { pause }] = useSound('/audio/piano.m4a', {
    loop: true,
    onplay: () => setIsPlaying(true),
    onpause: () => setIsPlaying(false),
    onstop: () => setIsPlaying(false),
    onend: () => setIsPlaying(false),
    soundEnabled: true,
  });

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(BAR_COUNT).fill(0.1));
      return undefined;
    }

    const waveformIntervalId = setInterval(() => {
      setHeights(getRandomHeights());
    }, 100);

    return () => clearInterval(waveformIntervalId);
  }, [isPlaying]);

  const handleClick = () => {
    if (isPlaying) {
      pause();
      return;
    }

    play();
  };

  return (
    <div id="audio-toggle" className={styles.container}>
      <button
        type="button"
        className={styles.toggle}
        onClick={handleClick}
        aria-label={isPlaying ? 'Pause background piano music' : 'Play background piano music'}
        aria-pressed={isPlaying}
        title={isPlaying ? 'Pause background piano music' : 'Play background piano music'}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isPlaying ? (
            <motion.span
              key="waveform"
              className={styles.waveform}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {heights.map((height, index) => (
                <motion.span
                  key={BAR_KEYS[index]}
                  className={styles.bar}
                  initial={{ height: 1 }}
                  animate={{ height: Math.max(4, height * 14) }}
                  transition={{ type: 'spring', stiffness: 300, damping: 10 }}
                />
              ))}
            </motion.span>
          ) : (
            <motion.span
              key="prompt"
              className={styles.playText}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.2 }}
            >
              <span>click to</span>
              <span>play music</span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default AudioToggleButton;
