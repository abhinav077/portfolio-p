import { useRef } from 'react';

import DomeGallery from '@src/components/ui/DomeGallery';
import InfiniteText from '@src/components/animationComponents/infiniteText/Index';
import clsx from 'clsx';
import { gsap } from 'gsap';
import { homeGalleryImages } from '@src/data/homeGalleryImages';
import styles from '@src/pages/components/home/styles/home.module.scss';
import useIsMobile from '@src/hooks/useIsMobile';
import { useIsomorphicLayoutEffect } from '@src/hooks/useIsomorphicLayoutEffect';

function Home() {
  const isMobile = useIsMobile();
  const rootRef = useRef();
  const infiniteTextRef = useRef();

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top+=3%',
            end: 'top+=5%',
            toggleActions: 'play none reverse none',
            scroller: document.querySelector('main'),
            invalidateOnRefresh: true,
          },
        })
        .to(infiniteTextRef.current, {
          opacity: 0,
          duration: 0.6,
        });
    });

    return () => ctx.kill();
  }, []);

  return (
    <section ref={rootRef} className={clsx(styles.root)}>
      <div className={clsx(styles.topContainer, 'layout-grid-inner')}>
        <div className={styles.leftContainer}>
          <h2 className="h2">Self-taught</h2>
          <h2 className={clsx('h3', 'happyboys', 'regular', styles.performer)}>
            pianist, teacher & performer
          </h2>
        </div>
        {!isMobile && (
          <h6 className={clsx('h6', styles.rightContainer)}>
            Sharing the joy of music through live performances and private piano
            lessons for students of all ages and levels.
          </h6>
        )}
      </div>

      <div className={styles.bottomContainer}>
        <DomeGallery
          images={homeGalleryImages}
          segments={isMobile ? 26 : 54}
          grayscale={false}
          dragDampening={5}
          maxVerticalRotationDeg={0}
          minRadius={isMobile ? 500 : 1500}
          openedImageWidth={isMobile ? '300px' : '400px'}
          openedImageHeight={isMobile ? '300px' : '400px'}
          overlayBlurColor="transparent"
          imageBorderRadius={isMobile ? '20%' : '30px'}
          autoRotate
          autoRotateSpeed={0.1}
        />
      </div>
      {isMobile && (
        <div className={styles.rightContainerMobile}>
          <h6 className="h6">
            Sharing the joy of music through live performances and private piano
            lessons for students of all ages and levels.
          </h6>
        </div>
      )}

      <div ref={infiniteTextRef} className={styles.infiniteContainer}>
        <InfiniteText text="Scroll Down" length={5} />
      </div>
    </section>
  );
}

export default Home;
