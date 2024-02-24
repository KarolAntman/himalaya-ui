'use client';
import React, { useMemo } from 'react';
import useTheme from '../use-theme';
import { useSelectContext } from './select-context';
import useWarning from '../utils/use-warning';
import Ellipsis from '../shared/ellipsis';
import useScale, { withScale } from '../use-scale';
import useClasses from '../use-classes';

interface Props {
  value?: string;
  disabled?: boolean;
  className?: string;
  divider?: boolean;
  label?: boolean;
  preventAllEvents?: boolean;
}

type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>;
export type SelectOptionProps = Props & NativeAttrs;

const SelectOptionComponent: React.FC<React.PropsWithChildren<SelectOptionProps>> = ({
  value: identValue,
  className = '',
  children,
  disabled = false,
  divider = false,
  label = false,
  preventAllEvents = false,
  ...props
}: React.PropsWithChildren<SelectOptionProps>) => {
  const theme = useTheme();
  const { SCALES } = useScale();
  const { updateValue, value, disableAll } = useSelectContext();
  const isDisabled = useMemo(() => disabled || disableAll, [disabled, disableAll]);
  const isLabel = useMemo(() => label || divider, [label, divider]);
  const classes = useClasses('option', { divider, label }, className);
  if (!isLabel && identValue === undefined) {
    useWarning('The props "value" is required.', 'Select Option');
  }

  const selected = useMemo(() => {
    if (!value) return false;
    if (typeof value === 'string') {
      return identValue === value;
    }
    return value.includes(`${identValue}`);
  }, [identValue, value]);

  const bgColor = useMemo(() => {
    if (isDisabled) return theme.palette.accents_1;
    return selected ? theme.palette.accents_2 : theme.palette.background;
  }, [selected, isDisabled, theme.palette]);

  const hoverBgColor = useMemo(() => {
    if (isDisabled || isLabel || selected) return bgColor;
    return theme.palette.accents_1;
  }, [selected, isDisabled, theme.palette, isLabel, bgColor]);

  const color = useMemo(() => {
    if (isDisabled) return theme.palette.accents_4;
    return selected ? theme.palette.foreground : theme.palette.accents_5;
  }, [selected, isDisabled, theme.palette]);

  const clickHandler = (event: React.MouseEvent<HTMLDivElement>) => {
    if (preventAllEvents) return;
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    event.preventDefault();
    if (isDisabled || isLabel) return;
    updateValue && updateValue(identValue);
  };

  return (
    <div className={classes} onClick={clickHandler} {...props}>
      <Ellipsis height={SCALES.h(2.25)}>{children}</Ellipsis>
      <style jsx>{`
        .option {
          display: flex;
          max-width: 100%;
          box-sizing: border-box;
          justify-content: flex-start;
          align-items: center;
          font-weight: normal;
          background-color: ${bgColor};
          color: ${color};
          user-select: none;
          border: 0;
          cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
          transition:
            background 0.2s ease 0s,
            border-color 0.2s ease 0s;
          --select-font-size: ${SCALES.font(0.75)};
          font-size: var(--select-font-size);
          width: ${SCALES.w(1, '100%')};
          height: ${SCALES.h(2.25)};
          padding: ${SCALES.pt(0)} ${SCALES.pr(0.667)} ${SCALES.pb(0)} ${SCALES.pl(0.667)};
          margin: ${SCALES.mt(0)} ${SCALES.mr(0)} ${SCALES.mb(0)} ${SCALES.ml(0)};
        }

        .option:hover {
          background-color: ${hoverBgColor};
          color: ${theme.palette.accents_7};
        }

        .divider {
          line-height: 0;
          overflow: hidden;
          border-top: 1px solid ${theme.palette.border};
          width: ${SCALES.w(1, '100%')};
          height: ${SCALES.h(1, 0)};
          padding: ${SCALES.pt(0)} ${SCALES.pr(0)} ${SCALES.pb(0)} ${SCALES.pl(0)};
          margin: ${SCALES.mt(0.5)} ${SCALES.mr(0)} ${SCALES.mb(0.5)} ${SCALES.ml(0)};
        }

        .label {
          color: ${theme.palette.accents_7};
          border-bottom: 1px solid ${theme.palette.border};
          text-transform: capitalize;
          cursor: default;
          font-size: ${SCALES.font(0.875)};
          width: ${SCALES.w(1, '100%')};
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

SelectOptionComponent.displayName = 'HimalayaSelectOption';
const SelectOption = withScale(SelectOptionComponent);
export default SelectOption;
