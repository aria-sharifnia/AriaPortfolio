import type {
  FC,
  AnchorHTMLAttributes,
  ReactNode,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import { useRipple } from '../../../hooks/useRipple'
import './PrimaryButton.css'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }

const PrimaryButton: FC<Props> = ({ children, className = '', onClick, ...rest }) => {
  const ripple = useRipple()
  return (
    <a
      {...rest}
      className={`btn ${className}`}
      onPointerDown={(e: ReactPointerEvent<HTMLAnchorElement>) => ripple(e)}
      onClick={(e: ReactMouseEvent<HTMLAnchorElement>) => onClick?.(e)}
    >
      <span className="btn__content">{children}</span>
    </a>
  )
}

export default PrimaryButton
