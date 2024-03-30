'use client';

import { Splide as SplideCore } from '@splidejs/splide';
import { omit } from 'lodash';
import React, { useEffect, useLayoutEffect } from 'react';
import { SliderOptions, SplideProps } from '.';
import { ArrowLeft, ArrowRight } from '../icons';
import useScale, { withScale } from '../use-scale';
import { pickChild } from '../utils/collections';
import { CarouselItem } from './carousel-item';
import CarouseStyles from './carousel-styles';
import { CarouselTrack } from './carousel-track';
import { EVENTS } from './constants/events';
import { classNames, merge } from './utils';

const classOverride = {
  arrows: 'carousel_arrows',
  arrow: 'carousel_arrow',
  prev: 'carousel_arrow--prev',
  next: 'carousel_arrow--next',
  pagination: 'splide__pagination',
  page: 'splide__pagination_item',
};

const CarouselComponent: React.FC<React.PropsWithChildren<SplideProps>> = ({
  children,
  options = {},
  extensions,
  transition,
  className,
  arrowSize = 38,
  ...props
}) => {
  const { SCALER, SCALE_CLASSES, RESPONSIVE } = useScale();
  const splideRef = React.createRef<HTMLDivElement>();
  const [, slides] = pickChild(children, CarouselItem);
  let splide: SplideCore | undefined = undefined;

  const { prevIcon, nextIcon } = options;

  const cleanUp = () => {
    if (splide) {
      splide.destroy();
      splide = undefined;
    }
  };

  const init = () => {
    if (splideRef && splideRef.current) {
      cleanUp();

      const overrideOptions: SliderOptions = merge({ classes: classOverride }, options || {});
      splide = new SplideCore(splideRef.current, overrideOptions);
      bind();
      splide.mount(extensions, transition);
    }
  };

  const bind = () => {
    EVENTS.forEach(([event, name]) => {
      if (typeof name === 'string') {
        const handler = props[name];

        if (typeof handler === 'function' && splide) {
          splide.on(event, (...args: any[]) => {
            if (splide) {
              handler(splide, ...args);
            }
          });
        }
      }
    });
  };

  useEffect(() => {
    init();
    return () => {
      cleanUp();
    };
  }, []);

  useEffect(() => {
    if (splide) {
      const overrideOptions: SliderOptions = merge({ classes: classOverride }, options || {});
      splide.options = overrideOptions;
    }
  }, [options]);

  useLayoutEffect(() => {
    if (splide) {
      splide.refresh();
    }
  }, [slides]);

  const htmlOps = omit(props, [...EVENTS.map(event => event[1])]);

  return (
    <CarouseStyles arrowSize={arrowSize}>
      <div className={classNames('splide', className, SCALE_CLASSES)} ref={splideRef} {...htmlOps}>
        <div className="splide-inner">
          <CarouselTrack>{slides}</CarouselTrack>
          <div className="splide__arrows">
            <button className="splide__arrow splide__arrow--prev" type="button">
              <div className="splide__arrow__inner">{prevIcon ? prevIcon : <ArrowLeft />}</div>
            </button>
            <button className="splide__arrow splide__arrow--next" type="button">
              <div className="splide__arrow__inner">{nextIcon ? nextIcon : <ArrowRight />}</div>
            </button>
          </div>
        </div>
        <ul className="splide__pagination"></ul>
      </div>

      <style jsx>{`
        ${RESPONSIVE.h(1, value => `height: ${value};`, 'auto', 'splide')}
        ${RESPONSIVE.w(1, value => `width: ${value};`, '100%', 'splide')}

        ${RESPONSIVE.margin(0, value => `margin: ${value.top} ${value.right} ${value.bottom} ${value.left};`, undefined, 'splide')}
        ${RESPONSIVE.padding(0, value => `padding: ${value.top} ${value.right} ${value.bottom} ${value.left};`, undefined, 'splide')}
        ${SCALER('splide')}
      `}</style>
    </CarouseStyles>
  );
};

CarouselComponent.displayName = 'HimalayaCarousel';
const Carousel = withScale(CarouselComponent);
export default Carousel;
