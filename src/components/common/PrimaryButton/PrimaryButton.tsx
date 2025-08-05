import type { FC } from 'react'
import { useRipple } from '../../../hooks/useRipple'
import './PrimaryButton.css'

const PrimaryButton: FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }
> = ({ children, className = '', ...rest }) => {
  const ripple = useRipple()
  return (
    <a
      {...rest}
      onClick={(e) => {
        ripple(e)
        rest.onClick?.(e)
      }}
      className={`relative inline-flex items-center gap-2 overflow-hidden 
                  focus:outline-none ${className}`}
    >
      {children}
    </a>
  )
}

export default PrimaryButton
