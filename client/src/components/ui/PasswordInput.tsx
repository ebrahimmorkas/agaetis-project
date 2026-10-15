import { forwardRef, useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Input, type InputProps } from './Input'

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightElement'>>(
  ({ icon = <Lock size={16} />, ...props }, ref) => {
    const [visible, setVisible] = useState(false)

    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        icon={icon}
        rightElement={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-slate-600"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        {...props}
      />
    )
  },
)

PasswordInput.displayName = 'PasswordInput'
