import { isCSSNumberValue } from '../utils/collections';
import {
  DynamicLayoutPipe,
  GetAllScalePropsFunction,
  GetScalePropsFunction,
  ScaleNumberOrStringOrBreakpoint,
  ScalePropKeys,
  ScaleProps,
} from './scale-context';

export const generateGetScaleProps = <P>(props: P & ScaleProps): GetScalePropsFunction => {
  const getScaleProps: GetScalePropsFunction = keyOrKeys => {
    if (!Array.isArray(keyOrKeys)) return props[keyOrKeys as keyof ScaleProps];
    let value: string | undefined | number = undefined;
    for (const key of keyOrKeys) {
      const currentValue = props[key];
      if (typeof currentValue !== 'undefined') {
        if (typeof currentValue === 'object' && 'xs' in currentValue) {
          value = currentValue.xs;
        } else {
          value = currentValue;
        }
      }
    }
    return value;
  };
  return getScaleProps;
};
export const reduceScaleCoefficient = (scale: number) => {
  if (scale === 1) return scale;
  const diff = Math.abs((scale - 1) / 2);
  return scale > 1 ? 1 + diff : 1 - diff;
};

export const makeScaleHandler =
  (attrValue: ScaleNumberOrStringOrBreakpoint | undefined, scale: number, unit: string): DynamicLayoutPipe =>
  (scale1x, defaultValue) => {
    // 0 means disable scale and the default value is 0
    if (scale1x === 0) {
      scale1x = 1;
      defaultValue = defaultValue || 0;
    }
    const factor = reduceScaleCoefficient(scale) * scale1x;
    if (typeof attrValue === 'undefined') {
      if (typeof defaultValue !== 'undefined') return `${defaultValue}`;
      return `calc(${factor} * ${unit})`;
    }

    if (typeof attrValue === 'object' && 'xs' in attrValue) {
      const xsValue = attrValue.xs;
      if (!isCSSNumberValue(xsValue)) return `${xsValue}`;
      const customFactor = factor * Number(xsValue);
      return `calc(${customFactor} * ${unit})`;
    } else {
      if (!isCSSNumberValue(attrValue)) return `${attrValue}`;
      const customFactor = factor * Number(attrValue);
      return `calc(${customFactor} * ${unit})`;
    }
  };

export const generateGetAllScaleProps = <P>(props: P & ScaleProps): GetAllScalePropsFunction => {
  const getAllScaleProps: GetAllScalePropsFunction = () => {
    const scaleProps: ScaleProps = {};
    for (const key of ScalePropKeys) {
      const value = props[key as keyof ScaleProps];
      if (typeof value !== 'undefined') {
        scaleProps[key as keyof ScaleProps] = value as any;
      }
    }
    return scaleProps;
  };
  return getAllScaleProps;
};
