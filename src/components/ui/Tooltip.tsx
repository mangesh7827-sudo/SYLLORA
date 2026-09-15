import { cloneElement, isValidElement, useId, type PropsWithChildren, type ReactElement } from 'react';

type Props = PropsWithChildren<{ label: string }>;

export function Tooltip({ children, label }: Props) {
  const id = useId();
  const child = isValidElement(children) ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': id }) : children;
  return <span className="ui-tooltip"><span id={id} role="tooltip" className="ui-tooltip__content">{label}</span>{child}</span>;
}
